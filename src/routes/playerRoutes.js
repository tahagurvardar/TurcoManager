// src/routes/playerRoutes.js
const express = require("express");
const { getPlayerDetail, getPlayers } = require("../controllers/playerController");
const { trainPlayer, trainTeam } = require("../controllers/trainingController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getPlayers));
router.get("/:id", asyncHandler(getPlayerDetail));
router.post("/training/team", requireAuth, requireRole("manager"), asyncHandler(trainTeam));
router.post("/train-team/:teamId", requireAuth, requireRole("manager"), asyncHandler(trainTeam));
router.post("/:id/train", requireAuth, requireRole("manager"), asyncHandler(trainPlayer));

module.exports = router;
