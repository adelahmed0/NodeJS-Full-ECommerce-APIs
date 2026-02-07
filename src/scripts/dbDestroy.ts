import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";

/**
 * Destroy Database Data
 */
const destroyData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error("MONGO_URI is not defined in environment variables");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("✓ Connected to MongoDB");

    console.log("⚠ Deleting all data from database...");

    // Delete all collections
    await SubCategory.deleteMany();
    await Category.deleteMany();

    console.log("✓ All data deleted successfully");
    console.log("★ Database is now empty ★");

    process.exit(0);
  } catch (error) {
    console.error("Error destroying database:", error);
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

destroyData();
