const { cors, getPool, initDB } = require('../lib/db');
const { getUser } = require('../lib/auth');

let ready = false;

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    if (!ready) { await initDB(); ready = true; }

    if (req.method === 'GET') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      const r = await getPool().query('SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC');
      return res.json(r.rows);
    }

    if (req.method === 'POST') {
      const { customerName, customerPhone, customerEmail, bookingDate, bookingTime, duration, notes } = req.body;
      if (!customerName || !customerPhone || !bookingDate || !bookingTime || !duration) {
        return res.status(400).json({ error: 'Name, phone, date, time, and duration are required' });
      }
      if (duration < 1 || duration > 12) {
        return res.status(400).json({ error: 'Duration must be between 1 and 12 hours' });
      }

      const conflict = await getPool().query(
        `SELECT id FROM bookings 
         WHERE booking_date = $1 
         AND status = 'confirmed'
         AND (
           (booking_time <= $2 AND (booking_time + (duration || ' hours')::interval) > $2)
           OR (booking_time < ($2::time + ($3 || ' hours')::interval) AND (booking_time + (duration || ' hours')::interval) >= ($2::time + ($3 || ' hours')::interval))
           OR ($2::time <= booking_time AND ($2::time + ($3 || ' hours')::interval) > booking_time)
         )`,
        [bookingDate, bookingTime, duration]
      );

      if (conflict.rows.length > 0) {
        return res.status(409).json({ error: 'This time slot is already booked. Please choose a different time.' });
      }

      const totalPrice = 1000 * duration;
      const r = await getPool().query(
        `INSERT INTO bookings (customer_name, customer_phone, customer_email, booking_date, booking_time, duration, total_price, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [customerName, customerPhone, customerEmail || null, bookingDate, bookingTime, duration, totalPrice, notes || null]
      );
      return res.status(201).json({ message: 'Booking confirmed!', booking: r.rows[0] });
    }

    if (req.method === 'PUT') {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { id } = req.query;
      const { status } = req.body;

      if (!id || !status) return res.status(400).json({ error: 'Booking ID and status required' });
      if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const r = await getPool().query(
        'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (r.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
      return res.json({ message: 'Booking updated', booking: r.rows[0] });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
