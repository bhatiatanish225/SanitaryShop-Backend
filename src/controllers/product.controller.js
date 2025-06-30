const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true }
  });
  res.json(product);
};

exports.createProduct = async (req, res) => {
  const { name, description, price, categoryId, imageUrl, isFeatured, isBestseller } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      imageUrl,
      isFeatured,
      isBestseller
    }
  });

  res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data
  });

  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Product deleted" });
};
