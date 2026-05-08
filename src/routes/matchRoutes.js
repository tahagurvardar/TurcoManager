const express = require("express");
const Match = require("../models/Match");
const Player = require("../models/Player");

const router = express.Router();

/**
 * Helpers
 */
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const randomGoal = (base) => {
  let val = base + (Math.random() - 0.5); // küçük sapma
  val = Math.max(0, Math.min(5, val));    // 0–5
  return Math.round(val);
};

/**
 * Team power:
 * - avgOverall (squad)
 * - dynamics: morale+form+chemistry-fatigue
 */
const calcTeamPower = (team, players) => {
  const morale = team.morale ?? 100;
  const form = team.form ?? 100;
  const chemistry = team.chemistry ?? 100;
  const fatigue = team.fatigue ?? 0;

  // 100 ölçeğine yakın bir dinamik puan
  const dynamics = (morale + form + chemistry - fatigue) / 3;

  const avgOverall =
    players.length > 0
      ? players.reduce((sum, p) => sum + (p.overall || 75), 0) / players.length
      : 75;

  // 0.7 kadro gücü, 0.3 takım dinamikleri
  return avgOverall * 0.7 + dynamics * 0.3;
};

/**
 * Match effects:
 * - önce küçük recovery (fatigue düşsün ki şişmesin)
 * - sonra maç yorgunluğu ekle
 * - morale/form/chemistry ayarla
 */
const applyMatchEffects = async (homeTeamDoc, awayTeamDoc, homeGoals, awayGoals) => {
  if (!homeTeamDoc || !awayTeamDoc) return;

  const homeWin = homeGoals > awayGoals;
  const awayWin = awayGoals > homeGoals;
  const draw = homeGoals === awayGoals;

  // default values
  homeTeamDoc.morale ??= 100;
  homeTeamDoc.form ??= 100;
  homeTeamDoc.chemistry ??= 100;
  homeTeamDoc.fatigue ??= 0;

  awayTeamDoc.morale ??= 100;
  awayTeamDoc.form ??= 100;
  awayTeamDoc.chemistry ??= 100;
  awayTeamDoc.fatigue ??= 0;

  // 1) mini recovery (her maçtan önce hafif toparlanma)
  homeTeamDoc.fatigue = clamp(homeTeamDoc.fatigue - 2, 0, 150);
  awayTeamDoc.fatigue = clamp(awayTeamDoc.fatigue - 2, 0, 150);

  // 2) result effects
  if (homeWin) {
    homeTeamDoc.morale = clamp(homeTeamDoc.morale + 3, 0, 120);
    homeTeamDoc.form = clamp(homeTeamDoc.form + 2, 0, 120);
    homeTeamDoc.chemistry = clamp(homeTeamDoc.chemistry + 1, 0, 120);

    awayTeamDoc.morale = clamp(awayTeamDoc.morale - 3, 0, 120);
    awayTeamDoc.form = clamp(awayTeamDoc.form - 2, 0, 120);
    awayTeamDoc.chemistry = clamp(awayTeamDoc.chemistry - 0.5, 0, 120);
  } else if (awayWin) {
    awayTeamDoc.morale = clamp(awayTeamDoc.morale + 3, 0, 120);
    awayTeamDoc.form = clamp(awayTeamDoc.form + 2, 0, 120);
    awayTeamDoc.chemistry = clamp(awayTeamDoc.chemistry + 1, 0, 120);

    homeTeamDoc.morale = clamp(homeTeamDoc.morale - 3, 0, 120);
    homeTeamDoc.form = clamp(homeTeamDoc.form - 2, 0, 120);
    homeTeamDoc.chemistry = clamp(homeTeamDoc.chemistry - 0.5, 0, 120);
  } else if (draw) {
    homeTeamDoc.morale = clamp(homeTeamDoc.morale + 1, 0, 120);
    awayTeamDoc.morale = clamp(awayTeamDoc.morale + 1, 0, 120);

    homeTeamDoc.form = clamp(homeTeamDoc.form + 0.5, 0, 120);
    awayTeamDoc.form = clamp(awayTeamDoc.form + 0.5, 0, 120);

    homeTeamDoc.chemistry = clamp(homeTeamDoc.chemistry + 0.3, 0, 120);
    awayTeamDoc.chemistry = clamp(awayTeamDoc.chemistry + 0.3, 0, 120);
  }

  // 3) fatigue increase (maç oynandı)
  homeTeamDoc.fatigue = clamp(homeTeamDoc.fatigue + 6, 0, 150);
  awayTeamDoc.fatigue = clamp(awayTeamDoc.fatigue + 6, 0, 150);

  await homeTeamDoc.save();
  await awayTeamDoc.save();
};

/**
 * 1) GET /api/matches (filters: league, week)
 */
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.league) filter.league = req.query.league;
    if (req.query.week) filter.week = Number(req.query.week);

    const matches = await Match.find(filter)
      .populate("homeTeam", "name shortName league")
      .populate("awayTeam", "name shortName league")
      .sort({ week: 1 });

    res.json(matches);
  } catch (err) {
    console.error("Match list error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 2) GET /api/matches/simulate-week?week=1&league=Süper%20Lig
 */
router.get("/simulate-week", async (req, res) => {
  try {
    const week = Number(req.query.week);
    const league = req.query.league;

    if (!week) {
      return res.status(400).json({ message: "Geçerli bir week değeri belirtmelisiniz." });
    }

    const filter = { week, status: "pending" };
    if (league) filter.league = league;

    let matches = await Match.find(filter).populate("homeTeam").populate("awayTeam");
    if (!matches.length) {
      return res.status(404).json({ message: "Bu hafta için simüle edilecek (pending) maç bulunamadı." });
    }

    // Performans: tüm oyuncuları tek seferde çek, map yap
    const teamIds = Array.from(
      new Set(
        matches.flatMap((m) => [String(m.homeTeam?._id), String(m.awayTeam?._id)]).filter(Boolean)
      )
    );

    const allPlayers = await Player.find({ team: { $in: teamIds } }).select("team overall");
    const playersByTeam = new Map();
    for (const p of allPlayers) {
      const tid = String(p.team);
      if (!playersByTeam.has(tid)) playersByTeam.set(tid, []);
      playersByTeam.get(tid).push(p);
    }

    for (let match of matches) {
      const home = match.homeTeam;
      const away = match.awayTeam;

      const homePlayers = playersByTeam.get(String(home._id)) || [];
      const awayPlayers = playersByTeam.get(String(away._id)) || [];

      let homePower = calcTeamPower(home, homePlayers) * 1.1;
      let awayPower = calcTeamPower(away, awayPlayers);

      const totalPower = homePower + awayPower || 1;

      const expectedHomeGoals = (homePower / totalPower) * 3;
      const expectedAwayGoals = (awayPower / totalPower) * 3;

      const homeGoals = randomGoal(expectedHomeGoals);
      const awayGoals = randomGoal(expectedAwayGoals);

      match.homeGoals = homeGoals;
      match.awayGoals = awayGoals;
      match.status = "played";

      await match.save();
      await applyMatchEffects(home, away, homeGoals, awayGoals);
    }

    const result = matches.map((m) => ({
      id: m._id,
      league: m.league,
      week: m.week,
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      status: m.status,
    }));

    res.json({
      message: `Hafta ${week} için ${matches.length} maç simüle edildi.`,
      matches: result,
    });
  } catch (err) {
    console.error("Week simulate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * 3) GET /api/matches/:id/simulate
 */
router.get("/:id/simulate", async (req, res) => {
  try {
    const matchId = req.params.id;

    let match = await Match.findById(matchId).populate("homeTeam").populate("awayTeam");
    if (!match) return res.status(404).json({ message: "Maç bulunamadı." });

    if (match.status === "played") {
      return res.json({ message: "Bu maç zaten oynanmış.", match });
    }

    const home = match.homeTeam;
    const away = match.awayTeam;

    const homePlayers = await Player.find({ team: home._id }).select("overall");
    const awayPlayers = await Player.find({ team: away._id }).select("overall");

    let homePower = calcTeamPower(home, homePlayers) * 1.1;
    let awayPower = calcTeamPower(away, awayPlayers);

    const totalPower = homePower + awayPower || 1;

    const expectedHomeGoals = (homePower / totalPower) * 3;
    const expectedAwayGoals = (awayPower / totalPower) * 3;

    const homeGoals = randomGoal(expectedHomeGoals);
    const awayGoals = randomGoal(expectedAwayGoals);

    match.homeGoals = homeGoals;
    match.awayGoals = awayGoals;
    match.status = "played";

    await match.save();
    await applyMatchEffects(home, away, homeGoals, awayGoals);

    res.json({ message: "Maç simüle edildi.", match });
  } catch (err) {
    console.error("Match simulate error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
