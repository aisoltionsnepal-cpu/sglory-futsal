const { cors, getPool, initDB } = require('../lib/db');
const { getUser, ensureDB } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (!ready) { await initDB(); ready = true; }
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const url = new URL(req.url, 'http://localhost');
    const from = url.searchParams.get('from') || new Date(Date.now()-30*86400000).toISOString().split('T')[0];
    const to = url.searchParams.get('to') || new Date().toISOString().split('T')[0];
    const d = await getPool().query('SELECT sale_date as date,SUM(total_price) as revenue,SUM(quantity) as items FROM sales WHERE sale_date BETWEEN $1 AND $2 GROUP BY sale_date ORDER BY sale_date DESC', [from, to]);
    const b = await getPool().query('SELECT i.brand,i.item_type,SUM(s.quantity) as qty,SUM(s.total_price) as revenue FROM sales s JOIN inventory i ON s.inventory_id=i.id WHERE s.sale_date BETWEEN $1 AND $2 GROUP BY i.brand,i.item_type ORDER BY revenue DESC', [from, to]);
    const s = await getPool().query('SELECT u.full_name as name,SUM(s.total_price) as revenue,COUNT(*) as transactions FROM sales s JOIN users u ON s.sold_by=u.id WHERE s.sale_date BETWEEN $1 AND $2 GROUP BY u.id,u.full_name ORDER BY revenue DESC', [from, to]);
    return res.json({
      dailySales: d.rows.map(x => ({date:x.date,revenue:parseFloat(x.revenue),items:parseInt(x.items)})),
      byBrand: b.rows.map(x => ({brand:x.brand,itemType:x.item_type,qty:parseInt(x.qty),revenue:parseFloat(x.revenue)})),
      bySeller: s.rows.map(x => ({name:x.name,revenue:parseFloat(x.revenue),transactions:parseInt(x.transactions)})),
      period: {from, to}
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
