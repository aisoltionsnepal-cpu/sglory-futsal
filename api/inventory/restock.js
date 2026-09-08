const { cors, getPool, initDB } = require('../lib/db');
const { getUser, ensureDB } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, packs } = req.body;
  if (!id || !packs || packs <= 0) return res.status(400).json({ error: 'Valid item ID and packs required' });
  const item = await getPool().query('SELECT * FROM inventory WHERE id=$1', [id]);
  if (item.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
  const inv = item.rows[0];
  const added = packs * inv.pack_size;
  const r = await getPool().query('UPDATE inventory SET stock_in_pieces=stock_in_pieces+$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2 RETURNING *', [added, id]);
  return res.json({ message: `Added ${packs} packs`, item: r.rows[0] });
};
