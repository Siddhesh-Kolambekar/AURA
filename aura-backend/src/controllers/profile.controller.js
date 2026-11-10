const { createProfile, getProfile, updateProfile } = require("../services/profile.service");

async function create(request, response, next) {
  try {
    const profile = await createProfile(request.user.id, request.body);
    return response.status(201).json({
      success: true,
      message: "Profile created successfully",
      data: { profile }
    });
  } catch (error) {
    if (error.code === 11000) {
      return response.status(409).json({
        success: false,
        message: "A profile already exists for this user.",
        error: { code: "PROFILE_ALREADY_EXISTS" }
      });
    }
    return next(error);
  }
}

async function read(request, response, next) {
  try {
    const profile = await getProfile(request.user.id);
    if (!profile) {
      return response.status(404).json({
        success: false,
        message: "Profile not found.",
        error: { code: "PROFILE_NOT_FOUND" }
      });
    }
    return response.json({
      success: true,
      message: "Profile retrieved successfully",
      data: { profile }
    });
  } catch (error) {
    return next(error);
  }
}

async function update(request, response, next) {
  try {
    const profile = await updateProfile(request.user.id, request.body);
    return response.json({
      success: true,
      message: "Profile updated successfully",
      data: { profile }
    });
  } catch (error) {
    return next(error);
  }
}

function updateSection(section) {
  return async (request, response, next) => {
    try {
      const profile = await updateProfile(request.user.id, { [section]: request.body });
      return response.json({
        success: true,
        message: "Profile updated successfully",
        data: { profile }
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { create, read, update, updateSection };
