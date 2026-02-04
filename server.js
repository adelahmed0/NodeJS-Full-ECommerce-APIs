import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./config/DB.js";
import categoryRoutes from "./routes/category.route.js";

dotenv.config();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

connectDB();

app.use("/api/categories", categoryRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
