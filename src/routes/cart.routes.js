const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  addToCart,
  getCart,
  removeFromCart
} = require('../controllers/cart.controller');

router.use(protect);
router.post('/', addToCart);
router.get('/', getCart);
router.delete('/:id', removeFromCart);

module.exports = router;
