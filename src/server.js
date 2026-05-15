// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const { corsOptions, getAllowedOrigins } = require("./config/cors");

const academyRoutes = require("./routes/academyRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const financeRoutes = require("./routes/financeRoutes");
const fixtureRoutes = require("./routes/fixtureRoutes");
const matchRoutes = require("./routes/matchRoutes");
const playerRoutes = require("./routes/playerRoutes");
const searchRoutes = require("./routes/searchRoutes");
const standingsRoutes = require("./routes/standingsRoutes");
const tacticsRoutes = require("./routes/tacticsRoutes");
const teamRoutes = require("./routes/teamRoutes");
const transferRoutes = require("./routes/transferRoutes");
const { HttpError } = require("./utils/httpError");

const app = express();

app.use(cors(corsOptions()));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    name: "Turco Manager Backend",
    systems: [
      "auth",
      "teams",
      "players",
      "fixtures",
      "matches",
      "standings",
      "dashboard",
      "transfers",
    ],
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "turco-manager-api",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    mongo: {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
    },
    corsOrigins: getAllowedOrigins(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/standings", standingsRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/finances", financeRoutes);
app.use("/api/tactics", tacticsRoutes);
app.use("/api/academy", academyRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route bulunamadı." });
});

app.use((err, req, res, next) => {
  const status = err instanceof HttpError ? err.status : err.status || 500;

  if (status >= 500) {
    console.error("Unhandled server error:", err);
  }

  res.status(status).json({
    message: err.message || "Server error",
  });
});

async function start() {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server çalışıyor: ${PORT}`);
  });
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Server başlatılamadı:", err.message);
    process.exit(1);
  });
}

module.exports = app;