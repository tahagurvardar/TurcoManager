// src/routes/standingsRoutes.js
const express = require("express");
const { getStandings } = require("../controllers/standingsController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(getStandings));

module.exports = router;
