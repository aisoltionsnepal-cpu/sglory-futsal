const express = require('express');
const { pool } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../db/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'sales') {
      query = `
        SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name
        FROM sales s
        JOIN inventory i ON s.inventory_id = i.id
        JOIN users u ON s.sold_by = u.id
        WHERE s.sold_by = $1
        ORDER BY s.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name
        FROM sales s
        JOIN inventory i ON s.inventory_id = i.id
        JOIN users u ON s.sold_by = u.id
        ORDER BY s.created_at DESC
      `;
      params = [];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/today', authenticateToken, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'sales') {
      query = `
        SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name
        FROM sales s
        JOIN inventory i ON s.inventory_id = i.id
        JOIN users u ON s.sold_by = u.id
        WHERE s.sale_date = CURRENT_DATE AND s.sold_by = $1
        ORDER BY s.created_at DESC
      `;
      params = [req.user.id];
    } else {
      query = `
        SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name
        FROM sales s
        JOIN inventory i ON s.inventory_id = i.id
        JOIN users u ON s.sold_by = u.id
        WHERE s.sale_date = CURRENT_DATE
        ORDER BY s.created_at DESC
      `;
      params = [];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const todayTotal = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as total, COALESCE(SUM(quantity), 0) as items
      FROM sales WHERE sale_date = CURRENT_DATE
    `);

    const todayByBrand = await pool.query(`
      SELECT i.brand, i.item_type, SUM(s.quantity) as qty, SUM(s.total_price) as revenue
      FROM sales s
      JOIN inventory i ON s.inventory_id = i.id
      WHERE s.sale_date = CURRENT_DATE
      GROUP BY i.brand, i.item_type
    `);

    const monthTotal = await pool.query(`
      SELECT COALESCE(SUM(total_price), 0) as total
      FROM sales WHERE DATE_TRUNC('month', sale_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    res.json({
      today: {
        total: parseFloat(todayTotal.rows[0].total),
        items: parseInt(todayTotal.rows[0].items),
        byBrand: todayByBrand.rows.map(b => ({
          brand: b.brand, itemType: b.item_type,
          qty: parseInt(b.qty), revenue: parseFloat(b.revenue)
        }))
      },
      month: { total: parseFloat(monthTotal.rows[0].total) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const startDate = from || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const endDate = to || new Date().toISOString().split('T')[0];

    const dailySales = await pool.query(`
      SELECT sale_date as date, SUM(total_price) as revenue, SUM(quantity) as items
      FROM sales WHERE sale_date BETWEEN $1 AND $2
      GROUP BY sale_date ORDER BY sale_date DESC
    `, [startDate, endDate]);

    const byBrand = await pool.query(`
      SELECT i.brand, i.item_type, SUM(s.quantity) as qty, SUM(s.total_price) as revenue
      FROM sales s
      JOIN inventory i ON s.inventory_id = i.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY i.brand, i.item_type ORDER BY revenue DESC
    `, [startDate, endDate]);

    const bySeller = await pool.query(`
      SELECT u.full_name as name, SUM(s.total_price) as revenue, COUNT(*) as transactions
      FROM sales s
      JOIN users u ON s.sold_by = u.id
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY u.id, u.full_name ORDER BY revenue DESC
    `, [startDate, endDate]);

    res.json({
      dailySales: dailySales.rows.map(d => ({ date: d.date, revenue: parseFloat(d.revenue), items: parseInt(d.items) })),
      byBrand: byBrand.rows.map(b => ({ brand: b.brand, itemType: b.item_type, qty: parseInt(b.qty), revenue: parseFloat(b.revenue) })),
      bySeller: bySeller.rows.map(s => ({ name: s.name, revenue: parseFloat(s.revenue), transactions: parseInt(s.transactions) })),
      period: { from: startDate, to: endDate }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { inventoryId, quantity } = req.body;
    if (!inventoryId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid item and quantity required' });
    }

    await client.query('BEGIN');

    const itemResult = await client.query('SELECT * FROM inventory WHERE id = $1 FOR UPDATE', [inventoryId]);
    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = itemResult.rows[0];
    if (item.stock_in_pieces < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Insufficient stock. Available: ${item.stock_in_pieces}` });
    }

    const totalPrice = parseFloat(item.price_per_piece) * quantity;

    const saleResult = await client.query(
      'INSERT INTO sales (inventory_id, quantity, total_price, sold_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [inventoryId, quantity, totalPrice, req.user.id]
    );

    await client.query(
      'UPDATE inventory SET stock_in_pieces = stock_in_pieces - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [quantity, inventoryId]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Sale recorded', sale: saleResult.rows[0], total: totalPrice });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
