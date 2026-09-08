const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, initDB, cors } = require('../lib/db');
const { JWT_SECRET } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!ready) { await initDB(); ready = true; }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const result = await getPool().query('SELECT * FROM users WHERE username = $1 AND active = true', [username]);
  if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  const user = result.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  return res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
};
