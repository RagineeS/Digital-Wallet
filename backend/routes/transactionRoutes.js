router.post('/transfer', async (req, res) => {
  try {
    const { fromEmail, toEmail, amount, method } = req.body;
    if (!fromEmail || !toEmail || !amount || amount <= 0) {
      return res.json({ success: false, message: 'Invalid input' });
    }
    const fromUser = await User.findOne({ email: fromEmail });
    const toUser = await User.findOne({ email: toEmail });
    if (!fromUser || !toUser) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Debug log
    console.log('From user balance:', fromUser.balance, 'Send amount:', amount);

    if (fromUser.balance < Number(amount)) {
      return res.json({ success: false, message: 'Insufficient balance' });
    }

    fromUser.balance -= Number(amount);
    toUser.balance += Number(amount);
    await fromUser.save();
    await toUser.save();
    await Transaction.create({
      user: fromUser._id,
      type: 'transfer',
      amount,
      method,
      to: toEmail,
      flagged: false
    });
    res.json({ success: true, balance: fromUser.balance });
  } catch (err) {
    res.json({ success: false, message: 'Server error' });
  }
});
