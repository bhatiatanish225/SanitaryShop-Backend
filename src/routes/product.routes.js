const router = require('express').Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload')

// Require login for viewing products
router.get('/', protect, getAllProducts);
router.get('/:id', protect, getProductById);

// Admin-only routes
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;
