const User = require("../models/user.model");

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

module.exports = { registerUser };
