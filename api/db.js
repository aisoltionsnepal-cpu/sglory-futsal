const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(10) NOT NULL CHECK(role IN ('admin', 'sales')),
        full_name VARCHAR(100) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        item_type VARCHAR(20) NOT NULL CHECK(item_type IN ('cigarette', 'water', 'energy_drink')),
        brand VARCHAR(100) NOT NULL,
        price_per_piece DECIMAL(10,2) NOT NULL,
        pack_size INTEGER NOT NULL DEFAULT 1,
        stock_in_pieces INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        inventory_id INTEGER NOT NULL REFERENCES inventory(id),
        quantity INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        sold_by INTEGER NOT NULL REFERENCES users(id),
        sale_date DATE DEFAULT CURRENT_DATE,
        sale_time TIME DEFAULT CURRENT_TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const userCheck = await client.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const adminPass = await bcrypt.hash('admin123', 10);
      const salesPass = await bcrypt.hash('sales123', 10);
      await client.query('INSERT INTO users (username, password, role, full_name) VALUES ($1, $2, $3, $4)', ['admin', adminPass, 'admin', 'Admin']);
      await client.query('INSERT INTO users (username, password, role, full_name) VALUES ($1, $2, $3, $4)', ['sales', salesPass, 'sales', 'Sales User']);
      await client.query(`INSERT INTO inventory (item_name, item_type, brand, price_per_piece, pack_size, stock_in_pieces) VALUES
        ('Cigarette', 'cigarette', 'Shikhar', 20, 20, 100),
        ('Cigarette', 'cigarette', 'Surya', 25, 20, 100),
        ('Cigarette', 'cigarette', 'Naulo', 12, 20, 100),
        ('Water Bottle', 'water', 'Regular Water', 25, 12, 48),
        ('Energy Drink', 'energy_drink', 'Xtreme', 150, 24, 48),
        ('Energy Drink', 'energy_drink', 'Redbull', 150, 24, 48)`);
    }
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
