const router = require('express').Router()
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller')
const { protect, adminOnly } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/', getAllCategories)
router.get('/:id', getCategoryById)
router.post('/', protect, adminOnly, upload.single('image'), createCategory)
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

module.exports = router
