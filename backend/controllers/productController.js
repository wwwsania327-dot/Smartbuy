const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword ? {
      name: {
        $regex: req.query.keyword,
        $options: 'i'
      }
    } : {};
    
    const products = await Product.find({ ...keyword }).populate('category', 'name slug');
    console.log(`[Products API] Returning ${products.length} products (All/Search)`);
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Server Error retrieving products' });
  }
};

// @desc    Fetch products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(`[Category Debug] Fetching products for categoryId: ${categoryId}`);
    
    let category;
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      category = await Category.findById(categoryId);
      console.log(`[Category Debug] Found category by ID: ${category?.name}`);
    } else {
      category = await Category.findOne({ slug: categoryId });
      console.log(`[Category Debug] Found category by Slug: ${category?.name}`);
    }

    if (!category) {
      console.warn(`[Category Debug] Category not found for: ${categoryId}`);
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: category._id }).populate('category', 'name slug');
    console.log(`[Category API] Returning ${products.length} products for ${category.name}`);
    res.json({ products });
  } catch (error) {
    console.error(`[Category Debug] Error: ${error.message}`);
    res.status(500).json({ message: 'Server Error retrieving products by category', error: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error retrieving product' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, discount } = req.body;
    
    let catId = category;
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      console.log(`[Product Create Debug] Category string provided: "${category}". Attempting to find/create.`);
      let newCat = await Category.findOne({ name: category });
      if (!newCat) {
        console.log(`[Product Create Debug] Category "${category}" not found. Creating new.`);
        newCat = await Category.create({ name: category, slug: category.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
      }
      catId = newCat._id;
      console.log(`[Product Create Debug] Assigned to category ID: ${catId}`);
    }

    const product = new Product({
      name,
      description: description || 'No description provided',
      price,
      discount: discount || 0,
      discountPrice: discount > 0 ? price - (price * discount / 100) : 0,
      stock,
      category: catId,
      images: images || [],
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating product' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, discount } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      let catId = category || product.category;
      if (category && !mongoose.Types.ObjectId.isValid(category)) {
        let newCat = await Category.findOne({ name: category });
        if (!newCat) {
          newCat = await Category.create({ name: category });
        }
        catId = newCat._id;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      
      const newDiscount = discount !== undefined ? discount : product.discount;
      product.discount = newDiscount;
      product.discountPrice = newDiscount > 0 ? product.price - (product.price * newDiscount / 100) : 0;
      product.category = catId;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting product' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/review
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, review } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Check if user purchased the product and it's delivered
    const Order = require('../models/Order');
    const order = await Order.findOne({
      user: req.user._id,
      'orderItems.product': req.params.id,
      status: 'Delivered'
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased and received.' });
    }

    const newReview = {
      user: req.user._id,
      rating: Number(rating),
      review,
    };

    product.ratings.push(newReview);

    // Update average rating
    product.averageRating =
      product.ratings.reduce((acc, item) => item.rating + acc, 0) /
      product.ratings.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error adding review' });
  }
};

module.exports = { 
  getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory,
  createProductReview
};
