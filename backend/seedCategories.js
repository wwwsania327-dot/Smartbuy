const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart';

const seedCategories = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    // Drop existing categories to ensure clean slate for defaults
    await Category.deleteMany();
    console.log('Existing categories dropped');

    const defaultCategories = [
      {
        name: 'Fruits',
        description: 'Fresh and organic seasonal fruits sourced directly from local farms.',
        image: { url: '/categories/fruits.png', public_id: 'local' }
      },
      {
        name: 'Vegetables',
        description: 'Crisp, healthy, and pesticide-free daily vegetable essentials.',
        image: { url: '/categories/vegetables.png', public_id: 'local' }
      },
      {
        name: 'Dairy',
        description: 'Pure farm-fresh milk, artisan cheese, and protein-packed eggs.',
        image: { url: '/categories/dairy.png', public_id: 'local' }
      },
      {
        name: 'Bakery',
        description: 'Warm, freshly baked artisan breads and delicious morning pastries.',
        image: { url: '/categories/bakery.png', public_id: 'local' }
      },
      {
        name: 'Snacks',
        description: 'Your favorite crunchy crisps, mixed nuts, and sweet chocolate treats.',
        image: { url: '/categories/snacks.png', public_id: 'local' }
      },
      {
        name: 'Beverages',
        description: 'Ice-cold soft drinks, natural juices, and refreshing sparkling water.',
        image: { url: '/categories/beverages.png', public_id: 'local' }
      },
      {
        name: 'Personal Care',
        description: 'Premium body care, soothing lotions, and refreshing hygiene products.',
        image: { url: '/categories/personal_care.png', public_id: 'local' }
      },
      {
        name: 'Household',
        description: 'Eco-friendly cleaning supplies and everyday household essentials.',
        image: { url: '/categories/household.png', public_id: 'local' }
      }
    ];

    await Category.insertMany(defaultCategories);
    console.log('Successfully seeded default categories!');

    process.exit(0);
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedCategories();
