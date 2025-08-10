const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBlocked: true,
      },
      skip: skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    })

    const totalUsers = await prisma.user.count()

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / parseInt(limit)),
        totalUsers,
        limit: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('Error in getAllUsers:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Fetch orders with address relation included, only where status is not 'delivered'
    const orders = await prisma.order.findMany({
      where: {
        status: {
          not: 'delivered',
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        payment: true,
        address: true, // include the address relation (not addressId)
      },
      orderBy: { createdAt: 'desc' },
      skip: skip,
      take: parseInt(limit),
    })

    // Transform orders to send address as per Address table
    const transformedOrders = orders.map((order) => {
      let address = null
      if (order.address) {
        // Only send the fields from the Address table as per schema
        address = {
          id: order.address.id,
          userId: order.address.userId,
          label: order.address.label,
          house: order.address.house,
          street: order.address.street,
          city: order.address.city,
          landmark: order.address.landmark,
          address1: order.address.address1,
          createdAt: order.address.createdAt,
        }
      }
      // Remove address from order, and add as delivery_address for frontend
      const { address: _address, ...restOrder } = order
      return {
        ...restOrder,
        delivery_address: address,
      }
    })

    // Count only orders whose status is not 'delivered'
    const totalOrders = await prisma.order.count({
      where: {
        status: {
          not: 'delivered',
        },
      },
    })

    res.json({
      orders: transformedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / parseInt(limit)),
        totalOrders,
        limit: parseInt(limit),
      },
    })
  } catch (error) {
    console.error('Error in getAllOrders:', error)
    res.status(500).json({ message: 'Error fetching orders' })
  }
}

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count()
    const totalOrders = await prisma.order.count()
    const totalProducts = await prisma.product.count()
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    })

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    })
  } catch (error) {
    console.error('Error in getDashboardStats:', error)
    res.status(500).json({ message: 'Error fetching dashboard stats' })
  }
}
