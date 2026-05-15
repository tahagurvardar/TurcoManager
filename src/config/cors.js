const DEV_ORIGINS = ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"];

function parseOrigins(value = "") {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigins() {
  const configured = parseOrigins(process.env.CLIENT_URL);
  if (process.env.NODE_ENV === "production") {
    return configured;
  }
  return [...new Set([...configured, ...DEV_ORIGINS])];
}

function corsOptions() {
  const allowedOrigins = getAllowedOrigins();

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
  };
}

module.exports = {
  corsOptions,
  getAllowedOrigins,
};
