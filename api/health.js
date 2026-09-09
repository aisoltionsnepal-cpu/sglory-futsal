module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  try {
    const url = process.env.DATABASE_URL;
    const host = process.env.DB_HOST;
    const pass = process.env.DB_PASSWORD;
    res.status(200).json({
      ok: true,
      hasDbUrl: !!url,
      dbUrlLen: url ? url.length : 0,
      hasHost: !!host,
      hasPass: !!pass,
      passLen: pass ? pass.length : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
