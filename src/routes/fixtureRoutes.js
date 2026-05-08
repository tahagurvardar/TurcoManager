// src/routes/fixtureRoutes.js
const express = require('express');
const Match = require('../models/Match');
const Team = require('../models/Team');

const router = express.Router();

/**
 * Round-robin fikstür üretimi (tek devre)
 * teams: Team doc array
 * return: { week, homeTeam, awayTeam } listesi
 */
function generateSingleRound(teams) {
  const teamIds = teams.map((t) => t._id.toString());

  // Takım sayısı tek ise BYE (boş) ekle
  if (teamIds.length % 2 === 1) {
    teamIds.push(null); // bye
  }

  const n = teamIds.length;
  const rounds = n - 1;
  const half = n / 2;

  const fixtures = [];

  let arr = [...teamIds];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < half; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];

      if (!home || !away) continue; // BYE varsa maç yazma

      fixtures.push({
        week: round + 1,
        homeTeam: home,
        awayTeam: away
      });
    }

    // Döndürme algoritması: ilk eleman sabit kalır, diğerleri dönüyor
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr = [fixed, ...rest];
  }

  return fixtures;
}

/**
 * GET /api/fixtures/generate?league=Süper Lig&double=true
 * - Belirtilen lig için tüm sezona ait fikstürü üretir
 * - O ligdeki mevcut maçları siler
 */
router.get('/generate', async (req, res) => {
  try {
    const league = req.query.league || 'Süper Lig';
    const doubleRound = req.query.double !== 'false'; // default: true

    const teams = await Team.find({ league });

    if (teams.length < 2) {
      return res.status(400).json({
        message: `${league} için en az 2 takım olmalı. Şu an takım sayısı: ${teams.length}`
      });
    }

    // O ligin mevcut maçlarını temizle
    await Match.deleteMany({ league });

    // Tek devrelik fikstürü üret
    const firstRound = generateSingleRound(teams);

    let allFixtures = [...firstRound];

    // Çift devre istiyorsak ikinci devreyi ters saha ile ekle
    if (doubleRound) {
      const maxWeek = firstRound.reduce(
        (max, f) => (f.week > max ? f.week : max),
        0
      );

      const secondRound = firstRound.map((f) => ({
        week: f.week + maxWeek,
        homeTeam: f.awayTeam,
        awayTeam: f.homeTeam
      }));

      allFixtures = [...firstRound, ...secondRound];
    }

    // Tarih atama (opsiyonel): 1. hafta bugünden başlasın, her hafta +7 gün
    const baseDate = new Date();
    const matchesToInsert = allFixtures.map((f) => {
      const matchDate = new Date(baseDate);
      matchDate.setDate(baseDate.getDate() + (f.week - 1) * 7);

      return {
        league,
        week: f.week,
        date: matchDate,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        homeGoals: 0,
        awayGoals: 0,
        status: 'pending'
      };
    });

    const inserted = await Match.insertMany(matchesToInsert);

    res.json({
      message: `${league} için fikstür oluşturuldu.`,
      league,
      teamCount: teams.length,
      totalMatches: inserted.length,
      weeks: inserted.reduce(
        (max, m) => (m.week > max ? m.week : max),
        0
      )
    });
  } catch (err) {
    console.error('Fixture generate error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
