// db/index.js - Updated connection with SSL fixes
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    // Option 1: Try without TLS first (for testing)
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`, {
      serverSelectionTimeoutMS: 30000, // Increased timeout
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      appName: "sccd",
      // Remove tls: true temporarily to test
    });

    console.log(`\nMongoDB connected!! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;

// Alternative connection with different SSL settings
