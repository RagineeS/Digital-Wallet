require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // <-- Import your db connection

const app = express();

connectDB(); // <-- Connect to MongoDB ONCE at startup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../client/public')));

app.use('/auth', require('./routes/authRoutes'));
app.use('/wallet', require('./routes/walletRoutes')); // If you have wallet routes
app.use((err, req, res, next) => {
  console.error('Uncaught error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});
app.use('/admin', require('./routes/adminRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
