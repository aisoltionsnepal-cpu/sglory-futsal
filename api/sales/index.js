const { cors, getPool, initDB } = require('../lib/db');
const { getUser } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (!ready) { await initDB(); ready = true; }
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'GET') {
      const url = new URL(req.url, 'http://localhost');
      const path = url.pathname.split('/').pop();

      if (path === 'today') {
        const f = user.role === 'sales' ? 'AND s.sold_by=$1' : '';
        const p = user.role === 'sales' ? [user.id] : [];
        const r = await getPool().query(`SELECT s.*,i.brand,i.item_name,i.item_type,i.price_per_piece,u.full_name as seller_name FROM sales s JOIN inventory i ON s.inventory_id=i.id JOIN users u ON s.sold_by=u.id WHERE s.sale_date=CURRENT_DATE ${f} ORDER BY s.created_at DESC`, p);
        return res.json(r.rows);
      }

      if (path === 'summary') {
        const t = await getPool().query('SELECT COALESCE(SUM(total_price),0) as total,COALESCE(SUM(quantity),0) as items FROM sales WHERE sale_date=CURRENT_DATE');
        const tb = await getPool().query('SELECT i.brand,i.item_type,SUM(s.quantity) as qty,SUM(s.total_price) as revenue FROM sales s JOIN inventory i ON s.inventory_id=i.id WHERE s.sale_date=CURRENT_DATE GROUP BY i.brand,i.item_type');
        const m = await getPool().query("SELECT COALESCE(SUM(total_price),0) as total FROM sales WHERE DATE_TRUNC('month',sale_date)=DATE_TRUNC('month',CURRENT_DATE)");
        return res.json({
          today: { total: parseFloat(t.rows[0].total), items: parseInt(t.rows[0].items), byBrand: tb.rows.map(b => ({ brand: b.brand, itemType: b.item_type, qty: parseInt(b.qty), revenue: parseFloat(b.revenue) })) },
          month: { total: parseFloat(m.rows[0].total) }
        });
      }

      const f = user.role === 'sales' ? 'WHERE s.sold_by=$1' : '';
      const p = user.role === 'sales' ? [user.id] : [];
      const r = await getPool().query(`SELECT s.*,i.brand,i.item_name,i.item_type,i.price_per_piece,u.full_name as seller_name FROM sales s JOIN inventory i ON s.inventory_id=i.id JOIN users u ON s.sold_by=u.id ${f} ORDER BY s.created_at DESC`, p);
      return res.json(r.rows);
    }

    if (req.method === 'POST') {
      const { inventoryId, quantity } = req.body;
      if (!inventoryId || !quantity || quantity <= 0) return res.status(400).json({ error: 'Valid item and quantity required' });
      const client = await getPool().connect();
      try {
        await client.query('BEGIN');
        const ir = await client.query('SELECT * FROM inventory WHERE id=$1 FOR UPDATE', [inventoryId]);
        if (ir.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Item not found' }); }
        const item = ir.rows[0];
        if (item.stock_in_pieces < quantity) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Insufficient stock. Available: ${item.stock_in_pieces}` }); }
        const tp = parseFloat(item.price_per_piece) * quantity;
        const sr = await client.query('INSERT INTO sales (inventory_id,quantity,total_price,sold_by) VALUES ($1,$2,$3,$4) RETURNING *', [inventoryId, quantity, tp, user.id]);
        await client.query('UPDATE inventory SET stock_in_pieces=stock_in_pieces-$1,updated_at=CURRENT_TIMESTAMP WHERE id=$2', [quantity, inventoryId]);
        await client.query('COMMIT');
        return res.status(201).json({ message: 'Sale recorded', sale: sr.rows[0], total: tp });
      } catch (e) { await client.query('ROLLBACK'); return res.status(500).json({ error: 'Server error' }); } finally { client.release(); }
    }
    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
