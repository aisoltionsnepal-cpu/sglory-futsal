module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  let pg = false;
  try { require('pg'); pg = true; } catch(e) {}
  let jwt = false;
  try { require('jsonwebtoken'); jwt = true; } catch(e) {}
  let bcrypt = false;
  try { require('bcryptjs'); bcrypt = true; } catch(e) {}
  res.json({ 
    status: 'ok', 
    db_url_set: !!process.env.DATABASE_URL,
    jwt_secret_set: !!process.env.JWT_SECRET,
    pg_installed: pg,
    jwt_installed: jwt,
    bcrypt_installed: bcrypt
  });
};
