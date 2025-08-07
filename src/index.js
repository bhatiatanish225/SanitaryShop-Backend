const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const fs = require('fs')
const helmet = require('helmet')
const morgan = require('morgan')
const { PrismaClient } = require('@prisma/client')

const authRoutes = require('./routes/auth.routes')
const categoryRoutes = require('./routes/category.routes')
const productRoutes = require('./routes/product.routes')
const orderRoutes = require('./routes/order.routes')
const paymentRoutes = require('./routes/payment.routes')
const adminRoutes = require('./routes/admin.routes')
const addressRoutes = require('./routes/address.routes')
const locationRoutes = require('./routes/location.routes')

// Configure dotenv with safe defaults
dotenv.config()

const prisma = new PrismaClient()
const app = express()

// Helmet helps secure Express apps by setting various HTTP headers to protect against common vulnerabilities.
app.use(helmet())
// Morgan is an HTTP request logger middleware for Node.js, used here in 'dev' mode for concise colored output.
app.use(morgan('dev'))

// 🔐 Middleware
app.use(
  cors({
    origin: '*', // ✅ allow requests from this origin
    credentials: true,
  })
)

app.options('*', cors()) // Enable pre-flight for all routes
app.use(express.json()) // Required to read req.body

// 🏁 Root route
app.get('/', (req, res) => res.send('Sanitary Shop Backend is running!'))

// 🚀 API Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/location', locationRoutes)

// Load cart routes separately to avoid path-to-regexp issues
const cartRoutes = require('./routes/cart.routes')
app.use('/api/cart', cartRoutes)

// 📂 Ensure invoice directory exists
const path = require('path')
const invoicesPath = path.join(__dirname, 'invoices')
if (!fs.existsSync(invoicesPath)) fs.mkdirSync(invoicesPath)

// 🚀 Start server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
