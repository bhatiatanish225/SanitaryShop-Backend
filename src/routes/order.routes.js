const router = require('express').Router()
const { protect, adminOnly } = require('../middleware/auth')
const {
  createOrder,
  getMyOrders,
  updateOrder,
} = require('../controllers/order.controller')

router.post('/', protect, createOrder)
router.get('/', protect, getMyOrders)
router.put('/:id/status', protect, adminOnly, updateOrder)

module.exports = router
