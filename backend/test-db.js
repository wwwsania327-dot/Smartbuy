const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart';

console.log('Attempting to connect to:', MONGO_URI.replace(/:([^:@]{1,})@/, ':****@'));

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('SUCCESS: MongoDB Connected');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available Collections:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    const products = await mongoose.connection.db.collection('products').find({}).limit(5).toArray();
    console.log('Sample Data Fetched Successfully:');
    products.forEach(p => console.log(`- ${p.name}`));
    
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Database connection error:', err.message);
    process.exit(1);
  });
