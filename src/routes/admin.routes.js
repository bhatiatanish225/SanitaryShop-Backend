const router = require('express').Router()
const { protect, adminOnly } = require('../middleware/auth')
const adminController = require('../controllers/admin.controller')

router.get('/users', protect, adminOnly, adminController.getAllUsers)
router.get('/orders', protect, adminOnly, adminController.getAllOrders)
router.get(
  '/dashboard/stats',
  protect,
  adminOnly,
  adminController.getDashboardStats
)

module.exports = router
