// src/models/Team.js
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    shortName: String, // Örn: "GS", "FB"
    league: String,    // Örn: "Süper Lig"
    budget: {
      type: Number,
      default: 0,
    },
    // Moral / form / kimya gibi değerler:
    morale: {
      type: Number,
      default: 100,
    },
    form: {
      type: Number,
      default: 100,
    },
    chemistry: {
      type: Number,
      default: 100,
    },
    fatigue: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
