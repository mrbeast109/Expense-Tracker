import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URL || process.env.MONGO_URI;
  if (!uri) {
    console.error("Database connection error: MONGO_URI or MONGODB_URL is not defined in .env");
    return;
  }
  try {
    await mongoose.connect(uri);
    console.log("Database connected");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
};
