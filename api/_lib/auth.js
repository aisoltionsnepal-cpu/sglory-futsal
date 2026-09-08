const jwt = require('jsonwebtoken');
const { getPool, initDB } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'sglory_futsal_secret_2026';
let ready = false;

async function ensureDB() { if (!ready) { await initDB(); ready = true; } }

async function getUser(req) {
  const auth = req.headers.authorization;
  const token = auth && auth.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const r = await getPool().query('SELECT id, username, role, full_name, active FROM users WHERE id = $1', [decoded.id]);
    return (r.rows.length > 0 && r.rows[0].active) ? r.rows[0] : null;
  } catch { return null; }
}

module.exports = { JWT_SECRET, ensureDB, getUser };
