// src/routes/adminRoutes.js
const express = require("express");
const { overview, teamStats } = require("../controllers/adminController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("admin"));
router.get("/overview", asyncHandler(overview));
router.get("/team-stats", asyncHandler(teamStats));

module.exports = router;
