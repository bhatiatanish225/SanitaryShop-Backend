const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.protect = async (req, res, next) => {
  try {
    console.log(req.headers)
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'No token provided' })

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user) return res.status(401).json({ message: 'User not found' })
    // if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' })
  }
  next()
}
