// src/routes/teamRoutes.js
const express = require("express");
const Team = require("../models/Team");
const { requireAuth, requireRole, requireManagerTeam } = require("../middlewares/auth");

const router = express.Router();

/**
 * GET /api/teams?league=Süper%20Lig
 * Lig filtresi ile takım listesi
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.league) filter.league = req.query.league;

    const teams = await Team.find(filter).sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error("teams list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/teams/my/status?league=Süper%20Lig
 * Manager sadece kendi takımının morale/form/chemistry/fatigue değerlerini görür.
 * (admin da çağırabilir istersen)
 */
router.get("/my/status", requireAuth, requireManagerTeam, async (req, res) => {
  try {
    const league = req.query.league;
    if (!league) return res.status(400).json({ message: "league parametresi zorunlu." });

    // manager token içinden gelen teamName ile takımını buluyoruz
    const teamName = req.user.teamName;

    const team = await Team.findOne({ league, name: teamName });
    if (!team) return res.status(404).json({ message: "Takım bulunamadı." });

    res.json({
      teamId: team._id,
      name: team.name,
      league: team.league,
      morale: team.morale ?? 100,
      form: team.form ?? 100,
      chemistry: team.chemistry ?? 100,
      fatigue: team.fatigue ?? 0,
    });
  } catch (err) {
    console.error("my/status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * (Opsiyonel) Admin için: GET /api/teams/admin/status?league=Süper%20Lig
 * Ligdeki tüm takımların durumlarını listele
 */
router.get("/admin/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const league = req.query.league;
    if (!league) return res.status(400).json({ message: "league parametresi zorunlu." });

    const teams = await Team.find({ league }).sort({ name: 1 });

    res.json(
      teams.map((t) => ({
        teamId: t._id,
        name: t.name,
        morale: t.morale ?? 100,
        form: t.form ?? 100,
        chemistry: t.chemistry ?? 100,
        fatigue: t.fatigue ?? 0,
      }))
    );
  } catch (err) {
    console.error("admin/status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
