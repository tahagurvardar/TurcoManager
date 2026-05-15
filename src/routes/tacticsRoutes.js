// src/routes/tacticsRoutes.js
const express = require("express");
const { show, update } = require("../controllers/tacticsController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("manager"));
router.get("/my", asyncHandler(show));
router.put("/my", asyncHandler(update));

module.exports = router;
