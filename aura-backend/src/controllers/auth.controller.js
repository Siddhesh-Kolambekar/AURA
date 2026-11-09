const { registerUser } = require("../services/auth.service");

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

module.exports = { register };
