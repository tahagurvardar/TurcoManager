// src/models/Player.js
const mongoose = require("mongoose");

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value ?? 50) || 0));

const playerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: { type: String, required: true, enum: ["KL", "DEF", "OS", "FVT"] },
    age: { type: Number, required: true },
    overall: { type: Number, required: true, min: 1, max: 99 },
    potential: { type: Number, default: 78, min: 1, max: 99 },
    nationality: { type: String, default: "Türkiye" },
    preferredFoot: {
      type: String,
      enum: ["left", "right", "both"],
      default: "right",
    },
    value: { type: Number, default: 1000000 },
    wage: { type: Number, default: 12000 },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },
    league: {
      type: String,
      required: true,
      index: true,
    },

    xp: {
      type: Number,
      default: 0,
    },
    form: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      set: clampPercent,
    },
    fitness: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    morale: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      set: clampPercent,
    },
    development: {
      focus: {
        type: String,
        enum: ["overall", "fitness", "technical", "tactical", "youth"],
        default: "overall",
      },
      growthRate: { type: Number, default: 1 },
      lastTrainedAt: Date,
    },
    injury: {
      isInjured: { type: Boolean, default: false },
      type: { type: String, default: null },
      severity: {
        type: String,
        enum: ["minor", "medium", "major", null],
        default: null,
      },
      returnDate: { type: Date, default: null },
    },
    injuryStatus: {
      type: String,
      enum: ["healthy", "injured"],
      default: "healthy",
      index: true,
    },
    injuryType: { type: String, default: null },
    injuryUntilWeek: { type: Number, default: null },
    transfer: {
      listed: { type: Boolean, default: false },
      askingPrice: { type: Number, default: 0 },
      interestLevel: { type: Number, default: 35, min: 0, max: 100 },
      lastOffer: { type: Number, default: 0 },
    },
    youth: {
      isYouth: { type: Boolean, default: false },
      academyLevel: { type: Number, default: 0 },
      promotedAt: Date,
    },
    stats: {
      appearances: { type: Number, default: 0 },
      goals: { type: Number, default: 0 },
      assists: { type: Number, default: 0 },
      cleanSheets: { type: Number, default: 0 },
      yellowCards: { type: Number, default: 0 },
      redCards: { type: Number, default: 0 },
      avgRating: { type: Number, default: 6.8 },
      averageRating: { type: Number, default: 6.8 },
      lastRating: { type: Number, default: 6.8 },
    },
  },
  { timestamps: true }
);

playerSchema.pre("validate", function normalizePlayerDynamics(next) {
  this.form = clampPercent(this.form);
  this.morale = clampPercent(this.morale);
  next();
});

module.exports = mongoose.model("Player", playerSchema);
