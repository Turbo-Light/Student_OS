import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

let mongod = null;

/**
 * Connects to MongoDB database.
 * If the configured MONGO_URI is unreachable (e.g. MongoDB service is not running locally),
 * it automatically falls back to spinning up an embedded, persistent MongoDB instance
 * inside the backend directory.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_student_os';
  
  try {
    console.log(`Attempting connection to MongoDB at: ${mongoUri}`);
    // Use a short server selection timeout so we fail fast and fall back to embedded Mongo if not running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB connected successfully to external instance: ${mongoose.connection.host}`);
  } catch (err) {
    console.log('\n============================================================');
    console.warn(`WARNING: Could not connect to external MongoDB service.`);
    console.log(`Reason: ${err.message}`);
    console.log(`Action: Initializing embedded persistent MongoDB database via mongodb-memory-server.`);
    console.log(`Note: If this is the first run, the MongoDB binary will be downloaded automatically.`);
    console.log('============================================================\n');
    
    try {
      // Ensure backend/data directory exists for embedded database persistence
      const dbPath = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      
      // Start MongoMemoryServer with a persistent data path and WiredTiger storage engine
      mongod = await MongoMemoryServer.create({
        instance: {
          dbPath: dbPath,
          storageEngine: 'wiredTiger',
          port: 27018, // Use a specific port to avoid conflicts
        },
      });
      
      const uri = mongod.getUri();
      console.log(`Embedded MongoDB server started successfully on: ${uri}`);
      
      await mongoose.connect(uri);
      console.log(`MongoDB connected successfully to embedded instance: ${mongoose.connection.host}`);
    } catch (fallbackErr) {
      console.error(`CRITICAL ERROR: Failed to launch embedded MongoDB database: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
};

// Ensure embedded database is shut down cleanly on process termination
process.on('SIGINT', async () => {
  if (mongod) {
    console.log('\nShutting down embedded MongoDB server...');
    await mongod.stop();
  }
  process.exit(0);
});

export default connectDB;
