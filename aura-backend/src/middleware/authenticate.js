const jwt = require("jsonwebtoken");

const { getJwtConfig } = require("../config/jwt");

function authenticationError(response, message, code) {
  return response.status(401).json({
    success: false,
    message,
    error: { code }
  });
}

function authenticate(request, response, next) {
  const authorization = request.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return authenticationError(response, "Authentication required", "AUTHENTICATION_REQUIRED");
  }

  try {
    const { secret, issuer } = getJwtConfig();
    const payload = jwt.verify(match[1], secret, {
      algorithms: ["HS256"],
      issuer
    });

    if (typeof payload !== "object" || typeof payload.sub !== "string" || !payload.sub) {
      return authenticationError(response, "Invalid authentication token", "INVALID_TOKEN");
    }

    request.user = { id: payload.sub };
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return authenticationError(response, "Invalid or expired authentication token", "INVALID_TOKEN");
    }

    return next(error);
  }
}

module.exports = authenticate;
