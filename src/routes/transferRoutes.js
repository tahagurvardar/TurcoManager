// src/routes/transferRoutes.js
const express = require("express");
const { bid, listForTransfer, market } = require("../controllers/transferController");
const { requireAuth, requireRole } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(requireAuth, requireRole("manager"));
router.get("/market", asyncHandler(market));
router.post("/bid", asyncHandler(bid));
router.post("/list/:id", asyncHandler(listForTransfer));

module.exports = router;
