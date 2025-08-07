const router = require("express").Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSimpleProducts,
} = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Require login for viewing products
router.get("/", protect, getAllProducts);
router.get("/simple", protect, getSimpleProducts); // Simple endpoint for backward compatibility
router.get("/:id", protect, getProductById);

// Admin-only routes
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
