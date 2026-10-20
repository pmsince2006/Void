import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Defaults to the local development URI: mongodb://127.0.0.1:27017/void_db
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/void_db';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Fast 5-second timeout if MongoDB is unreachable
    });

    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error: any) {
    // Log a clear error message without exposing connection credentials or secrets
    console.error('Fatal: Failed to connect to MongoDB.');
    console.error(`Reason: ${error?.message || 'Connection refused or timed out'}`);
    process.exit(1);
  }
}

/**
 * Returns true if Mongoose has an active, open connection to MongoDB.
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
