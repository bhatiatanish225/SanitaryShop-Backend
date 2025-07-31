const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary =
  require("../utils/cloudinary.js")
console.log("Cloudinary config:", cloudinary.config());
exports.getAllCategories = async (req, res) => {
  const categories = await prisma.category.findMany();

  // Transform response to match frontend expectations
  const transformedCategories = categories.map((category) => ({
    ...category,
    image_url: category.imageUrl, // Frontend expects image_url
  }));

  res.json(transformedCategories);
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id: parseInt(id) },
  });

  if (!category) return res.status(404).json({ message: "Category not found" });

  // Get all products in this category
  const products = await prisma.product.findMany({
    where: { categoryId: parseInt(id) },
  });

  // Transform products to match frontend expectations
  const transformedProducts = products.map((product) => ({
    ...product,
    image_url: product.imageUrl,
    stock_quantity: product.availableStock,
    original_price: product.originalPrice,
    reviews_count: product.reviewsCount || 0,
  }));

  // Transform category to match frontend expectations
  const transformedCategory = {
    ...category,
    image_url: category.imageUrl,
    products: transformedProducts,
  };

  res.json(transformedCategory);
};
exports.  createCategory = async (req, res) => {
  const { name, description, imageUrl, image_url } = req.body;
  let finalImageUrl = image_url || imageUrl;
  try {
    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      finalImageUrl = await new Promise((resolve, reject) => {
        const result =  cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) throw error;
            resolve(result.secure_url);
          })
          .end(req.file.buffer);
      });
    }
    console.log("Final image URL:", finalImageUrl);
    const category = await prisma.category.create({
      data: {
        name,
        description,
        imageUrl: finalImageUrl,
      },
    });
    const transformedCategory = {
      ...category,
      image_url: category.imageUrl,
    };
    res.status(201).json({ success: true, category: transformedCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating category" });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description, imageUrl, image_url } = req.body;
  let finalImageUrl = image_url || imageUrl;
  try {
    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) throw error;
          return result;
        })
        .end(req.file.buffer);
      finalImageUrl = result.secure_url;
    }
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    const transformedCategory = {
      ...category,
      image_url: category.imageUrl,
    };
    res.json(transformedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating category" });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  await prisma.category.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Category deleted" });
};
