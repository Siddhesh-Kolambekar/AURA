const Profile = require("../models/profile.model");

function flattenFields(value, prefix = "", result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child !== null && typeof child === "object" && !Array.isArray(child)) {
      flattenFields(child, path, result);
    } else {
      result[path] = child;
    }
  }
  return result;
}

function createProfile(userId, fields) {
  return Profile.create({ userId, ...fields });
}

function getProfile(userId) {
  return Profile.findOne({ userId });
}

async function updateProfile(userId, fields) {
  const updates = flattenFields(fields);
  const budgetFields = Object.keys(updates).filter((path) => path.startsWith("preferences.budgetRange."));

  if (budgetFields.length > 0) {
    const existing = await Profile.findOne({ userId }).select("preferences.budgetRange").lean();
    const budget = {
      ...existing?.preferences?.budgetRange,
      ...Object.fromEntries(
        budgetFields.map((path) => [path.slice("preferences.budgetRange.".length), updates[path]])
      )
    };

    if (typeof budget.min === "number" && typeof budget.max === "number" && budget.min > budget.max) {
      const error = new Error("Budget minimum must not exceed budget maximum.");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
  }

  const options = { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true };
  try {
    return await Profile.findOneAndUpdate(
      { userId },
      { $set: updates, $setOnInsert: { userId } },
      options
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const profile = await Profile.findOneAndUpdate({ userId }, { $set: updates }, { ...options, upsert: false });
    if (!profile) {
      throw error;
    }
    return profile;
  }
}

module.exports = { createProfile, getProfile, updateProfile };
