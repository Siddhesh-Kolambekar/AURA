const mongoose = require("mongoose");

mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected.");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required to start the AURA API.");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");
}

module.exports = { connectToDatabase };
