import { Types } from 'mongoose';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';

export interface ExpireSingleOrderResult {
  success: boolean;
  orderId: string;
  orderNumber?: string;
  restoredItemCount: number;
  alreadyRestored: boolean;
  error?: string;
}

export interface ExpireStaleOrdersResult {
  sweptCount: number;
  expiredCount: number;
  restoredOrderCount: number;
  failedOrderCount: number;
  details: ExpireSingleOrderResult[];
}

/**
 * Resolves the configured unpaid order expiration window in minutes.
 * Defaults to 60 minutes.
 * Validates that the configuration is a positive integer > 0.
 */
export function getOrderExpiryMinutes(): number {
  const envVal = process.env.ORDER_EXPIRY_MINUTES;
  if (!envVal || !envVal.trim()) {
    return 60; // Sensible 60-minute default window for abandoned checkout expiration
  }

  const parsed = Number(envVal.trim());
  if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid ORDER_EXPIRY_MINUTES configuration: '${envVal}'. Must be a positive integer greater than 0.`
    );
  }

  return parsed;
}

/**
 * Safely cancels a single eligible unpaid order and restores its allocated inventory.
 *
 * Guarantees:
 * 1. Atomic state transition prevents concurrent double-processing.
 * 2. Variant keys are tracked in `restoredItems` so interrupted sweeps or retries never double-restore.
 * 3. Paid, confirmed, shipped, or delivered orders are strictly rejected and protected.
 * 4. Missing products in the archive are handled gracefully without aborting overall recovery.
 */
export async function expireSingleOrder(
  orderId: Types.ObjectId | string,
  reason: string = 'UNPAID_EXPIRED',
  leaseMs: number = 30 * 1000
): Promise<ExpireSingleOrderResult> {
  const targetId = typeof orderId === 'string' ? new Types.ObjectId(orderId) : orderId;
  const now = new Date();
  const lockLease = new Date(now.getTime() + leaseMs);

  // 1. Atomic Claim with Distributed Lease Lock:
  // - Case 1: Fresh eligible pending order.
  // - Case 2: Interrupted order whose previous worker lease has expired (stale lease recovery).
  // Strictly rejects paid, terminal, or already-restored orders, and prevents concurrent double processing.
  const targetOrder: IOrder | null = await Order.findOneAndUpdate(
    {
      _id: targetId,
      inventoryRestored: { $ne: true },
      $or: [
        {
          paymentStatus: { $in: ['pending', 'unpaid'] },
          orderStatus: 'pending'
        },
        {
          orderStatus: 'cancelled',
          cancelledReason: reason,
          $or: [
            { restorationLockedUntil: { $exists: false } },
            { restorationLockedUntil: { $lte: now } }
          ]
        }
      ]
    },
    {
      $set: {
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
        cancelledReason: reason,
        cancelledAt: now,
        restorationLockedUntil: lockLease
      }
    },
    { returnDocument: 'after' }
  );

  // If order was already fully restored, paid, or currently being processed by another worker lease, safely exit
  if (!targetOrder) {
    return {
      success: false,
      orderId: targetId.toString(),
      restoredItemCount: 0,
      alreadyRestored: true
    };
  }

  // 2. Incremental Inventory Restoration per Variant
  let restoredCount = 0;
  const processedKeys = new Set(targetOrder.restoredItems || []);

  for (const item of targetOrder.items) {
    const itemKey = `${item.productId}::${item.size}::${item.color}`;
    if (processedKeys.has(itemKey)) {
      // Already restored in a previous attempt, skip to prevent double restoration
      continue;
    }

    try {
      const updateResult = await Product.updateOne(
        { id: item.productId },
        {
          $inc: { stockCount: item.quantity },
          $set: { inStock: true }
        }
      );

      if (updateResult.matchedCount === 0) {
        console.warn(
          `[OrderExpiry] Silhouette '${item.productId}' not found in Product archive during inventory restock.`
        );
      }

      // Record this line item as restored in MongoDB
      await Order.updateOne(
        { _id: targetOrder._id },
        { $addToSet: { restoredItems: itemKey } }
      );
      processedKeys.add(itemKey);
      restoredCount++;
    } catch (itemErr: any) {
      console.error(
        `[OrderExpiry] Failed to restore inventory for item '${itemKey}' in order ${targetOrder.orderNumber}:`,
        itemErr
      );
      // Re-throw to allow subsequent retry sweep to resume from this point
      throw itemErr;
    }
  }

  // 3. Mark the order document as completely restored
  const expiryNote = 'Auto-cancelled due to payment expiration window. Allocation restored to archive.';
  const updatedNotes = targetOrder.notes
    ? `${targetOrder.notes} // ${expiryNote}`
    : expiryNote;

  await Order.updateOne(
    { _id: targetOrder._id },
    {
      $set: {
        inventoryRestored: true,
        notes: updatedNotes
      }
    }
  );

  return {
    success: true,
    orderId: targetOrder._id.toString(),
    orderNumber: targetOrder.orderNumber,
    restoredItemCount: restoredCount,
    alreadyRestored: false
  };
}

/**
 * Sweeps the database for expired unpaid orders and cancels them while restocking inventory.
 */
export async function expireStaleOrders(options?: {
  expiryMinutes?: number;
  limit?: number;
}): Promise<ExpireStaleOrdersResult> {
  const expiryMinutes = options?.expiryMinutes ?? getOrderExpiryMinutes();
  const limit = options?.limit ?? 50;
  const thresholdDate = new Date(Date.now() - expiryMinutes * 60 * 1000);

  const now = new Date();
  // Match eligible pending orders older than threshold, OR previously interrupted orders whose lease has expired
  const candidates = await Order.find({
    inventoryRestored: { $ne: true },
    $or: [
      {
        paymentStatus: { $in: ['pending', 'unpaid'] },
        orderStatus: 'pending',
        createdAt: { $lte: thresholdDate }
      },
      {
        orderStatus: 'cancelled',
        cancelledReason: 'UNPAID_EXPIRED',
        $or: [
          { restorationLockedUntil: { $exists: false } },
          { restorationLockedUntil: { $lte: now } }
        ]
      }
    ]
  })
    .sort({ createdAt: 1 })
    .limit(limit);

  const details: ExpireSingleOrderResult[] = [];
  let expiredCount = 0;
  let failedCount = 0;

  for (const candidate of candidates) {
    try {
      const res = await expireSingleOrder(candidate._id, 'UNPAID_EXPIRED');
      if (res.success) {
        expiredCount++;
      }
      details.push(res);
    } catch (err: any) {
      failedCount++;
      console.error(`[OrderExpiry] Error processing order ${candidate.orderNumber}:`, err);
      details.push({
        success: false,
        orderId: candidate._id.toString(),
        orderNumber: candidate.orderNumber,
        restoredItemCount: 0,
        alreadyRestored: false,
        error: err?.message || 'Unknown error'
      });
    }
  }

  return {
    sweptCount: candidates.length,
    expiredCount,
    restoredOrderCount: expiredCount,
    failedOrderCount: failedCount,
    details
  };
}

// ----------------------------------------------------------------------------
// Background Worker Runtime
// ----------------------------------------------------------------------------
let workerTimer: NodeJS.Timeout | null = null;
let isWorkerSweepRunning = false;

/**
 * Starts the periodic background order expiration worker.
 * Uses unref() so the timer does not hold open the Node process or block shutdown.
 */
export function startOrderExpiryWorker(intervalMs: number = 60 * 1000): NodeJS.Timeout | null {
  if (workerTimer) {
    return workerTimer;
  }

  workerTimer = setInterval(async () => {
    if (isWorkerSweepRunning) {
      return; // Skip overlapping sweep if previous sweep is still in progress
    }

    isWorkerSweepRunning = true;
    try {
      const result = await expireStaleOrders();
      if (result.expiredCount > 0) {
        console.log(
          `[OrderExpiryWorker] Periodic sweep cancelled ${result.expiredCount} expired unpaid order(s) and restored inventory.`
        );
      }
    } catch (err: any) {
      console.error('[OrderExpiryWorker] Periodic sweep encountered error:', err?.message || err);
    } finally {
      isWorkerSweepRunning = false;
    }
  }, intervalMs);

  if (workerTimer.unref) {
    workerTimer.unref();
  }

  return workerTimer;
}

/**
 * Stops the periodic background worker cleanly.
 */
export function stopOrderExpiryWorker(): void {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
    isWorkerSweepRunning = false;
  }
}

/**
 * Returns true if the background worker interval is active.
 */
export function isOrderExpiryWorkerActive(): boolean {
  return workerTimer !== null;
}
