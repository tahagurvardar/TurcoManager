// src/routes/financeRoutes.js
const express = require("express");
const { myFinances, signSponsorship } = require("../controllers/financeController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("manager"));
router.get("/my", asyncHandler(myFinances));
router.post("/sponsorships/:tier/sign", asyncHandler(signSponsorship));

module.exports = router;
