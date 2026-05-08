// src/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// TEST: tarayıcıdan açıp kontrol
router.get("/ping", (req, res) => {
  res.json({ ok: true, message: "authRoutes çalışıyor" });
});

// Demo login (hard-coded)
// Sonra DB'li Teknik Direktör sistemine geçeceğiz
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  const users = [
    { id: "admin-1", username: "admin", password: "123456", role: "admin" },
    { id: "td-gs", username: "gs", password: "123456", role: "manager", teamName: "Galatasaray" },
    { id: "td-fb", username: "fb", password: "123456", role: "manager", teamName: "Fenerbahçe" },
    { id: "td-bjk", username: "bjk", password: "123456", role: "manager", teamName: "Beşiktaş" },
  ];

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Kullanıcı adı/şifre hatalı." });

  const token = jwt.sign(
    { sub: user.id, role: user.role, teamName: user.teamName || null },
    process.env.JWT_SECRET || "dev_secret_change_me",
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login başarılı",
    token,
    user: { id: user.id, username: user.username, role: user.role, teamName: user.teamName || null },
  });
});

module.exports = router;
