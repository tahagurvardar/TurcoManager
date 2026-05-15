const express = require("express");
const { search } = require("../controllers/searchController");
const { requireAuth } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", requireAuth, asyncHandler(search));

module.exports = router;
