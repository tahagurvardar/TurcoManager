// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Yetkisiz: token yok." });
    }

    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const payload = jwt.verify(token, secret);

    // payload örn: { sub, role, teamName }
    req.user = payload;
    next();
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
    next();
  };
}

// Manager ise teamName zorunlu olsun
function requireManagerTeam(req, res, next) {
  if (req.user?.role === "manager" && !req.user?.teamName) {
    return res.status(400).json({ message: "Bu kullanıcıya takım atanmadı (teamName yok)." });
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireManagerTeam,
};
