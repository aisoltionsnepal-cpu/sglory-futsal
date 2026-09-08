module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    const client = await pool.connect();
    const r = await client.query('SELECT NOW() as time');
    client.release();
    res.json({ status: 'ok', db_time: r.rows[0].time });
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
};
