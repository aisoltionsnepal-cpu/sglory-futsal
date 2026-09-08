const { pool, initDB } = require('../db');
const { authenticateToken } = require('../auth-middleware');

let dbReady = false;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!dbReady) { await initDB(); dbReady = true; }

  const user = await authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET' && req.url.includes('/today')) {
    const filter = user.role === 'sales' ? 'AND s.sold_by = $1' : '';
    const params = user.role === 'sales' ? [user.id] : [];
    const result = await pool.query(`SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name FROM sales s JOIN inventory i ON s.inventory_id = i.id JOIN users u ON s.sold_by = u.id WHERE s.sale_date = CURRENT_DATE ${filter} ORDER BY s.created_at DESC`, params);
    return res.json(result.rows);
  }

  if (req.method === 'GET' && req.url.includes('/summary')) {
    const todayTotal = await pool.query('SELECT COALESCE(SUM(total_price),0) as total, COALESCE(SUM(quantity),0) as items FROM sales WHERE sale_date = CURRENT_DATE');
    const todayByBrand = await pool.query(`SELECT i.brand, i.item_type, SUM(s.quantity) as qty, SUM(s.total_price) as revenue FROM sales s JOIN inventory i ON s.inventory_id = i.id WHERE s.sale_date = CURRENT_DATE GROUP BY i.brand, i.item_type`);
    const monthTotal = await pool.query("SELECT COALESCE(SUM(total_price),0) as total FROM sales WHERE DATE_TRUNC('month',sale_date)=DATE_TRUNC('month',CURRENT_DATE)");
    return res.json({
      today: { total: parseFloat(todayTotal.rows[0].total), items: parseInt(todayTotal.rows[0].items), byBrand: todayByBrand.rows.map(b => ({ brand: b.brand, itemType: b.item_type, qty: parseInt(b.qty), revenue: parseFloat(b.revenue) })) },
      month: { total: parseFloat(monthTotal.rows[0].total) }
    });
  }

  if (req.method === 'GET' && req.url.includes('/report')) {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const url = new URL(req.url, 'http://localhost');
    const from = url.searchParams.get('from') || new Date(Date.now()-30*86400000).toISOString().split('T')[0];
    const to = url.searchParams.get('to') || new Date().toISOString().split('T')[0];
    const daily = await pool.query('SELECT sale_date as date, SUM(total_price) as revenue, SUM(quantity) as items FROM sales WHERE sale_date BETWEEN $1 AND $2 GROUP BY sale_date ORDER BY sale_date DESC', [from, to]);
    const byBrand = await pool.query('SELECT i.brand, i.item_type, SUM(s.quantity) as qty, SUM(s.total_price) as revenue FROM sales s JOIN inventory i ON s.inventory_id=i.id WHERE s.sale_date BETWEEN $1 AND $2 GROUP BY i.brand, i.item_type ORDER BY revenue DESC', [from, to]);
    const bySeller = await pool.query('SELECT u.full_name as name, SUM(s.total_price) as revenue, COUNT(*) as transactions FROM sales s JOIN users u ON s.sold_by=u.id WHERE s.sale_date BETWEEN $1 AND $2 GROUP BY u.id, u.full_name ORDER BY revenue DESC', [from, to]);
    return res.json({ dailySales: daily.rows.map(d => ({date:d.date, revenue:parseFloat(d.revenue), items:parseInt(d.items)})), byBrand: byBrand.rows.map(b => ({brand:b.brand, itemType:b.item_type, qty:parseInt(b.qty), revenue:parseFloat(b.revenue)})), bySeller: bySeller.rows.map(s => ({name:s.name, revenue:parseFloat(s.revenue), transactions:parseInt(s.transactions)})), period: {from, to} });
  }

  if (req.method === 'GET') {
    const filter = user.role === 'sales' ? 'WHERE s.sold_by = $1' : '';
    const params = user.role === 'sales' ? [user.id] : [];
    const result = await pool.query(`SELECT s.*, i.brand, i.item_name, i.item_type, i.price_per_piece, u.full_name as seller_name FROM sales s JOIN inventory i ON s.inventory_id=i.id JOIN users u ON s.sold_by=u.id ${filter} ORDER BY s.created_at DESC`, params);
    return res.json(result.rows);
  }

  if (req.method === 'POST') {
    const { inventoryId, quantity } = req.body;
    if (!inventoryId || !quantity || quantity <= 0) return res.status(400).json({ error: 'Valid item and quantity required' });
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const itemResult = await client.query('SELECT * FROM inventory WHERE id = $1 FOR UPDATE', [inventoryId]);
      if (itemResult.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Item not found' }); }
      const item = itemResult.rows[0];
      if (item.stock_in_pieces < quantity) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Insufficient stock. Available: ${item.stock_in_pieces}` }); }
      const totalPrice = parseFloat(item.price_per_piece) * quantity;
      const saleResult = await client.query('INSERT INTO sales (inventory_id, quantity, total_price, sold_by) VALUES ($1,$2,$3,$4) RETURNING *', [inventoryId, quantity, totalPrice, user.id]);
      await client.query('UPDATE inventory SET stock_in_pieces = stock_in_pieces - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [quantity, inventoryId]);
      await client.query('COMMIT');
      return res.status(201).json({ message: 'Sale recorded', sale: saleResult.rows[0], total: totalPrice });
    } catch (err) { await client.query('ROLLBACK'); return res.status(500).json({ error: 'Server error' }); } finally { client.release(); }
  }

  return res.status(404).json({ error: 'Not found' });
};
