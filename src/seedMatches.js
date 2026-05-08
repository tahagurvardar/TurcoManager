// src/seedMatches.js
require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./models/Team');
const Match = require('./models/Match');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB bağlantısı OK (matches seed)');

    // İstersen eski maçları sil
    await Match.deleteMany({});
    console.log('Eski maçlar silindi.');

    // Takımları isimden bul
    const gs = await Team.findOne({ name: 'Galatasaray' });
    const fb = await Team.findOne({ name: 'Fenerbahçe' });
    const bjk = await Team.findOne({ name: 'Beşiktaş' });

    if (!gs || !fb || !bjk) {
      console.log('Takımlardan biri bulunamadı. İsimler doğru mu?');
      console.log({ gs, fb, bjk });
      process.exit(1);
    }

    const now = new Date();

    const matches = [
      {
        homeTeam: gs._id,
        awayTeam: fb._id,
        league: 'Süper Lig',
        week: 1,
        date: now,
      },
      {
        homeTeam: fb._id,
        awayTeam: bjk._id,
        league: 'Süper Lig',
        week: 2,
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        homeTeam: bjk._id,
        awayTeam: gs._id,
        league: 'Süper Lig',
        week: 3,
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      },
    ];

    const result = await Match.insertMany(matches);
    console.log(`Toplam ${result.length} maç eklendi.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed matches error:', err);
    process.exit(1);
  }
}

run();
