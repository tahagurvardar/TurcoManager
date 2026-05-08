// src/controllers/playerController.js
const Player = require('../models/Player');
const Team = require('../models/Team');

// Tüm oyuncuları getir
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find().populate('team', 'name league');
    res.json(players);
  } catch (err) {
    console.error('getPlayers error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Belirli bir takımın oyuncuları
exports.getPlayersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const players = await Player.find({ team: teamId }).populate('team', 'name league');
    res.json(players);
  } catch (err) {
    console.error('getPlayersByTeam error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni oyuncu ekle
exports.createPlayer = async (req, res) => {
  try {
    const { name, position, overall, age, teamId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(400).json({ message: 'Geçersiz takım ID' });
    }

    const player = await Player.create({
      name,
      position,
      overall,
      age,
      team: team._id,
    });

    res.status(201).json(player);
  } catch (err) {
    console.error('createPlayer error:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};
