const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "manager"], default: "manager" },
    league: { type: String, default: "Süper Lig" },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required() {
        return this.role === "manager";
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
