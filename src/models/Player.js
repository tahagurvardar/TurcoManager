// src/models/Player.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true }, // KL, DEF, OS, FVT
    age: { type: Number, required: true },
    overall: { type: Number, required: true },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    league: {
      type: String,
      required: true
    },

    // --- GELİŞİM SİSTEMİ ALANLARI ---
    xp: {
      type: Number,
      default: 0 // antrenman tecrübesi
    },
    form: {
      type: Number,
      default: 100 // bireysel form (0–120 arası düşünebilirsin)
    },
    fitness: {
      type: Number,
      default: 100 // kondisyon (0–100)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
