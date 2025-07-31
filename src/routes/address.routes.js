const router = require("express").Router();
const { protect } = require("../middleware/auth");
const addressController = require("../controllers/address.controller");
router.use(protect); // Protect all routes in this file
router.post("/", addressController.addAddress);
// Get all addresses for the logged-in user
router.get("/", addressController.getAddresses);
// Update an address
router.put("/:id", addressController.updateAddress);
// Delete an address
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
