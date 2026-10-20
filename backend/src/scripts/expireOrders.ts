import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { expireStaleOrders } from '../services/orderExpiryService';

async function runCli() {
  await connectDatabase();

  console.log('Initiating unpaid order expiration sweep...');
  const result = await expireStaleOrders();

  console.log(`Sweep completed:`);
  console.log(`- Evaluated Candidate Orders: ${result.sweptCount}`);
  console.log(`- Cancelled & Restocked Orders: ${result.expiredCount}`);
  console.log(`- Failed Restorations: ${result.failedOrderCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

if (require.main === module) {
  runCli().catch(async (err) => {
    console.error('Fatal CLI order expiry error:', err);
    await mongoose.disconnect();
    process.exit(1);
  });
}
