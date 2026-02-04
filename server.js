import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import mongoose from "mongoose";

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then((connection) => {
    console.log(`MongoDB connected ${connection.connection.host}`);
  })
  .catch((error) => {
    console.log(`Database connection error: ${error}`);
    process.exit(1);
  });

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
