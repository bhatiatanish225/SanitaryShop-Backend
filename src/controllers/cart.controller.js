  const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ➕ Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body
  const userId = req.user.id

  if (!productId || quantity < 1)
    return res.status(400).json({ message: 'Invalid product or quantity' })

  // If already in cart, update quantity
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId: parseInt(productId) },
  })

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: {
        product: {
          include: { category: true },
        },
      },
    })

    // Transform response to match frontend expectations
    const transformedItem = {
      ...updated,
      product: {
        ...updated.product,
        image_url: updated.product.imageUrl,
        stock_quantity: updated.product.availableStock,
        original_price: updated.product.originalPrice,
        reviews_count: updated.product.reviewsCount || 0,
      },
    }

    return res.json(transformedItem)
  }

  const item = await prisma.cartItem.create({
    data: { userId, productId: parseInt(productId), quantity },
    include: {
      product: {
        include: { category: true },
      },
    },
  })

  // Transform response to match frontend expectations
  const transformedItem = {
    ...item,
    product: {
      ...item.product,
      image_url: item.product.imageUrl,
      stock_quantity: item.product.availableStock,
      original_price: item.product.originalPrice,
      reviews_count: item.product.reviewsCount || 0,
    },
  }

  res.status(201).json(transformedItem)
}

// 🧺 Get all cart items
exports.getCart = async (req, res) => {
  const userId = req.user.id

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { category: true },
      },
    },
  })

  // Transform response to match frontend expectations
  const transformedItems = items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      image_url: item.product.imageUrl,
      stock_quantity: item.product.availableStock,
      original_price: item.product.originalPrice,
      reviews_count: item.product.reviewsCount || 0,
    },
  }))

  res.json(transformedItems)
}

// 🗑️ Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id
    const id = parseInt(req.params.id)

    // Log for debugging
    console.log('Remove from cart:', { userId, cartItemId: id })

    // Find the cart item
    const item = await prisma.cartItem.findFirst({
      where: { userId, productId: id },
    })
    console.log('Cart item found:', item)

    if (!item) {
      console.log('Cart item not found for user:', userId, 'productId:', id)
      return res.status(404).json({ message: 'Cart item not found' })
    }

    // If quantity is 1, remove the item from the cart
    if (item.quantity === 1) {
      await prisma.cartItem.deleteMany({
        where: { userId, productId: id },
      })
      console.log('Item removed from cart:', { userId, productId: id })
      return res.json({ message: 'Item removed' })
    }

    // If quantity > 1, decrement the quantity by 1
    if (item.quantity > 1) {
      await prisma.cartItem.updateMany({
        where: { userId, productId: id },
        data: { quantity: item.quantity - 1 },
      })
      console.log('Item quantity decremented:', {
        userId,
        productId: id,
        newQuantity: item.quantity - 1,
      })
      return res.json({ message: 'Item quantity decremented' })
    }

    // Fallback (should not reach here)
    console.log('Invalid cart item state for:', { userId, productId: id, item })
    res.status(400).json({ message: 'Invalid cart item state' })
  } catch (error) {
    console.log('Error removing from cart:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.deleteAllFromCart = async (req, res) => {
  try {
    const userId = req.user.id
    const id = parseInt(req.params.id)

    // Log for debugging
    console.log('Delete all from cart:', { userId, productId: id })

    // Delete all cart items for this user and productId
    const deleted = await prisma.cartItem.deleteMany({
      where: { userId, productId: id },
    })

    if (deleted.count === 0) {
      console.log(
        'No cart items found to delete for user:',
        userId,
        'productId:',
        id
      )
      return res.status(404).json({ message: 'No cart items found to delete' })
    }

    console.log('All items removed from cart:', {
      userId,
      productId: id,
      deletedCount: deleted.count,
    })
    return res.json({
      message: 'All items removed from cart',
      deletedCount: deleted.count,
    })
  } catch (error) {
    console.log('Error deleting all from cart:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
