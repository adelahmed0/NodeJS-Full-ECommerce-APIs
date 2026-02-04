import mongoose from "mongoose";

const connectDB = () => {
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
};

export default connectDB;
