const router = require('express').Router();
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
} = require('../controllers/payment.controller');

const { protect } = require('../middleware/auth');

router.post('/order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyRazorpaySignature);

module.exports = router;
