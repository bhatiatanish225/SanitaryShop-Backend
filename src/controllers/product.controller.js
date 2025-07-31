const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary =  require("../utils/cloudinary").default || require("../utils/cloudinary");
// 🛍️ Get all products (with optional filters)
exports.getAllProducts = async (req, res) => {
  const { category, categoryId, search, isFeatured, isBestseller } = req.query;

  try {
    const products = await prisma.product.findMany({
      where: {
        AND: [
          category ? { categoryId: parseInt(category) } : {},
          categoryId ? { categoryId: parseInt(categoryId) } : {},
          search ? { name: { contains: search, mode: "insensitive" } } : {},
          isFeatured ? { isFeatured: isFeatured === "true" } : {},
          isBestseller ? { isBestseller: isBestseller === "true" } : {},
        ],
      },
      include: { category: true },
    });

    // Transform response to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      image_url: product.imageUrl, // Frontend expects image_url
      stock_quantity: product.availableStock, // Frontend expects stock_quantity
      original_price: product.originalPrice, // Frontend expects original_price
      reviews_count: product.reviewsCount || 0, // Frontend expects reviews_count
    }));

    // console.log(transformedProducts)
    console.log("before res,json");
    return res.json(transformedProducts);
    console.log("after res,json");
  } catch (error) {
    console.log(error);
  }
};

// 🛍️ Get single product by ID
exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });

  // Transform response to match frontend expectations
  const transformedProduct = {
    ...product,
    image_url: product.imageUrl,
    stock_quantity: product.availableStock,
    original_price: product.originalPrice,
    reviews_count: product.reviewsCount || 0,
  };

  res.json(transformedProduct);
};

// 🛍️ Create new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      image_url, // Accept both formats
      price,
      originalPrice,
      original_price, // Accept both formats
      isFeatured,
      isBestseller,
      categoryId,
      availableStock,
      stockQuantity, // Accept both formats
      stock_quantity, // Accept both formats
      rating,
      reviewsCount,
      reviews_count, // Accept both formats
      taxPercent,
    } = req.body;
    let finalImageUrl = image_url || imageUrl;
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
    const finalOriginalPrice = original_price || originalPrice;
    const finalStockQuantity =
      stock_quantity || stockQuantity || availableStock;
    const finalReviewsCount = reviews_count || reviewsCount;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice: finalOriginalPrice
          ? parseFloat(finalOriginalPrice)
          : null,
        categoryId: parseInt(categoryId),
        imageUrl: finalImageUrl,
        isFeatured: !!isFeatured,
        isBestseller: !!isBestseller,
        rating: parseFloat(rating) || 0,
        availableStock: parseInt(finalStockQuantity) || 0,
        stockQuantity: parseInt(finalStockQuantity) || 0,
        reviewsCount: parseInt(finalReviewsCount) || 0,
        taxPercent: parseFloat(taxPercent) || 0,
      },
    });
    const transformedProduct = {
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount,
    };
    res.status(201).json(transformedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating product" });
  }
};

// 🛍️ Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      imageUrl,
      image_url,
      price,
      originalPrice,
      original_price,
      isFeatured,
      isBestseller,
      categoryId,
      availableStock,
      stockQuantity,
      stock_quantity,
      rating,
      reviewsCount,
      reviews_count,
      taxPercent,
    } = req.body;
    let finalImageUrl = image_url || imageUrl;
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
    const finalOriginalPrice = original_price || originalPrice;
    const finalStockQuantity =
      stock_quantity || stockQuantity || availableStock;
    const finalReviewsCount = reviews_count || reviewsCount;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (finalOriginalPrice !== undefined)
      updateData.originalPrice = parseFloat(finalOriginalPrice);
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;
    if (isBestseller !== undefined) updateData.isBestseller = !!isBestseller;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (finalStockQuantity !== undefined) {
      updateData.availableStock = parseInt(finalStockQuantity);
      updateData.stockQuantity = parseInt(finalStockQuantity);
    }
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (finalReviewsCount !== undefined)
      updateData.reviewsCount = parseInt(finalReviewsCount);
    if (taxPercent !== undefined)
      updateData.taxPercent = parseFloat(taxPercent);
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    const transformedProduct = {
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount,
    };
    res.json(transformedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
};

// 🛍️ Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Product deleted" });
};
