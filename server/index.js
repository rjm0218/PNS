// Main index.js file - imports modular routes and middleware

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const log = require('./utils/logger');
const { success } = require('./utils/response');

const app = express();
const port = process.env.PORT || 3001;
const host = 'http://localhost';
const env = process.env.NODE_ENV;
const origin = env === 'production' ? 'https://your-production-url.com' : `${host}:3000`;

const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware setup
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

// Routes
app.get('/health', (req, res) => success(res, null, 'API is healthy'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/gear', require('./routes/gearRoutes'));
app.use('/api/hero', require('./routes/heroRoutes'));
app.use('/api/boost', require('./routes/boostRoutes'));
app.use('/api/planner', require('./routes/plannerRoutes'));

// Start server
app.listen(port, () => {
  console.log(`Server running on ${host}:${port}`);
});
