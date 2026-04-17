const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

const categories = [
  { name: 'Fruits', slug: 'fruits' },
  { name: 'Vegetables', slug: 'vegetables' },
  { name: 'Dairy', slug: 'dairy' },
  { name: 'Bakery', slug: 'bakery' },
  { name: 'Meat', slug: 'meat' }
];

const products = [
  { name: 'Organic Bananas', description: 'Fresh organic bananas', price: 2.99, stock: 100, category: 'Fruits' },
  { name: 'Fresh Avocado', description: 'Ripe and ready avocados', price: 4.50, discountPrice: 3.99, stock: 50, category: 'Vegetables' },
  { name: 'Whole Milk', description: 'Fresh whole milk', price: 3.20, stock: 75, category: 'Dairy' },
  { name: 'Sourdough Bread', description: 'Artisan sourdough bread', price: 5.00, discountPrice: 4.50, stock: 30, category: 'Bakery' },
  { name: 'Red Apples', description: 'Crisp red apples', price: 3.50, stock: 80, category: 'Fruits' },
  { name: 'Fresh Carrots', description: 'Organic fresh carrots', price: 2.10, discountPrice: 1.80, stock: 60, category: 'Vegetables' },
  { name: 'Eggs (Dozen)', description: 'Farm fresh eggs', price: 4.00, stock: 40, category: 'Dairy' },
  { name: 'Chicken Breast', description: 'Boneless chicken breast', price: 8.50, discountPrice: 7.99, stock: 25, category: 'Meat' },
  { name: 'Strawberries', description: 'Sweet fresh strawberries', price: 5.99, stock: 45, category: 'Fruits' },
  { name: 'Broccoli', description: 'Fresh green broccoli', price: 3.25, discountPrice: 2.99, stock: 35, category: 'Vegetables' },
  { name: 'Cheddar Cheese', description: 'Aged cheddar cheese', price: 6.50, stock: 20, category: 'Dairy' },
  { name: 'Whole Wheat Bread', description: 'Healthy whole wheat bread', price: 4.20, discountPrice: 3.99, stock: 28, category: 'Bakery' },
  { name: 'Oranges', description: 'Juicy navel oranges', price: 4.00, stock: 55, category: 'Fruits' },
  { name: 'Spinach', description: 'Fresh baby spinach', price: 2.50, discountPrice: 2.20, stock: 40, category: 'Vegetables' },
  { name: 'Greek Yogurt', description: 'Plain Greek yogurt', price: 4.75, stock: 30, category: 'Dairy' },
  { name: 'Salmon Fillet', description: 'Fresh Atlantic salmon', price: 12.99, discountPrice: 11.50, stock: 15, category: 'Meat' }
];

const importData = async () => {
  try {
    // Connect to DB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freshcart';
    await mongoose.connect(MONGO_URI);

    // Clear existing data
    await Category.deleteMany();
    await Product.deleteMany();

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories imported');

    // Create products with category references
    const productsWithCategoryIds = products.map(product => {
      const category = createdCategories.find(cat => cat.name === product.category);
      return {
        ...product,
        category: category._id
      };
    });

    await Product.insertMany(productsWithCategoryIds);
    console.log('Products imported');

    console.log('Data Import Success');
    process.exit();
  } catch (error) {
    console.error('Data Import Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('Data Destroyed');
    process.exit();
  } catch (error) {
    console.error('Data Destroy Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}