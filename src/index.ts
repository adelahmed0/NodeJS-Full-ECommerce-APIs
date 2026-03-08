// Load environment variables from .env file
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import chalk from "chalk";

// Set port from environment variables or default to 8000
const PORT = Number(process.env.PORT) || 8000;

// Establish database connection
connectDB();

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(chalk.blue.bold(`🚀 Server is running on port ${PORT}`));
});

// Global handler for unhandled promise rejections (e.g., database connection issues)
process.on("unhandledRejection", (err: Error) => {
  console.log(
    chalk.red.bold(`✘ Unhandled Rejection: ${err.name} - ${err.message}`),
  );
  // Gracefully shutdown the server before exiting the process
  server.close(() => {
    console.log(chalk.yellow("Server closed due to unhandled rejection"));
    process.exit(1);
  });
});
