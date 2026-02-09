import mongoose from "mongoose";
import chalk from "chalk";

/**
 * Connect to MongoDB database
 */
const connectDB = (): void => {
  const MONGO_URI = process.env.MONGO_URI as string;

  if (!MONGO_URI) {
    console.error(
      chalk.red.bold("✘ MONGO_URI is not defined in environment variables"),
    );
    process.exit(1);
  }

  mongoose.connect(MONGO_URI).then((connection) => {
    console.log(
      chalk.cyan.bold(`✔ MongoDB connected: ${connection.connection.host}`),
    );
  });
};

export default connectDB;
