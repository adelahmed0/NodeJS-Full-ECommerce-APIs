import mongoose from "mongoose";
import chalk from "chalk";

/**
 * Connect to MongoDB database
 * Uses the MONGO_URI from environment variables.
 * Exits the process if the URI is not defined.
 */
const connectDB = (): void => {
  // Retrieve the connection string from environment variables
  const MONGO_URI = process.env.MONGO_URI as string;

  // Validate that the URI exists
  if (!MONGO_URI) {
    console.error(
      chalk.red.bold("✘ MONGO_URI is not defined in environment variables"),
    );
    // Terminate the app if we can't connect to the DB
    process.exit(1);
  }

  // Attempt to connect to MongoDB
  mongoose.connect(MONGO_URI).then((connection) => {
    // Log successful connection with host information
    console.log(
      chalk.cyan.bold(`✔ MongoDB connected: ${connection.connection.host}`),
    );
  });
};

export default connectDB;
