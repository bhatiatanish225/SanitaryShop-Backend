const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getTricityStatus,
  setTricityStatus,
} = require("../controllers/location.controller");

// GET /api/location/istricity - Check if user is from tricity area (before payment)
router.get("/istricity", protect, getTricityStatus);

// POST /api/location/istricity - Set user's tricity status (on login)
router.post("/istricity", protect, setTricityStatus);

module.exports = router;
