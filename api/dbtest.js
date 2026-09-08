module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const { Pool } = require('pg');
    const url = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    const r = await client.query('SELECT NOW() as time');
    client.release();
    await pool.end();
    res.json({ ok: true, time: r.rows[0].time, urlLen: url ? url.length : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code, errno: err.errno });
  }
};
