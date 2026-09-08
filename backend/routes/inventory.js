const express = require('express');
const { pool } = require('../db/schema');
const { authenticateToken, requireAdmin } = require('../db/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY item_type, brand');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    if (!itemName || !itemType || !brand || !pricePerPiece || !packSize) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const result = await pool.query(
      'INSERT INTO inventory (item_name, item_type, brand, price_per_piece, pack_size, stock_in_pieces) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    const result = await pool.query(
      `UPDATE inventory SET
        item_name = COALESCE($1, item_name),
        item_type = COALESCE($2, item_type),
        brand = COALESCE($3, brand),
        price_per_piece = COALESCE($4, price_per_piece),
        pack_size = COALESCE($5, pack_size),
        stock_in_pieces = COALESCE($6, stock_in_pieces),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 RETURNING *`,
      [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/restock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, packs } = req.body;
    if (!id || !packs || packs <= 0) {
      return res.status(400).json({ error: 'Valid item ID and packs required' });
    }

    const item = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (item.rows.length === 0) return res.status(404).json({ error: 'Item not found' });

    const inv = item.rows[0];
    const addedPieces = packs * inv.pack_size;
    const result = await pool.query(
      'UPDATE inventory SET stock_in_pieces = stock_in_pieces + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [addedPieces, id]
    );

    res.json({ message: `Added ${packs} packs (${addedPieces} pieces) to ${inv.brand}`, item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
