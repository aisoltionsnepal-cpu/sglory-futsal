const { cors, getPool, initDB } = require('../lib/db');
const { getUser, ensureDB } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const t = await getPool().query('SELECT COALESCE(SUM(total_price),0) as total,COALESCE(SUM(quantity),0) as items FROM sales WHERE sale_date=CURRENT_DATE');
  const tb = await getPool().query('SELECT i.brand,i.item_type,SUM(s.quantity) as qty,SUM(s.total_price) as revenue FROM sales s JOIN inventory i ON s.inventory_id=i.id WHERE s.sale_date=CURRENT_DATE GROUP BY i.brand,i.item_type');
  const m = await getPool().query("SELECT COALESCE(SUM(total_price),0) as total FROM sales WHERE DATE_TRUNC('month',sale_date)=DATE_TRUNC('month',CURRENT_DATE)");
  return res.json({
    today: { total: parseFloat(t.rows[0].total), items: parseInt(t.rows[0].items), byBrand: tb.rows.map(b => ({ brand: b.brand, itemType: b.item_type, qty: parseInt(b.qty), revenue: parseFloat(b.revenue) })) },
    month: { total: parseFloat(m.rows[0].total) }
  });
};
