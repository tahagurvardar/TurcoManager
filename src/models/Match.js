// src/models/Match.js
const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    league: { type: String, required: true },
    week: { type: Number, default: 1 },
    date: { type: Date },

    homeGoals: { type: Number, default: 0 },
    awayGoals: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'played'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
