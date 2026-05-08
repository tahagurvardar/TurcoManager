// src/routes/adminRoutes.js
const express = require("express");
const Team = require("../models/Team");
const Match = require("../models/Match");
const Player = require("../models/Player");

const router = express.Router();

/**
 * ADMIN: Takım dinamikleri (morale/form/chemistry/fatigue) listele
 * GET /api/admin/team-stats?league=Süper%20Lig
 */
router.get("/team-stats", async (req, res) => {
  try {
    const league = req.query.league;
    if (!league) return res.status(400).json({ message: "league zorunlu" });

    const teams = await Team.find({ league }).sort({ name: 1 });

    const data = teams.map((t) => ({
      teamId: t._id,
      name: t.name,
      shortName: t.shortName || "",
      morale: t.morale ?? 100,
      form: t.form ?? 100,
      chemistry: t.chemistry ?? 100,
      fatigue: t.fatigue ?? 0,
      updatedAt: t.updatedAt,
    }));

    res.json({ league, teamCount: data.length, teams: data });
  } catch (err) {
    console.error("team-stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
