// src/routes/fixtureRoutes.js
const express = require("express");
const { generateFixtures } = require("../controllers/fixtureController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/generate", requireAuth, requireRole("admin"), asyncHandler(generateFixtures));

module.exports = router;
