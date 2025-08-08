const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 🧾 Create order from cart OR from direct order data
exports.createOrder = async (req, res) => {
  const userId = req.user.id
  // Accept data from frontend
  const {
    total_amount,
    addressId,
    payment_method,
    order_items,
    user_id,
    delivery_address,
    payment_id,
  } = req.body

  console.log(
    total_amount,
    addressId,
    payment_method,
    order_items,
    user_id,
    delivery_address,
    payment_id
  )

  // If addressId is provided, validate it
  if (addressId) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    })
    if (!address || address.userId !== userId) {
      return res.status(400).json({ message: 'Invalid address selected' })
    }
  }

  // If direct order data is sent from frontend (not from cart)
  if (total_amount && order_items) {
    try {
      const orderItemsData = order_items.map((item) => ({
        productId: parseInt(item.product_id),
        quantity: item.quantity,
        price: parseFloat(item.price),
      }))

      const order = await prisma.order.create({
        data: {
          userId: user_id || userId,
          totalPrice: parseFloat(total_amount),
          totalAmount: parseFloat(total_amount),
          addressId: addressId || null,
          paymentMethod: payment_method,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      })

      // Transform response to match frontend expectations
      const transformedOrder = {
        ...order,
        total_amount: order.totalAmount || order.totalPrice,
        address_id: order.addressId,
        delivery_address: order.deliveryAddress,
        payment_method: order.paymentMethod,
        payment_id: order.paymentId,
      }

      res.status(201).json(transformedOrder)
    } catch (error) {
      console.error('Error creating order:', error)
      res.status(500).json({ message: 'Failed to create order' })
    }
  } else {
    // Original cart-based order creation
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    })

    if (cartItems.length === 0)
      return res.status(400).json({ message: 'Cart is empty' })

    let totalPrice = 0
    const orderItemsData = []

    for (const item of cartItems) {
      const priceWithTax =
        item.product.price +
        (item.product.price * (item.product.taxPercent || 0)) / 100
      totalPrice += priceWithTax * item.quantity

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: priceWithTax,
      })
    }

    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice,
        totalAmount: totalPrice,
        addressId: addressId || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId } })

    // Transform response to match frontend expectations
    const transformedOrder = {
      ...order,
      total_amount: order.totalAmount || order.totalPrice,
      address_id: order.addressId,
      delivery_address: order.deliveryAddress,
    }

    res.status(201).json(transformedOrder)
  }
}

// 📋 Get my orders
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(orders, 'this is the orders')

  // Transform response to match frontend expectations
  const transformedOrders = orders.map((order) => ({
    ...order,
    total_amount: order.totalAmount || order.totalPrice,
    delivery_address: order.deliveryAddress,
    payment_method: order.paymentMethod,
    items: order.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image_url: item.product.imageUrl,
        stock_quantity: item.product.availableStock,
        original_price: item.product.originalPrice,
        reviews_count: item.product.reviewsCount || 0,
      },
    })),
  }))

  res.json(transformedOrders)
}

exports.updateOrder = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: 'Status is required' })
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    })

    res.json(updatedOrder)
  } catch (error) {
    res
      .status(404)
      .json({ error: 'Order not found or could not update status' })
  }
}
