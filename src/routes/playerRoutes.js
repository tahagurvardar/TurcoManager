// src/routes/playerRoutes.js
const express = require('express');
const Player = require('../models/Player');

const router = express.Router();

/**
 * 1) Oyuncu listesi
 *    GET /api/players
 *    GET /api/players?teamId=...&league=...
 */
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.teamId) {
      filter.team = req.query.teamId;
    }
    if (req.query.league) {
      filter.league = req.query.league;
    }

    const players = await Player.find(filter)
      .populate('team', 'name')
      .sort({ overall: -1 });

    res.json(players);
  } catch (err) {
    console.error('Player list error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Basit antrenman kuralları:
 * - Her antrenmanda +0.3 OVR
 * - XP +10
 * - form +1, fitness -2
 * - Overall 95’i geçmesin
 */
const TRAIN_STEP = 0.3;
const TRAIN_XP = 10;
const MAX_OVR = 95;

function applyTraining(p) {
  let changed = false;

  if (p.overall < MAX_OVR) {
    p.overall = Math.min(MAX_OVR, p.overall + TRAIN_STEP);
    changed = true;
  }

  p.xp = (p.xp || 0) + TRAIN_XP;
  p.form = Math.min(120, (p.form || 100) + 1);
  p.fitness = Math.max(0, (p.fitness || 100) - 2);

  return changed;
}

/**
 * 2) Bir TAKIMIN tüm oyuncularını antrene et
 *    POST /api/players/train-team/:teamId
 */
router.post('/train-team/:teamId', async (req, res) => {
  try {
    const teamId = req.params.teamId;

    const players = await Player.find({ team: teamId });

    if (!players.length) {
      return res
        .status(404)
        .json({ message: 'Bu takıma ait oyuncu bulunamadı.' });
    }

    let changedCount = 0;

    for (const p of players) {
      const changed = applyTraining(p);
      if (changed) changedCount++;
      await p.save();
    }

    res.json({
      message: `Takım için antrenman yapıldı. ${players.length} oyuncu, ${changedCount} oyuncu OVR kazandı.`,
      playerCount: players.length,
      improvedCount: changedCount
    });
  } catch (err) {
    console.error('Team training error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * 3) Tek oyuncu antrenmanı
 *    POST /api/players/:id/train
 */
router.post('/:id/train', async (req, res) => {
  try {
    const playerId = req.params.id;
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı.' });
    }

    applyTraining(player);
    await player.save();

    res.json({
      message: `${player.name} için antrenman yapıldı.`,
      player
    });
  } catch (err) {
    console.error('Single player training error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
