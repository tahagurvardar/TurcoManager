function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }
  return value;
}

function getJwtSecret() {
  return requireEnv("JWT_SECRET");
}

function getJwtExpiresIn() {
  return process.env.JWT_EXPIRES_IN || "7d";
}

module.exports = {
  getJwtExpiresIn,
  getJwtSecret,
  requireEnv,
};
