// src/models/Team.js
const mongoose = require("mongoose");

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value ?? 50) || 0));

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    shortName: { type: String, trim: true },
    league: { type: String, trim: true, index: true },
    country: {
      type: String,
      default: "Türkiye",
    },
    reputation: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    stadium: {
      name: { type: String, default: "Turco Arena" },
      capacity: { type: Number, default: 25000 },
      attendanceRate: { type: Number, default: 0.72 },
    },
    budget: {
      type: Number,
      default: 0,
    },
    morale: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      set: clampPercent,
    },
    form: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      set: clampPercent,
    },
    chemistry: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      set: clampPercent,
    },
    fatigue: {
      type: Number,
      default: 0,
      min: 0,
      max: 150,
    },
    tactics: {
      formation: { type: String, default: "4-2-3-1" },
      mentality: {
        type: String,
        enum: ["defensive", "balanced", "attacking"],
        default: "balanced",
      },
      pressing: { type: Number, default: 65, min: 0, max: 100 },
      tempo: { type: Number, default: 60, min: 0, max: 100 },
      defensiveLine: { type: Number, default: 55, min: 0, max: 100 },
      width: { type: Number, default: 58, min: 0, max: 100 },
      creativity: { type: Number, default: 62, min: 0, max: 100 },
      playerPositions: [
        {
          slot: { type: String, trim: true },
          position: { type: String, enum: ["KL", "DEF", "OS", "FVT"], default: "OS" },
          x: { type: Number, min: 0, max: 100 },
          y: { type: Number, min: 0, max: 100 },
        },
      ],
      focusPlay: {
        type: String,
        enum: ["center", "left", "right", "mixed"],
        default: "mixed",
      },
    },
    finance: {
      balance: { type: Number, default: 25000000 },
      transferBudget: { type: Number, default: 12000000 },
      wageBudget: { type: Number, default: 450000 },
      weeklyWage: { type: Number, default: 0 },
      sponsorIncome: { type: Number, default: 0 },
      ticketIncome: { type: Number, default: 0 },
      facilityCost: { type: Number, default: 65000 },
      youthInvestment: { type: Number, default: 75000 },
    },
    sponsorships: [
      {
        name: String,
        tier: {
          type: String,
          enum: ["local", "regional", "global"],
          default: "local",
        },
        value: { type: Number, default: 0 },
        durationWeeks: { type: Number, default: 12 },
        signedAt: { type: Date, default: Date.now },
      },
    ],
    facilities: {
      training: { type: Number, default: 65, min: 0, max: 100 },
      youth: { type: Number, default: 58, min: 0, max: 100 },
      medical: { type: Number, default: 62, min: 0, max: 100 },
    },
    seasonObjectives: {
      boardTarget: { type: String, default: "Üst sıralar" },
      managerTarget: { type: String, default: "Avrupa kupaları" },
    },
  },
  { timestamps: true }
);

teamSchema.pre("validate", function normalizeTeamDynamics(next) {
  this.morale = clampPercent(this.morale);
  this.form = clampPercent(this.form);
  this.chemistry = clampPercent(this.chemistry);
  next();
});

module.exports = mongoose.model("Team", teamSchema);
