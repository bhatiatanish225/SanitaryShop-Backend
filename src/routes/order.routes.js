const router = require('express').Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateStatus
} = require('../controllers/order.controller');

const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateStatus);

module.exports = router;
