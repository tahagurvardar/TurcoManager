// src/routes/standingsRoutes.js
const express = require('express');
const Match = require('../models/Match');
const Team = require('../models/Team');

const router = express.Router();

/**
 * GET /api/standings?league=Süper%20Lig
 * Oynanmış maçlara göre puan durumu hesaplar.
 */
router.get('/', async (req, res) => {
  try {
    const league = req.query.league;

    if (!league) {
      return res
        .status(400)
        .json({ message: 'Lütfen ?league=Süper%20Lig gibi bir league parametresi gönderin.' });
    }

    // Bu ligdeki tüm takımları al (hiç maç oynamamış olsa bile tabloya girsin)
    const teams = await Team.find({ league });

    // Oynanmış maçları al
    const matches = await Match.find({ league, status: 'played' })
      .populate('homeTeam', 'name shortName')
      .populate('awayTeam', 'name shortName');

    // Tablo objesi
    const table = {};

    // Her takımı 0 istatistikle tabloya ekle
    for (const team of teams) {
      table[team._id.toString()] = {
        teamId: team._id,
        name: team.name,
        shortName: team.shortName || '',
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0
      };
    }

    // Maçları dolaş, istatistikleri hesapla
    for (const m of matches) {
      const homeId = m.homeTeam._id.toString();
      const awayId = m.awayTeam._id.toString();

      const homeGoals = m.homeGoals ?? 0;
      const awayGoals = m.awayGoals ?? 0;

      const home = table[homeId];
      const away = table[awayId];

      if (!home || !away) continue;

      // Maç oynandı
      home.played += 1;
      away.played += 1;

      home.goalsFor += homeGoals;
      home.goalsAgainst += awayGoals;
      away.goalsFor += awayGoals;
      away.goalsAgainst += homeGoals;

      // Sonuç
      if (homeGoals > awayGoals) {
        home.wins += 1;
        away.losses += 1;
        home.points += 3;
      } else if (homeGoals < awayGoals) {
        away.wins += 1;
        home.losses += 1;
        away.points += 3;
      } else {
        home.draws += 1;
        away.draws += 1;
        home.points += 1;
        away.points += 1;
      }
    }

    // Gol averajını hesapla
    for (const id of Object.keys(table)) {
      const row = table[id];
      row.goalDiff = row.goalsFor - row.goalsAgainst;
    }

    // Objeyi diziye çevir ve sırala
    const standings = Object.values(table).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.name.localeCompare(b.name);
    });

    res.json({
      league,
      teamCount: teams.length,
      matchCount: matches.length,
      standings
    });
  } catch (err) {
    console.error('Standings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
