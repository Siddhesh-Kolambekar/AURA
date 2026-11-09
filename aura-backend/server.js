require("dotenv").config();

const app = require("./src/app");
const { connectToDatabase } = require("./src/config/database");

async function startServer() {
  const port = Number(process.env.PORT || 5000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  if (process.env.MONGODB_URI) {
    await connectToDatabase(process.env.MONGODB_URI);
  } else {
    console.warn("MONGODB_URI is not set; starting without a database connection.");
  }

  app.listen(port, () => {
    console.log(`AURA API listening on port ${port}.`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the AURA API:", error);
  process.exitCode = 1;
});
