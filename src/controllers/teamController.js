// src/controllers/teamController.js
const Team = require('../models/Team');

// Tüm takımları getir
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error('Takım listeleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// Yeni takım oluştur
const createTeam = async (req, res) => {
  try {
    const { name, shortName, league, budget } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Takım ismi zorunludur.' });
    }

    const existing = await Team.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Bu takım zaten kayıtlı.' });
    }

    const team = await Team.create({
      name,
      shortName,
      league,
      budget,
    });

    res.status(201).json(team);
  } catch (err) {
    console.error('Takım oluşturma hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  getTeams,
  createTeam,
};
