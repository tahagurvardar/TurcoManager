// src/controllers/matchController.js
const Match = require('../models/Match');

// Tüm maçları getir
exports.getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('homeTeam', 'name league')
      .populate('awayTeam', 'name league')
      .sort({ matchDate: 1 });

    return res.json(matches);
  } catch (err) {
    console.error('getMatches hatası:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Yeni maç oluştur
exports.createMatch = async (req, res) => {
  try {
    const { homeTeam, awayTeam, matchDate } = req.body;

    if (!homeTeam || !awayTeam || !matchDate) {
      return res.status(400).json({ message: 'homeTeam, awayTeam ve matchDate zorunlu.' });
    }

    const match = await Match.create({
      homeTeam,
      awayTeam,
      matchDate,
    });

    return res.status(201).json(match);
  } catch (err) {
    console.error('createMatch hatası:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
