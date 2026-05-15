// src/middleware/auth.js
const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/env");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Yetkisiz: token yok." });
    }

    let secret;
    try {
      secret = getJwtSecret();
    } catch {
      return res.status(500).json({ message: "Sunucu JWT yapılandırması eksik." });
    }

    req.user = jwt.verify(token, secret);
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Yetkisiz: token geçersiz.", error: err.message });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(401).json({ message: "Yetkisiz: kullanıcı yok." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Yasak: rol yetmiyor." });
    }
    return next();
  };
}

function requireManagerTeam(req, res, next) {
  if (req.user?.role === "manager" && !req.user?.teamName && !req.user?.teamId) {
    return res.status(400).json({ message: "Bu kullanıcıya takım atanmadı." });
  }
  return next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireManagerTeam,
};
