const { cors } = require('../lib/db');
const { ensureDB, getUser, JWT_SECRET } = require('../lib/auth');
const jwt = require('jsonwebtoken');
const { getPool } = require('../lib/db');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    await ensureDB();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const auth = req.headers.authorization;
    const token = auth && auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const r = await getPool().query('SELECT id, username, role, full_name FROM users WHERE id = $1', [decoded.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    return res.json(r.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
