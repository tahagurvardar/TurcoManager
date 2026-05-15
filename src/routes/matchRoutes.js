// src/routes/matchRoutes.js
const express = require("express");
const {
  getMatchCenterController,
  getMatches,
  simulateMatchController,
  simulateWeekController,
} = require("../controllers/matchController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getMatches));
router.get("/simulate-week", requireAuth, requireRole("admin"), asyncHandler(simulateWeekController));
router.get("/:id/center", asyncHandler(getMatchCenterController));
router.get("/:id/simulate", requireAuth, requireRole("admin"), asyncHandler(simulateMatchController));

module.exports = router;
