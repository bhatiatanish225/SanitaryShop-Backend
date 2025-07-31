const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isBlocked: true },
  })
  res.json(users)
}

exports.getAllOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

exports.getDashboardStats = async (req, res) => {
  const totalUsers = await prisma.user.count()
  const totalOrders = await prisma.order.count()
  const totalRevenue = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  })

  res.json({
    totalUsers,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
  })
}
