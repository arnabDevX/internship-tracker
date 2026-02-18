const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    createApplication,
    getApplications,
    updateApplication,
    deleteApplication
  } = require("../controllers/applicationController");


router.post("/", protect, createApplication);
router.get("/", protect, getApplications);
router.put("/:id", protect, updateApplication);
router.delete("/:id", protect, deleteApplication);

module.exports = router;