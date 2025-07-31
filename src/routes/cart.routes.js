const router = require('express').Router()
const { protect } = require('../middleware/auth')
const {
  addToCart,
  getCart,
  removeFromCart,
  deleteAllFromCart,
} = require('../controllers/cart.controller')

router.use(protect)
router.post('/', addToCart)
router.get('/', getCart)
router.delete('/:id', removeFromCart)
router.delete('/all/:id', deleteAllFromCart)

module.exports = router
