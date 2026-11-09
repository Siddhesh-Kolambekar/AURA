const mongoose = require("mongoose");

async function connectToDatabase(uri) {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");
}

module.exports = { connectToDatabase };
