const { getAuthenticatedUser, loginUser, registerUser } = require("../services/auth.service");

async function register(request, response, next) {
  try {
    const user = await registerUser(request.body);

    return response.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user }
    });
  } catch (error) {
    return next(error);
  }
}

async function login(request, response, next) {
  try {
    const result = await loginUser(request.body);

    return response.json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(request, response, next) {
  try {
    const user = await getAuthenticatedUser(request.user.id);

    if (!user) {
      return response.status(401).json({
        success: false,
        message: "Authentication required",
        error: { code: "AUTHENTICATION_REQUIRED" }
      });
    }

    return response.json({
      success: true,
      message: "Authenticated user retrieved successfully",
      data: { user: user.toJSON() }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getMe, login, register };
