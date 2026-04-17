const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Fetch all categories (including nested)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate('parent', 'name slug');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching categories' });
  }
};

// @desc    Fetch single category with products
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: req.params.id }).populate('category', 'name slug');
    res.json({
      ...category.toObject(),
      products
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching category' });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  try {
    const { name, parent, image, description } = req.body;
    
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description: description || '',
      parent: parent || null,
      image: image || {}
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server Error creating category' });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
  try {
    const { name, parent, image, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      // Update fields
      category.name = name || category.name;
      category.description = description !== undefined ? description : category.description;
      category.parent = parent !== undefined ? parent : category.parent;
      category.image = image || category.image;
      
      // Auto-generates slug on validate due to model schema
      // But we need to handle case where name changes
      if (name && name !== category.name) {
         category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error updating category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      await Category.deleteOne({ _id: category._id });
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error deleting category' });
  }
};

// @desc    Heal category links for all products (Manual Migration)
// @route   POST /api/categories/heal
// @access  Private/Admin
const healCategoryLinks = async (req, res) => {
  try {
    console.log("[Healing] Starting category link healing process...");
    const products = await Product.find({});
    const categories = await Category.find({});
    
    let healedCount = 0;
    let issues = [];

    for (let product of products) {
      // Check if product has a valid category that exists
      const catExists = categories.find(c => c._id.toString() === product.category?.toString());
      
      if (!catExists) {
        console.log(`[Healing] Product "${product.name}" has an invalid/missing category ID: ${product.category}`);
        
        // Attempt to find category by name or some other attribute if possible
        // Since we don't have the original category name stored in the product, 
        // this part is tricky unless we look at the 'ref' before it was lost.
        // However, we can try to find a category that "looks" like what might have been intended
        // or just flag it.
        issues.push({ productId: product._id, productName: product.name, status: "Orphaned" });
      }
    }

    res.json({ 
      message: "Healing process completed", 
      healedCount, 
      issues,
      note: "Fully automated healing is limited without original category names on products. Please verify Admin settings."
    });
  } catch (error) {
    console.error("[Healing] Error:", error);
    res.status(500).json({ message: 'Server Error during healing', error: error.message });
  }
};

module.exports = { getCategories, createCategory, getCategoryById, updateCategory, deleteCategory, healCategoryLinks };
