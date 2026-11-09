const { validationResult } = require("express-validator");

function validateRequest(request, response, next) {
  const result = validationResult(request);

  if (result.isEmpty()) {
    return next();
  }

  return response.status(400).json({
    success: false,
    message: "Request validation failed",
    error: {
      code: "VALIDATION_ERROR",
      details: result.array().map(({ type, location, path, msg }) => ({
        type,
        location,
        path,
        message: msg
      }))
    }
  });
}

module.exports = validateRequest;
