const { cors, getPool, initDB } = require('../lib/db');
const { getUser, ensureDB } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const f = user.role === 'sales' ? 'AND s.sold_by=$1' : '';
  const p = user.role === 'sales' ? [user.id] : [];
  const r = await getPool().query(`SELECT s.*,i.brand,i.item_name,i.item_type,i.price_per_piece,u.full_name as seller_name FROM sales s JOIN inventory i ON s.inventory_id=i.id JOIN users u ON s.sold_by=u.id WHERE s.sale_date=CURRENT_DATE ${f} ORDER BY s.created_at DESC`, p);
  return res.json(r.rows);
};
