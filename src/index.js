const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// 🔐 Middleware
app.use(cors());
app.use(express.json()); // Required to read req.body

// 🏁 Root route
app.get('/', (req, res) => res.send('Sanitary Shop Backend is running!'));

// 🚀 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/cart', require('./routes/cart.routes'));


// 📂 Ensure invoice directory exists
const invoicesPath = './src/invoices';
if (!fs.existsSync(invoicesPath)) fs.mkdirSync(invoicesPath);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
