import mongoose from "mongoose";

let isConnected = false;

/**
 * Connects to MongoDB database with proper error handling
 * @throws {Error} If MONGODB_URI is not defined or connection fails
 */
export const connectToDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (error) {
    isConnected = false;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("MongoDB connection error:", errorMessage);
    throw new Error(`Failed to connect to MongoDB: ${errorMessage}`);
  }
};