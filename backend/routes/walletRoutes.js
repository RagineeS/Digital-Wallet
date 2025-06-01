const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Deposite
router.post('/deposit', async (req, res) => {
  try {
    const { email, amount, currency, method, details } = req.body;
    if (!email || !amount || amount <= 0) {
      return res.json({ success: false, message: 'Invalid input' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });
    user.balance += Number(amount);
    await user.save();
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount,
      currency,
      method,
      details
    });
    res.json({ success: true, balance: user.balance });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

// Withdraw

router.post('/withdraw', async (req, res) => {
  try {
    const { email, amount, currency, method, details } = req.body;
    if (!email || !amount || amount <= 0) {
      return res.json({ success: false, message: 'Invalid input' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: 'User not found' });

    // Debug log
    console.log('User email:', email, 'Current balance:', user.balance, 'Withdraw amount:', amount);

    if (user.balance < Number(amount)) {
      return res.json({ success: false, message: 'Insufficient balance' });
    }

    user.balance -= Number(amount);
    await user.save();

    // --- FRAUD LOGIC ---
    if (Number(amount) > 10000) {
      await Transaction.create({
        user: user._id,
        type: 'withdraw',
        amount: Number(amount),
        currency,
        method,
        details,
        flagged: true,
        flagReason: 'Large withdrawal flagged for review.'
      });
      return res.json({
        success: true,
        balance: user.balance,
        flagged: true,
        message: 'Large withdrawal flagged for review.'
      });
    } else {
      await Transaction.create({
        user: user._id,
        type: 'withdraw',
        amount: Number(amount),
        currency,
        method,
        details,
        flagged: false
      });
      return res.json({
        success: true,
        balance: user.balance
      });
    }
  } catch (err) {
    console.error('Withdraw error:', err);
    res.json({ success: false, message: 'Server error' });
  }
});
// Transfer
router.post('/transfer', async (req, res) => {
  try {
    const { fromEmail, toEmail, amount } = req.body;
    if (!fromEmail || !toEmail || !amount || amount <= 0) return res.json({ success: false, message: 'Invalid input' });
    const fromUser = await User.findOne({ email: fromEmail });
    const toUser = await User.findOne({ email: toEmail });
    if (!fromUser || !toUser) return res.json({ success: false, message: 'User not found' });
    if (fromUser.balance < amount) return res.json({ success: false, message: 'Insufficient balance' });
    fromUser.balance -= Number(amount);
    toUser.balance += Number(amount);
    await fromUser.save();
    await toUser.save();
    await Transaction.create({ 
      user: fromUser._id, 
      type: 'transfer', 
      amount, 
      to: toEmail, 
     });
    res.json({ success: true, balance: fromUser.balance });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

// Transaction history
router.get('/history/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.json({ success: false, message: 'User not found' });
    const history = await Transaction.find({ user: user._id }).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
