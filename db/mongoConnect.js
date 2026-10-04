const mongoose = require("mongoose");
const { config } = require("../config/secret");

async function main() {
  if (!config.mongoUrl) {
    console.error("MONGO_URL is missing in the .env file");
    process.exit(1);
  }

  await mongoose.connect(config.mongoUrl);
  console.log("Connected to MongoDB — database: TOYS");
}

main().catch((err) => {
  console.error("MongoDB connection error:", err.message);
  process.exit(1);
});
