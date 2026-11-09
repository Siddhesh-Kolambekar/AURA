const jwt = require("jsonwebtoken");
const { createHash } = require("node:crypto");

const { getJwtConfig } = require("../config/jwt");
const RevokedToken = require("../models/revoked-token.model");

function authenticationError(response, message, code) {
  return response.status(401).json({
    success: false,
    message,
    error: { code }
  });
}

async function authenticate(request, response, next) {
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

    if (
      typeof payload !== "object" ||
      typeof payload.sub !== "string" ||
      !payload.sub ||
      typeof payload.exp !== "number"
    ) {
      return authenticationError(response, "Invalid authentication token", "INVALID_TOKEN");
    }

    const tokenHash = createHash("sha256").update(match[1]).digest("hex");
    const revokedToken = await RevokedToken.exists({ tokenHash });

    if (revokedToken) {
      return authenticationError(response, "Invalid or expired authentication token", "INVALID_TOKEN");
    }

    request.user = { id: payload.sub };
    request.auth = { tokenHash, expiresAt: payload.exp };
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return authenticationError(response, "Invalid or expired authentication token", "INVALID_TOKEN");
    }

    return next(error);
  }
}

module.exports = authenticate;
