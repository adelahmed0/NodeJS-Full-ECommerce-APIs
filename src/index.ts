import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 8000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// Handle unhandledRejection
process.on("unhandledRejection", (err: Error) => {
  console.log(`Unhandled Rejection: ${err.name} - ${err.message}`);
  server.close(() => {
    console.log("Server closed");
    process.exit(1);
  });
});
