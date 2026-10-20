import mongoose from 'mongoose';

/**
 * Resolves the MongoDB connection URI based on environment.
 * In production, MONGODB_URI is strictly required to prevent accidental connection to localhost.
 */
export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: MONGODB_URI environment variable is missing in production.');
    }
    return 'mongodb://127.0.0.1:27017/void_db';
  }
  return uri.trim();
}

/**
 * Connect to MongoDB using the MONGODB_URI environment variable.
 * Defaults to local development URI: mongodb://127.0.0.1:27017/void_db in non-production.
 */
export async function connectDatabase(customUri?: string): Promise<typeof mongoose> {
  let uri: string;
  try {
    uri = customUri || getMongoUri();
  } catch (configError: any) {
    console.error('Fatal database configuration error:');
    console.error(configError?.message || 'Invalid MongoDB configuration');
    process.exit(1);
  }

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

/**
 * Detects whether the active MongoDB connection topology supports multi-document transactions.
 * Transactions require a replica set (e.g. Atlas in production or local rs0) or a sharded cluster.
 */
export function isTransactionSupported(): boolean {
  if (mongoose.connection.readyState !== 1) {
    return false;
  }
  const client = (mongoose.connection as any).client;
  const topology = client?.topology;
  const descriptionType = topology?.description?.type;
  if (descriptionType && descriptionType !== 'Single' && descriptionType !== 'Unknown') {
    return true;
  }
  const servers = topology?.description?.servers;
  if (servers) {
    for (const server of servers.values()) {
      if (server.setName) return true;
    }
  }
  return false;
}

/**
 * Explicitly initializes and verifies required critical database indexes before background workers start.
 * Fails clearly if a required unique index cannot be verified or built.
 */
export async function initializeDatabaseIndexes(): Promise<void> {
  const { InventoryRestoration } = await import('../models/InventoryRestoration');
  const { Order } = await import('../models/Order');
  const { Product } = await import('../models/Product');

  try {
    await Promise.all([
      InventoryRestoration.init(),
      Order.init(),
      Product.init()
    ]);
  } catch (indexError: any) {
    console.error('Fatal: Failed to verify or initialize required database indexes.');
    console.error(`Index build failure: ${indexError?.message || indexError}`);
    throw indexError;
  }
}
