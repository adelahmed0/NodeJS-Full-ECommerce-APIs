import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

import chalk from "chalk";

const PORT = Number(process.env.PORT) || 8000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(chalk.blue.bold(`🚀 Server is running on port ${PORT}`));
});

// Handle unhandledRejection
process.on("unhandledRejection", (err: Error) => {
  console.log(
    chalk.red.bold(`✘ Unhandled Rejection: ${err.name} - ${err.message}`),
  );
  server.close(() => {
    console.log(chalk.yellow("Server closed"));
    process.exit(1);
  });
});
