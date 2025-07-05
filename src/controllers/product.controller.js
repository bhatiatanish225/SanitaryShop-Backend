const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 🛍️ Get all products (with optional filters)
exports.getAllProducts = async (req, res) => {
  const { category, search } = req.query;

  const products = await prisma.product.findMany({
    where: {
      AND: [
        category ? { categoryId: parseInt(category) } : {},
        search ? { name: { contains: search, mode: 'insensitive' } } : {}
      ]
    },
    include: { category: true }
  });

  res.json(products);
};

// 🛍️ Get single product by ID
exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true }
  });

  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

// 🛍️ Create new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
  name,
  description,
  imageUrl,
  price,
  isFeatured,
  isBestseller,
  categoryId,
  availableStock,  // ✅ use this instead of stock
  rating,
  taxPercent
    } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        imageUrl,
        isFeatured: !!isFeatured,
        isBestseller: !!isBestseller,
        rating: parseFloat(rating) || 0,
        availableStock: parseInt(availableStock) || 0,
        taxPercent: parseFloat(taxPercent) || 0
      }
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating product' });
  }
};

// 🛍️ Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body,
  price: req.body.price ? parseFloat(req.body.price) : undefined,
  availableStock: req.body.availableStock ? parseInt(req.body.availableStock) : undefined,
  rating: req.body.rating ? parseFloat(req.body.rating) : undefined,
  taxPercent: req.body.taxPercent ? parseFloat(req.body.taxPercent) : undefined,
  categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined
    };

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data
    });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// 🛍️ Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Product deleted" });
};
