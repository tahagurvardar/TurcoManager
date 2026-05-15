// src/models/Match.js
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    league: { type: String, required: true, index: true },
    week: { type: Number, default: 1, index: true },
    date: { type: Date },

    homeGoals: { type: Number, default: 0 },
    awayGoals: { type: Number, default: 0 },
    possession: {
      home: { type: Number, default: 50 },
      away: { type: Number, default: 50 },
    },
    shots: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },
    xg: {
      home: { type: Number, default: 0 },
      away: { type: Number, default: 0 },
    },
    liveEvents: [
      {
        minute: Number,
        type: {
          type: String,
          enum: ["kickoff", "goal", "chance", "save", "card", "injury", "substitution", "halftime", "fulltime"],
        },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        text: String,
      },
    ],
    events: [
      {
        minute: Number,
        type: {
          type: String,
          enum: ["shot", "corner", "yellow_card", "red_card", "goal", "offside", "injury"],
        },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        text: String,
      },
    ],
    playerRatings: [
      {
        player: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        rating: Number,
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        yellowCards: { type: Number, default: 0 },
        redCards: { type: Number, default: 0 },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "live", "played"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
