const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    console.log('Received registration:', req.body);
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.json({ success: false, message: 'All fields are required.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.json({ success: false, message: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.json({ success: false, message: 'All fields are required.' });
    }
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.json({ success: false, message: 'Invalid email or role.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid password.' });
    }
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.json({ success: false, message: 'Login failed.' });
  }
});

module.exports = router;
