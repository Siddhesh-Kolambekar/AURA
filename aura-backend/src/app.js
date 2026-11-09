const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const errorHandler = require("./middleware/error-handler");
const notFoundHandler = require("./middleware/not-found");
const authRoutes = require("./routes/auth.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();
const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:8081,http://localhost:19006,http://localhost:19000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.includes(origin));
    }
  })
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/api/v1",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        error: { code: "RATE_LIMIT_EXCEEDED" }
      });
    }
  })
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/health", healthRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
