const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  seedAdmin();
});

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = '2200031684cseh@gmail.com';
    
    // 1. Force demote any other users who obtained 'admin' role to keep permissions secure
    await User.updateMany(
      { email: { $ne: adminEmail }, role: 'admin' },
      { $set: { role: 'user' } }
    );

    // 2. Ensure Tanmai Gorantla exists and holds the admin role
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: 'Tanmai Gorantla',
        email: adminEmail,
        password: 'adminpassword123', // Default credentials
        role: 'admin'
      });
      console.log('👑 Seeding primary admin account: Tanmai Gorantla (2200031684cseh@gmail.com) with password: adminpassword123');
    } else {
      let updated = false;
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        updated = true;
      }
      if (adminExists.name !== 'Tanmai Gorantla') {
        adminExists.name = 'Tanmai Gorantla';
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log('👑 Verified and synchronized unique admin credentials.');
      }
    }
  } catch (error) {
    console.error('Error executing admin validation:', error.message);
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/vote', require('./routes/voteRoutes'));

// Basic status route
app.get('/', (req, res) => {
  res.json({ message: 'Online Voting System API is running...' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
