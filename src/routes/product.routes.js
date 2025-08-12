const router = require("express").Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimpleProducts,
  getProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
} = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getAllProducts);
router.get("/simple", getSimpleProducts); // Simple endpoint for backward compatibility
router.get("/:id", getProductById);

// Product image routes (require authentication)
router.get("/:productId/images", protect, getProductImages);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Admin-only product image management routes
router.post("/:productId/images", protect, adminOnly, addProductImage);
router.put(
  "/:productId/images/:imageId",
  protect,
  adminOnly,
  updateProductImage
);
router.delete("/images/:imageId", protect, adminOnly, deleteProductImage);

module.exports = router;
