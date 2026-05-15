// src/routes/authRoutes.js
const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const Team = require("../models/Team");
const User = require("../models/User");
const { getJwtExpiresIn, getJwtSecret } = require("../config/env");

const router = express.Router();

const DEMO_USERS = [
  { id: "admin-1", username: "admin", password: "123456", role: "admin", league: "Süper Lig" },
  { id: "td-gs", username: "gs", password: "123456", role: "manager", teamName: "Galatasaray", league: "Süper Lig" },
  { id: "td-fb", username: "fb", password: "123456", role: "manager", teamName: "Fenerbahçe", league: "Süper Lig" },
  { id: "td-bjk", username: "bjk", password: "123456", role: "manager", teamName: "Beşiktaş", league: "Süper Lig" },
];

function signUser(user) {
  const id = user.id ? String(user.id) : null;
  const teamId = user.teamId ? String(user.teamId) : null;

  const token = jwt.sign(
    {
      sub: id,
      username: user.username,
      role: user.role,
      league: user.league || "Süper Lig",
      teamId,
      teamName: user.teamName || null,
    },
    getJwtSecret(),
    { expiresIn: getJwtExpiresIn() }
  );

  return {
    message: "Login başarılı",
    token,
    user: {
      id,
      username: user.username,
      role: user.role,
      league: user.league || "Süper Lig",
      teamId,
      teamName: user.teamName || null,
    },
  };
}

router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "authRoutes çalışıyor" });
});

router.post("/login", async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!username || !password) {
      return res.status(400).json({ message: "Kullanıcı adı ve şifre zorunlu." });
    }

    const dbUser = await User.findOne({ username }).populate("team", "name league");
    if (dbUser) {
      const ok = await bcrypt.compare(password, dbUser.passwordHash);
      if (!ok) return res.status(401).json({ message: "Kullanıcı adı/şifre hatalı." });

      return res.json(
        signUser({
          id: dbUser._id,
          username: dbUser.username,
          role: dbUser.role,
          league: dbUser.league,
          teamId: dbUser.team?._id,
          teamName: dbUser.team?.name,
        })
      );
    }

    const demoUser = DEMO_USERS.find((user) => user.username === username && user.password === password);
    if (!demoUser) return res.status(401).json({ message: "Kullanıcı adı/şifre hatalı." });

    const team = demoUser.teamName ? await Team.findOne({ name: demoUser.teamName, league: demoUser.league }) : null;
    return res.json(
      signUser({
        ...demoUser,
        teamId: team?._id || null,
      })
    );
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
