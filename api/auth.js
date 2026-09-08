const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, initDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'sglory_futsal_secret_2026';
let dbReady = false;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!dbReady) { await initDB(); dbReady = true; }

  if (req.method === 'POST' && req.url.endsWith('/login')) {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const result = await pool.query('SELECT * FROM users WHERE username = $1 AND active = true', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
  }

  if (req.method === 'GET' && req.url.endsWith('/me')) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const result = await pool.query('SELECT id, username, role, full_name FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.json(result.rows[0]);
    } catch { return res.status(403).json({ error: 'Invalid token' }); }
  }

  return res.status(404).json({ error: 'Not found' });
};
