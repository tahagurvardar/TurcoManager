// src/routes/teamRoutes.js
const express = require("express");
const { getAdminTeamStatus, getMyTeamStatus, getTeams } = require("../controllers/teamController");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth, requireManagerTeam, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", asyncHandler(getTeams));
router.get("/my/status", requireAuth, requireManagerTeam, asyncHandler(getMyTeamStatus));
router.get("/admin/status", requireAuth, requireRole("admin"), asyncHandler(getAdminTeamStatus));

module.exports = router;
