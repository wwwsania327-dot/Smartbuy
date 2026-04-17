const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory } = require('../controllers/productController');

// GET /api/products - Fetch all products
router.get('/', getProducts);

// GET /api/products/category/:categoryId - Fetch products by category
router.get('/category/:categoryId', getProductsByCategory);

// GET /api/products/:id - Fetch single product
router.get('/:id', getProductById);

// POST /api/products - Create a product (Admin only)
// TODO: Add admin middleware
router.post('/', createProduct);

// PUT /api/products/:id - Update a product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
