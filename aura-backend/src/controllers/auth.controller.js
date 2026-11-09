const {
  getAuthenticatedUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  revokeAccessToken
} = require("../services/auth.service");

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

async function forgotPassword(request, response, next) {
  try {
    await requestPasswordReset(request.body.email);

    return response.status(202).json({
      success: true,
      message: "If the account exists, password reset instructions can be sent to the registered address."
    });
  } catch (error) {
    return next(error);
  }
}

async function resetPasswordController(request, response, next) {
  try {
    await resetPassword(request.body.token, request.body.password);

    return response.json({
      success: true,
      message: "Password has been reset successfully."
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(request, response, next) {
  try {
    await revokeAccessToken(request.auth.tokenHash, request.auth.expiresAt);

    return response.json({
      success: true,
      message: "Logged out successfully. This access token has been revoked."
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { forgotPassword, getMe, login, logout, register, resetPassword: resetPasswordController };
