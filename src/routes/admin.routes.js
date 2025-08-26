const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const adminController = require("../controllers/admin.controller");
const addressController = require("../controllers/address.controller");

router.get("/users", protect, adminOnly, adminController.getAllUsers);
router.get("/orders", protect, adminOnly, adminController.getAllOrders);
router.get(
  "/dashboard/stats",
  protect,
  adminOnly,
  adminController.getDashboardStats
);

// Pincode management
router.post(
  "/pincode",
  protect,
  adminOnly,
  addressController.managePincodeDeliveryPrice
);
router.get("/pincodes", protect, adminOnly, addressController.getAllPincodes);

module.exports = router;
