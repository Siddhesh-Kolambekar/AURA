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
    const budget = { ...existing?.preferences?.budgetRange };
    for (const path of budgetFields) {
      const key = path.slice("preferences.budgetRange.".length);
      if (updates[path] === null) delete budget[key];
      else budget[key] = updates[path];
    }

    if (typeof budget.min === "number" && typeof budget.max === "number" && budget.min > budget.max) {
      const error = new Error("Budget minimum must not exceed budget maximum.");
      error.status = 400;
      error.code = "VALIDATION_ERROR";
      throw error;
    }
  }

  const options = { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true };
  const setFields = Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== null));
  const unsetFields = Object.fromEntries(Object.entries(updates).filter(([, value]) => value === null).map(([path]) => [path, 1]));
  const update = { $setOnInsert: { userId } };
  if (Object.keys(setFields).length > 0) update.$set = setFields;
  if (Object.keys(unsetFields).length > 0) update.$unset = unsetFields;
  try {
    return await Profile.findOneAndUpdate(
      { userId },
      update,
      options
    );
  } catch (error) {
    if (error.code !== 11000) {
      throw error;
    }

    const retryUpdate = {};
    if (Object.keys(setFields).length > 0) retryUpdate.$set = setFields;
    if (Object.keys(unsetFields).length > 0) retryUpdate.$unset = unsetFields;
    const profile = await Profile.findOneAndUpdate({ userId }, retryUpdate, { ...options, upsert: false });
    if (!profile) {
      throw error;
    }
    return profile;
  }
}

module.exports = { createProfile, getProfile, updateProfile };
