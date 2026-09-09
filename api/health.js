module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const { Pool } = require('pg');
    let pool;
    if (process.env.DB_HOST) {
      pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });
    } else {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000
      });
    }
    const client = await pool.connect();
    const r = await client.query('SELECT NOW() as time');
    client.release();
    await pool.end();
    res.status(200).json({ ok: true, time: r.rows[0].time, method: process.env.DB_HOST ? 'params' : 'url' });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message, code: err.code });
  }
};
