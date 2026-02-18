const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMyProfile, updateProfile } = require("../controllers/userController");

router.get("/me", protect, getMyProfile);
router.get("/profile", protect, getMyProfile);
router.put("/update", protect, updateProfile);

module.exports = router;