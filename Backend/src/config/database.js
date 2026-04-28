//Import mongoose to connect to the database
import mongoose from "mongoose";
import { config } from "./config.js";

// ============================================
// Database Connection
// ============================================
const connectToDB = async () =>{
  try {
    const conn = await mongoose.connect(config.MONGO_URI)
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  }catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
}

// ============================================
export default connectToDB;
