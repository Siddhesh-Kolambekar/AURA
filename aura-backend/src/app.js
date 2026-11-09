const cors = require("cors");
const express = require("express");

const healthRoutes = require("./routes/health.routes");

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/health", healthRoutes);

module.exports = app;
