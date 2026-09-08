const { cors, getPool, initDB } = require('../lib/db');
const { getUser, ensureDB } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const r = await getPool().query('SELECT * FROM inventory ORDER BY item_type, brand');
    return res.json(r.rows);
  }
  if (req.method === 'POST') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    const r = await getPool().query('INSERT INTO inventory (item_name,item_type,brand,price_per_piece,pack_size,stock_in_pieces) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces || 0]);
    return res.status(201).json(r.rows[0]);
  }
  return res.status(404).json({ error: 'Not found' });
};
