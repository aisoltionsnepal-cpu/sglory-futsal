const jwt = require('jsonwebtoken');
const { pool } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'sglory_futsal_secret_2026';

const authenticateToken = async (req) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, username, role, full_name, active FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0 || !result.rows[0].active) return null;
    return result.rows[0];
  } catch { return null; }
};

module.exports = { authenticateToken, JWT_SECRET };
