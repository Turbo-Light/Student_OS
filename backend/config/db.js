import mongoose from 'mongoose';

/**
 * Connects to persistent MongoDB database.
 * Uses MONGO_URI from environment variables.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_student_os';
  
  try {
    console.log(`Attempting connection to persistent MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected successfully to instance: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    // Do not exit process so container stays healthy and HTTP health routes remain available
  }
};

export default connectDB;
