const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ username, active: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;
    if (!username || !password || !role || !fullName) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const user = await User.create({ username, password, role, fullName });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fullName, role, active } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, role, active },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
