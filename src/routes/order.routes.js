const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders } = require('../controllers/order.controller');

router.post('/', protect, createOrder);
router.get('/', protect, getMyOrders);

module.exports = router;
