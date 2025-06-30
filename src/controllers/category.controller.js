const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
  res.json(category);
};

exports.createCategory = async (req, res) => {
  const { name } = req.body;
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await prisma.category.update({ where: { id: parseInt(id) }, data: { name } });
  res.json(category);
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Category deleted" });
};
