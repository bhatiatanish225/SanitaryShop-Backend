const router = require("express").Router();
const { protect } = require("../middleware/auth");
const addressController = require("../controllers/address.controller");

// User address routes (require authentication)
router.post("/", protect, addressController.addAddress);
router.get("/", protect, addressController.getAddresses);
router.put("/:id", protect, addressController.updateAddress);
router.delete("/:id", protect, addressController.deleteAddress);

// Delivery pricing routes (require authentication)
router.get(
  "/delivery-price/pincode/:pincode",
  protect,
  addressController.getDeliveryPrice
);
router.get(
  "/delivery-price/address/:addressId",
  protect,
  addressController.getAddressDeliveryPrice
);

module.exports = router;
