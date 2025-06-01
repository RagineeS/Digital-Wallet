//const bcrypt = require('bcryptjs');

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

router.get('/flagged', async (req, res) => {
  try {
    const flagged = await Transaction.find({ flagged: true });
    res.json({ success: true, flagged });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

router.get('/total-balances', async (req, res) => {
  try {
    const users = await User.find();
    const total = users.reduce((sum, user) => sum + (user.balance || 0), 0);
    res.json({ success: true, total });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

router.get('/top-users', async (req, res) => {
  try {
    const topUsers = await User.find().sort({ balance: -1 }).limit(5);
    res.json({ success: true, topUsers });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

