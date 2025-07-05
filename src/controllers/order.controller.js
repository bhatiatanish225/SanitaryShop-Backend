const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🧾 Create order from cart
exports.createOrder = async (req, res) => {
  const userId = req.user.id;

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  if (cartItems.length === 0)
    return res.status(400).json({ message: 'Cart is empty' });

  let totalPrice = 0;
  const orderItemsData = [];

  for (const item of cartItems) {
    const priceWithTax = item.product.price + (item.product.price * (item.product.taxPercent || 0) / 100);
    totalPrice += priceWithTax * item.quantity;

    orderItemsData.push({
      productId: item.productId,
      quantity: item.quantity,
      price: priceWithTax
    });
  }

  const order = await prisma.order.create({
    data: {
      userId,
      totalPrice,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: true
    }
  });

  // Clear cart
  await prisma.cartItem.deleteMany({ where: { userId } });

  res.status(201).json(order);
};

// 📋 Get my orders
exports.getMyOrders = async (req, res) => {
  const userId = req.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(orders);
};
