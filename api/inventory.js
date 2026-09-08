const { pool, initDB } = require('../db');
const { authenticateToken } = require('../auth-middleware');

let dbReady = false;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!dbReady) { await initDB(); dbReady = true; }

  const user = await authenticateToken(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const result = await pool.query('SELECT * FROM inventory ORDER BY item_type, brand');
    return res.json(result.rows);
  }

  if (req.method === 'POST' && req.url.endsWith('/restock')) {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { id, packs } = req.body;
    if (!id || !packs || packs <= 0) return res.status(400).json({ error: 'Valid item ID and packs required' });
    const item = await pool.query('SELECT * FROM inventory WHERE id = $1', [id]);
    if (item.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    const inv = item.rows[0];
    const addedPieces = packs * inv.pack_size;
    const result = await pool.query('UPDATE inventory SET stock_in_pieces = stock_in_pieces + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *', [addedPieces, id]);
    return res.json({ message: `Added ${packs} packs`, item: result.rows[0] });
  }

  if (req.method === 'POST') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    const result = await pool.query('INSERT INTO inventory (item_name, item_type, brand, price_per_piece, pack_size, stock_in_pieces) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces || 0]);
    return res.status(201).json(result.rows[0]);
  }

  if (req.method === 'PUT') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const id = req.url.split('/').pop();
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    const result = await pool.query('UPDATE inventory SET item_name=COALESCE($1,item_name), item_type=COALESCE($2,item_type), brand=COALESCE($3,brand), price_per_piece=COALESCE($4,price_per_piece), pack_size=COALESCE($5,pack_size), stock_in_pieces=COALESCE($6,stock_in_pieces), updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *', [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    return res.json(result.rows[0]);
  }

  if (req.method === 'DELETE') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const id = req.url.split('/').pop();
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    return res.json({ message: 'Item deleted' });
  }

  return res.status(404).json({ error: 'Not found' });
};
