const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
} = require('../controllers/product.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected route (only logged-in users can create products)
router.post('/', protect, createProduct);

// You can add more protected routes for updating and deleting here
// router.put('/:id', protect, updateProduct);
// router.delete('/:id', protect, deleteProduct);

module.exports = router;
