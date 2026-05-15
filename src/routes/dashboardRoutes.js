// src/routes/dashboardRoutes.js
const express = require("express");
const { adminDashboard, managerDashboard } = require("../controllers/dashboardController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/manager", requireAuth, requireRole("manager"), asyncHandler(managerDashboard));
router.get("/admin", requireAuth, requireRole("admin"), asyncHandler(adminDashboard));

module.exports = router;
