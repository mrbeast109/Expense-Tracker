import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

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
