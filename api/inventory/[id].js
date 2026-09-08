const { cors, getPool, initDB } = require('../_lib/db');
const { getUser, ensureDB } = require('../_lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.query.id;
  if (req.method === 'PUT') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { itemName, itemType, brand, pricePerPiece, packSize, stockInPieces } = req.body;
    const r = await getPool().query('UPDATE inventory SET item_name=COALESCE($1,item_name),item_type=COALESCE($2,item_type),brand=COALESCE($3,brand),price_per_piece=COALESCE($4,price_per_piece),pack_size=COALESCE($5,pack_size),stock_in_pieces=COALESCE($6,stock_in_pieces),updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING *', [itemName, itemType, brand, pricePerPiece, packSize, stockInPieces, id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(r.rows[0]);
  }
  if (req.method === 'DELETE') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const r = await getPool().query('DELETE FROM inventory WHERE id=$1 RETURNING id', [id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    return res.json({ message: 'Deleted' });
  }
  return res.status(404).json({ error: 'Not found' });
};
