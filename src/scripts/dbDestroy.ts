import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/category.model.js";
import SubCategory from "../models/subCategory.model.js";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Review from "../models/review.model.js";
import Coupon from "../models/coupon.model.js";
import chalk from "chalk";

/**
 * Destroy Database Data
 */
const destroyData = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      console.error(
        chalk.red.bold("✘ MONGO_URI is not defined in environment variables"),
      );
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log(chalk.cyan.bold("🔌 Connected to MongoDB successfully."));

    console.log(chalk.yellow("⏳ Deleting all data from database..."));

    // Delete all collections
    await Review.deleteMany();
    await SubCategory.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Coupon.deleteMany();

    console.log(chalk.green("✅ All data deleted successfully."));
    console.log(chalk.magenta.bold("\n★ DATABASE IS NOW EMPTY ★\n"));

    process.exit(0);
  } catch (error) {
    console.error(
      chalk.red.bold("❌ FATAL: Error destroying database:"),
      error,
    );
    process.exit(1);
  }
};

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

destroyData();
