// src/routes/academyRoutes.js
const express = require("express");
const { index, promote } = require("../controllers/academyController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("manager"));
router.get("/", asyncHandler(index));
router.post("/promote", asyncHandler(promote));

module.exports = router;
