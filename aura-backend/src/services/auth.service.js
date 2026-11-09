const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { getJwtConfig } = require("../config/jwt");

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
    subject: user.id,
    issuer,
    expiresIn
  });

  return { token, user: user.toJSON() };
}

async function getAuthenticatedUser(userId) {
  return User.findById(userId);
}

module.exports = { getAuthenticatedUser, loginUser, registerUser };
