const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');
const path = require('path');

// Models (Require directly to ensure they are registered)
// We use relative paths from the function location
require('../../backend/models/Category');
require('../../backend/models/Product');

// Route imports
const authRoutes = require('../../backend/routes/authRoutes');
const productRoutes = require('../../backend/routes/productRoutes');
const categoryRoutes = require('../../backend/routes/categoryRoutes');
const orderRoutes = require('../../backend/routes/orderRoutes');
const userRoutes = require('../../backend/routes/userRoutes');
const wishlistRoutes = require('../../backend/routes/wishlistRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api/products', productRoutes);
app.use('/.netlify/functions/api/categories', categoryRoutes);
app.use('/.netlify/functions/api/orders', orderRoutes);
app.use('/.netlify/functions/api/users', userRoutes);
app.use('/.netlify/functions/api/wishlist', wishlistRoutes);

app.get('/.netlify/functions/api', (req, res) => {
  res.send('FreshCart Serverless API is running...');
});

// Database Connection Logic (Cached for Serverless)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) return cachedConnection;
  
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI is not defined');

  cachedConnection = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('MongoDB Connected');
  return cachedConnection;
};

// Error handling wrapper
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Ensure DB is connected before processing request
  try {
    await connectDB();
  } catch (err) {
    console.error('DB Connection Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database connection failed" })
    };
  }
  
  return await handler(event, context);
};
