module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const { getPool, initDB } = require('../lib/db');
    await initDB();
    const result = await getPool().query('SELECT id, username, role, full_name FROM users');
    res.json({ ok: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack, code: err.code });
  }
};
