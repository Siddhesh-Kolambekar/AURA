function getJwtConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes.");
  }

  return {
    secret,
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    issuer: "aura-api"
  };
}

function getPasswordResetConfig() {
  const resetUrl = process.env.PASSWORD_RESET_URL;
  const expirationMinutes = Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15);

  if (!Number.isInteger(expirationMinutes) || expirationMinutes < 1 || expirationMinutes > 60) {
    throw new Error("PASSWORD_RESET_EXPIRES_MINUTES must be an integer between 1 and 60.");
  }

  if (resetUrl) {
    const url = new URL(resetUrl);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("PASSWORD_RESET_URL must use HTTP or HTTPS.");
    }
  }

  return { resetUrl, expirationMinutes };
}

module.exports = { getJwtConfig, getPasswordResetConfig };
