const User = require("../models/user.model");
const RevokedToken = require("../models/revoked-token.model");
const { randomBytes, randomUUID, createHash } = require("node:crypto");
const jwt = require("jsonwebtoken");
const { getJwtConfig, getPasswordResetConfig } = require("../config/jwt");
const { sendPasswordResetEmail } = require("./email.service");

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function createAuthenticationError() {
  const error = new Error("Invalid email or password.");
  error.status = 401;
  error.code = "INVALID_CREDENTIALS";
  return error;
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.exists({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("An account with this email already exists.");
    error.status = 409;
    error.code = "EMAIL_ALREADY_EXISTS";
    throw error;
  }

  try {
    const user = await User.create({
      name,
      email: normalizedEmail,
      password
    });

    return user.toJSON();
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      const duplicateError = new Error("An account with this email already exists.");
      duplicateError.status = 409;
      duplicateError.code = "EMAIL_ALREADY_EXISTS";
      throw duplicateError;
    }

    throw error;
  }
}

async function loginUser({ email, password }) {
  const { secret, expiresIn, issuer } = getJwtConfig();
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

  if (!user || user.authProvider !== "email" || !user.password) {
    throw createAuthenticationError();
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw createAuthenticationError();
  }

  const token = jwt.sign({}, secret, {
    algorithm: "HS256",
    jwtid: randomUUID(),
    subject: user.id,
    issuer,
    expiresIn
  });

  return { token, user: user.toJSON() };
}

async function getAuthenticatedUser(userId) {
  return User.findById(userId);
}

async function requestPasswordReset(email) {
  const { resetUrl, expirationMinutes } = getPasswordResetConfig();
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user || user.authProvider !== "email") {
    return;
  }

  const resetToken = randomBytes(32).toString("hex");
  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  await user.save();

  if (!resetUrl) {
    console.error("Password-reset email is not configured: PASSWORD_RESET_URL is missing.");
    return;
  }

  const link = new URL(resetUrl);
  link.searchParams.set("token", resetToken);

  setImmediate(() => {
    sendPasswordResetEmail(user.email, user.name, link.toString()).catch((error) => {
      console.error("Password-reset email delivery failed:", error.message);
    });
  });
}

async function resetPassword(token, password) {
  const result = await User.updateOne(
    {
      passwordResetTokenHash: hashToken(token),
      passwordResetExpiresAt: { $gt: new Date() }
    },
    {
      $set: { password },
      $unset: {
        passwordResetTokenHash: 1,
        passwordResetExpiresAt: 1
      }
    }
  );

  if (result.matchedCount !== 1) {
    const error = new Error("Password reset token is invalid or expired.");
    error.status = 400;
    error.code = "INVALID_RESET_TOKEN";
    throw error;
  }
}

async function revokeAccessToken(tokenHash, expiration) {
  await RevokedToken.updateOne(
    { tokenHash },
    { $setOnInsert: { expiresAt: new Date(expiration * 1000) } },
    { upsert: true }
  );
}

module.exports = {
  getAuthenticatedUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  revokeAccessToken
};
