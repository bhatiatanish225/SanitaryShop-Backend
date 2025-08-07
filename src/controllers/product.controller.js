const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary =
  require("../utils/cloudinary").default || require("../utils/cloudinary");
// 🛍️ Get all products (with optional filters and pagination)

const handleProductImages = async (productId, images, transaction = prisma) => {
  if (!Array.isArray(images) || images.length === 0) return;

  // First, delete existing images for this product
  await transaction.productImage.deleteMany({
    where: { productId: parseInt(productId) },
  });

  // Process each image - handle both string URLs and base64/file uploads
  const imageData = await Promise.all(
    images.map(async (image, index) => {
      let imageUrl = "";
      let altText = "";
      let sortOrder = index;

      if (typeof image === "string") {
        // Simple string URL
        imageUrl = image;
        altText = `Product image ${index + 1}`;
      } else if (typeof image === "object") {
        if (image.imageUrl) {
          // Object with imageUrl property
          imageUrl = image.imageUrl;
          altText = image.altText || `Product image ${index + 1}`;
          sortOrder = image.sortOrder || index;
        } else if (image.startsWith && image.startsWith("data:image/")) {
          // Base64 image - upload to Cloudinary
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: "products",
            });
            imageUrl = result.secure_url;
            altText = `Product image ${index + 1}`;
          } catch (uploadError) {
            console.error("Error uploading image to Cloudinary:", uploadError);
            throw new Error(`Failed to upload image ${index + 1}`);
          }
        }
      }

      if (!imageUrl) {
        throw new Error(`Invalid image format at index ${index}`);
      }

      return {
        productId: parseInt(productId),
        imageUrl,
        altText,
        sortOrder,
      };
    })
  );

  // Bulk create all images
  if (imageData.length > 0) {
    await transaction.productImage.createMany({
      data: imageData,
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      categoryId,
      search,
      isFeatured,
      isBestseller,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Convert to integers
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per page (reduced from 100)
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      AND: [
        category ? { categoryId: parseInt(category) } : {},
        categoryId ? { categoryId: parseInt(categoryId) } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { itemCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        isFeatured !== undefined ? { isFeatured: isFeatured === "true" } : {},
        isBestseller !== undefined
          ? { isBestseller: isBestseller === "true" }
          : {},
      ].filter((condition) => Object.keys(condition).length > 0),
    };

    // Get total count for pagination
    const totalProducts = await prisma.product.count({
      where: whereClause,
    });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: {
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: skip,
      take: limitNum,
    });

    // Transform response to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      image_url: product.imageUrl, // Frontend expects image_url
      stock_quantity: product.availableStock, // Frontend expects stock_quantity
      original_price: product.originalPrice, // Frontend expects original_price
      reviews_count: product.reviewsCount || 0, // Frontend expects reviews_count

      images: product.images.map((img) => ({
        image_url: img.imageUrl,
        alt_text: img.altText,
        sort_order: img.sortOrder,
      })),
    }));

    // Return paginated response
    const response = {
      products: transformedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        totalProducts: totalProducts,
        hasNextPage: pageNum < Math.ceil(totalProducts / limitNum),
        hasPreviousPage: pageNum > 1,
        limit: limitNum,
      },
    };

    console.log(
      `Returning ${transformedProducts.length} products (page ${pageNum}/${response.pagination.totalPages})`
    );
    return res.json(response);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// 🛍️ Get single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        images: {
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Transform response to match frontend expectations
    const transformedProduct = {
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount || 0,
      images: product.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl, // Frontend expects this
        image_url: img.imageUrl, // Legacy format
        altText: img.altText, // Frontend expects this
        alt_text: img.altText, // Legacy format
        sortOrder: img.sortOrder, // Frontend expects this
        sort_order: img.sortOrder, // Legacy format
      })),
    };

    res.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
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
      // CSV fields
      itemCode,
      brandGroup,
      sdp,
      nrp,
      mrp,
      hsn,
      sgst,
      cgst,
      igst,
      cess,
      // NEW FIELD FOR IMAGES ARRAY - support both formats
      images,
      imageUrls, // Frontend sends this
    } = req.body;

    // Handle both images and imageUrls formats for compatibility
    const finalImages = images || imageUrls;

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

    // Validate required fields
    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Name and categoryId are required",
      });
    }

    // Generate itemCode if not provided (required field)
    const finalItemCode =
      itemCode ||
      `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build data object carefully to avoid undefined values
    const productData = {
      name: String(name),
      description: description ? String(description) : null,
      price: parseFloat(price) || 0,
      categoryId: parseInt(categoryId),
      itemCode: String(finalItemCode), // Always provide itemCode
      isFeatured: !!isFeatured,
      isBestseller: !!isBestseller,
      rating: parseFloat(rating) || 0,
      availableStock: parseInt(finalStockQuantity) || 0,
      stockQuantity: parseInt(finalStockQuantity) || 0,
      reviewsCount: parseInt(finalReviewsCount) || 0,
      taxPercent: parseFloat(taxPercent) || 0,
    };

    // Only add optional fields if they have values
    if (finalOriginalPrice)
      productData.originalPrice = parseFloat(finalOriginalPrice);
    if (finalImageUrl) productData.imageUrl = String(finalImageUrl);
    if (brandGroup) productData.brandGroup = String(brandGroup);
    if (sdp) productData.sdp = parseFloat(sdp);
    if (nrp) productData.nrp = parseFloat(nrp);
    if (mrp) productData.mrp = parseFloat(mrp);
    if (hsn) productData.hsn = String(hsn);
    if (sgst) productData.sgst = parseFloat(sgst);
    if (cgst) productData.cgst = parseFloat(cgst);
    if (igst) productData.igst = parseFloat(igst);
    if (cess) productData.cess = parseFloat(cess);

    // Use transaction to create product and handle images safely
    const result = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: productData,
      });

      // Handle the image array if provided
      if (Array.isArray(finalImages) && finalImages.length > 0) {
        await handleProductImages(product.id, finalImages, tx);
      }

      // Return product with images
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    const transformedProduct = {
      ...result,
      image_url: result.imageUrl,
      stock_quantity: result.availableStock,
      original_price: result.originalPrice,
      reviews_count: result.reviewsCount,
      images: result.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl, // Frontend expects this
        image_url: img.imageUrl, // Legacy format
        altText: img.altText, // Frontend expects this
        alt_text: img.altText, // Legacy format
        sortOrder: img.sortOrder, // Frontend expects this
        sort_order: img.sortOrder, // Legacy format
      })),
    };

    res.status(201).json(transformedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    console.error("Request body:", req.body);
    res.status(500).json({
      message: "Error creating product",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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
      // CSV fields
      itemCode,
      brandGroup,
      sdp,
      nrp,
      mrp,
      hsn,
      sgst,
      cgst,
      igst,
      cess,
      // NEW FIELD FOR IMAGES ARRAY - support both formats
      images,
      imageUrls, // Frontend sends this
    } = req.body;

    // Handle both images and imageUrls formats for compatibility
    const finalImages = images || imageUrls;

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

    // CSV fields
    if (itemCode !== undefined) updateData.itemCode = itemCode;
    if (brandGroup !== undefined) updateData.brandGroup = brandGroup;
    if (sdp !== undefined) updateData.sdp = parseFloat(sdp);
    if (nrp !== undefined) updateData.nrp = parseFloat(nrp);
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
    if (hsn !== undefined) updateData.hsn = hsn;
    if (sgst !== undefined) updateData.sgst = parseFloat(sgst);
    if (cgst !== undefined) updateData.cgst = parseFloat(cgst);
    if (igst !== undefined) updateData.igst = parseFloat(igst);
    if (cess !== undefined) updateData.cess = parseFloat(cess);

    // Use transaction to update product and handle images safely
    const result = await prisma.$transaction(async (tx) => {
      // Update the product
      const product = await tx.product.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      // Handle images if provided
      if (Array.isArray(finalImages)) {
        await handleProductImages(product.id, finalImages, tx);
      }

      // Return updated product with images
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          images: {
            select: {
              id: true,
              imageUrl: true,
              altText: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    const transformedProduct = {
      ...result,
      image_url: result.imageUrl,
      stock_quantity: result.availableStock,
      original_price: result.originalPrice,
      reviews_count: result.reviewsCount,
      images: result.images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl, // Frontend expects this
        image_url: img.imageUrl, // Legacy format
        altText: img.altText, // Frontend expects this
        alt_text: img.altText, // Legacy format
        sortOrder: img.sortOrder, // Frontend expects this
        sort_order: img.sortOrder, // Legacy format
      })),
    };

    res.json(transformedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      message: "Error updating product",
      error: err.message,
    });
  }
};

// 🛍️ Delete product (Admin only) - Images will cascade delete
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Use transaction for safe deletion
    const result = await prisma.$transaction(async (tx) => {
      // Check if product exists
      const product = await tx.product.findUnique({
        where: { id: parseInt(id) },
        include: {
          images: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Delete the product (images will cascade delete due to schema)
      const deletedProduct = await tx.product.delete({
        where: { id: parseInt(id) },
      });

      return {
        deletedProduct,
        deletedImagesCount: product.images.length,
      };
    });

    res.json({
      message: "Product deleted successfully",
      product: result.deletedProduct,
      deletedImagesCount: result.deletedImagesCount,
    });
  } catch (error) {
    if (error.message === "Product not found" || error.code === "P2025") {
      return res.status(404).json({ message: "Product not found" });
    }
    console.error("Error deleting product:", error);
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// 🛍️ Simple product list (for backward compatibility)
exports.getSimpleProducts = async (req, res) => {
  try {
    const { categoryId, search, limit = 10 } = req.query;

    const limitNum = Math.min(parseInt(limit), 20); // Max 20 for simple endpoint

    const whereClause = {};
    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    // Transform response to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount || 0,
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error("Error in getSimpleProducts:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

//what if users want to change the particular product's particular image
const handleProductImageUpdate = async (productId, imageId, imageData) => {
  try {
    const updatedImage = await prisma.productImage.update({
      where: { id: imageId },
      data: imageData,
    });
    return updatedImage;
  } catch (error) {
    console.error("Error updating product image:", error);
    throw new Error("Could not update product image");
  }
};

exports.updateProductImage = async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const imageData = req.body;

    const updatedImage = await handleProductImageUpdate(
      parseInt(productId),
      parseInt(imageId),
      imageData
    );
    res.json({
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error updating product image:", error);
    res.status(500).json({ message: "Error updating product image" });
  }
};

// 🖼️ Get all images for a product
exports.getProductImages = async (req, res) => {
  try {
    const { productId } = req.params;

    const images = await prisma.productImage.findMany({
      where: { productId: parseInt(productId) },
      orderBy: { sortOrder: "asc" },
    });

    const transformedImages = images.map((img) => ({
      id: img.id,
      image_url: img.imageUrl,
      alt_text: img.altText,
      sort_order: img.sortOrder,
      created_at: img.createdAt,
    }));

    res.json({ images: transformedImages });
  } catch (error) {
    console.error("Error fetching product images:", error);
    res.status(500).json({ message: "Error fetching images" });
  }
};

// 🖼️ Add single image to product
exports.addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageUrl, image_url, altText, alt_text, sortOrder, sort_order } =
      req.body;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const finalImageUrl = image_url || imageUrl;
    const finalAltText = alt_text || altText || "Product image";
    const finalSortOrder = sort_order || sortOrder || 0;

    if (!finalImageUrl) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const newImage = await prisma.productImage.create({
      data: {
        productId: parseInt(productId),
        imageUrl: finalImageUrl,
        altText: finalAltText,
        sortOrder: parseInt(finalSortOrder),
      },
    });

    const transformedImage = {
      id: newImage.id,
      image_url: newImage.imageUrl,
      alt_text: newImage.altText,
      sort_order: newImage.sortOrder,
    };

    res.status(201).json({
      message: "Image added successfully",
      image: transformedImage,
    });
  } catch (error) {
    console.error("Error adding product image:", error);
    res.status(500).json({ message: "Error adding image" });
  }
};

// 🖼️ Delete single image
exports.deleteProductImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    const deletedImage = await prisma.productImage.delete({
      where: { id: parseInt(imageId) },
    });

    res.json({
      message: "Image deleted successfully",
      deletedImage,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Image not found" });
    }
    console.error("Error deleting product image:", error);
    res.status(500).json({ message: "Error deleting image" });
  }
};
