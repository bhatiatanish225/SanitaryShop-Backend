const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ➕ Add item to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  if (!productId || quantity < 1)
    return res.status(400).json({ message: "Invalid product or quantity" });

  // If already in cart, update quantity
  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId }
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity }
    });
    return res.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: { userId, productId, quantity }
  });

  res.status(201).json(item);
};

// 🧺 Get all cart items
exports.getCart = async (req, res) => {
  const userId = req.user.id;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true }
  });

  res.json(items);
};

// 🗑️ Remove from cart
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const id = parseInt(req.params.id);

  const item = await prisma.cartItem.findUnique({ where: { id } });

  if (!item || item.userId !== userId)
    return res.status(403).json({ message: 'Unauthorized or not found' });

  await prisma.cartItem.delete({ where: { id } });
  res.json({ message: 'Item removed' });
};
