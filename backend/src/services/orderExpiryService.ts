import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';
import { Order, IOrder } from '../models/Order';
import { Product } from '../models/Product';
import { InventoryRestoration, IInventoryRestoration } from '../models/InventoryRestoration';
import { isTransactionSupported } from '../config/database';

export interface ExpireSingleOrderResult {
  success: boolean;
  orderId: string;
  orderNumber?: string;
  restoredItemCount: number;
  alreadyRestored: boolean;
  unresolvedCount?: number;
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
 * Guarantees & Correctness Design:
 * 1. Finite State Machine Gate: Only orders in 'pending' status with 'pending'/'unpaid' payment
 *    can be claimed. Orders that transitioned to 'confirmed' / 'paid' via payment verification
 *    are structurally excluded and protected from cancellation.
 * 2. Atomic Lease & Fencing Token: Each claim sets an exclusive `restorationWorkerToken`
 *    and lease expiration timestamp (`restorationLockedUntil`). Stale workers whose lease
 *    expired cannot perform out-of-order writes.
 * 3. Permanent Authoritative Deduplication (InventoryRestoration Collection):
 *    Each order variant restoration is assigned a stable, globally unique restoration ID:
 *    `${orderNumber}::${productId}::${size}::${color}`. Records are stored in a dedicated,
 *    durable `InventoryRestoration` collection and are NEVER evicted or bounded.
 * 4. Two-Phase In-Flight Atomic Intent Lock (`Product.pendingRestorations`):
 *    On standalone MongoDB without multi-document transactions, the stock increment is coupled
 *    with pushing `restorationId` into `Product.pendingRestorations` in the EXACT SAME single-document
 *    atomic write on Product.
 *    - If a crash occurs before Product write: `pendingRestorations` lacks the ID -> recovery increments stock.
 *    - If a crash occurs after Product write: `pendingRestorations` contains the ID -> recovery skips increment.
 *    Once the ledger is marked 'completed', the token is pulled from `Product.pendingRestorations`,
 *    keeping the Product document clean and strictly bounded at steady state.
 * 5. Missing Product Accounting: If a product is missing from the catalogue, the order records
 *    it in `unresolvedItems` and the ledger marks `status: 'unresolved'`, preserving durable audit state.
 */
export async function expireSingleOrder(
  orderId: Types.ObjectId | string,
  reason: string = 'UNPAID_EXPIRED',
  leaseMs: number = 30 * 1000,
  injectedWorkerToken?: string
): Promise<ExpireSingleOrderResult> {
  const targetId = typeof orderId === 'string' ? new Types.ObjectId(orderId) : orderId;
  const now = new Date();
  const lockLease = new Date(now.getTime() + leaseMs);
  const workerToken = injectedWorkerToken || crypto.randomUUID();

  // 1. Atomic Claim with Fencing Token:
  // - Case 1: Fresh eligible pending order.
  // - Case 2: Interrupted order whose previous worker lease has expired (stale lease recovery).
  // Strictly conditional: Only matches if orderStatus is still 'pending' OR if order was already claimed as UNPAID_EXPIRED and lease has expired.
  // If payment confirmation won the state transition, orderStatus is 'confirmed' / paymentStatus is 'paid', so it will NOT match!
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
          cancelledReason: { $regex: /^UNPAID_EXPIRED/ },
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
        restorationLockedUntil: lockLease,
        restorationWorkerToken: workerToken
      }
    },
    { returnDocument: 'after' }
  );

  // If order was already fully restored, paid/confirmed, or currently actively leased by another worker, exit cleanly
  if (!targetOrder) {
    return {
      success: false,
      orderId: targetId.toString(),
      restoredItemCount: 0,
      alreadyRestored: true
    };
  }

  // 2. Process each item with permanent InventoryRestoration ledger & Product-level intention lock
  let restoredCount = 0;
  const alreadyRestoredInOrder = new Set(targetOrder.restoredItems || []);
  const unresolvedItems: string[] = [];

  for (let itemIndex = 0; itemIndex < targetOrder.items.length; itemIndex++) {
    const item = targetOrder.items[itemIndex];

    // Stable, unique line-item identity:
    // - If item has persistent lineItemId (assigned during order creation): use it!
    // - If lineItemId is absent (legacy order), fall back to productId::size::color,
    //   disambiguated by line index if duplicate identical lines exist in the order.
    const legacyKey = `${item.productId}::${item.size}::${item.color}`;
    const legacyOrderKey = `${targetOrder.orderNumber}::${legacyKey}`;

    const isDuplicateVariant = targetOrder.items.filter(
      (it) => `${it.productId}::${it.size}::${it.color}` === legacyKey
    ).length > 1;

    const restorationId = item.lineItemId
      ? `${targetOrder.orderNumber}::${item.lineItemId}`
      : (isDuplicateVariant
          ? `${targetOrder.orderNumber}::${legacyKey}::line-${itemIndex}`
          : legacyOrderKey);

    // 2.1 Check Authoritative Permanent Ledger (InventoryRestoration collection)
    // Matches primary restorationId, or legacy keys for backward compatibility
    const existingLedger = await InventoryRestoration.findOne({
      $or: [
        { restorationId },
        { restorationId: legacyOrderKey }
      ]
    });

    if (existingLedger && existingLedger.status === 'completed') {
      // Already permanently restored! Ensure Product in-flight lock is cleaned up
      await Product.updateOne(
        { id: item.productId, pendingRestorations: restorationId },
        { $pull: { pendingRestorations: restorationId } }
      );
      // Ensure Order restoredItems has it
      await Order.updateOne(
        { _id: targetOrder._id, restorationWorkerToken: workerToken },
        { $addToSet: { restoredItems: restorationId } }
      );
      alreadyRestoredInOrder.add(restorationId);
      continue;
    }

    if (existingLedger && existingLedger.status === 'unresolved') {
      unresolvedItems.push(item.productId);
      continue;
    }

    if (alreadyRestoredInOrder.has(restorationId) || alreadyRestoredInOrder.has(legacyKey) || alreadyRestoredInOrder.has(legacyOrderKey)) {
      continue;
    }

    // Fencing check: verify our overall order lease deadline has not elapsed
    if (Date.now() > lockLease.getTime()) {
      throw new Error(`LEASE_EXPIRED: Worker lease expired during processing of order ${targetOrder.orderNumber}`);
    }

    // Fencing check: verify the order document's worker token is still ours
    const currentOrderCheck = await Order.findOne({ _id: targetOrder._id }, { restorationWorkerToken: 1 });
    if (currentOrderCheck?.restorationWorkerToken !== workerToken) {
      throw new Error(`STALE_WORKER_FENCE: Order ${targetOrder.orderNumber} lease was acquired by another worker.`);
    }

    // ------------------------------------------------------------------------
    // BRANCH A: TRANSACTIONAL RESTORATION (Atlas Replica Set / Local rs0)
    // Coordinated atomic ACID commit across InventoryRestoration, Product, and Order
    // ------------------------------------------------------------------------
    if (isTransactionSupported()) {
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          // 1. Durable Ledger Verification inside Transaction
          const txLedger = await InventoryRestoration.findOne(
            {
              $or: [{ restorationId }, { restorationId: legacyOrderKey }]
            },
            null,
            { session }
          );

          if (txLedger && txLedger.status === 'completed') {
            await Order.updateOne(
              { _id: targetOrder._id, restorationWorkerToken: workerToken },
              { $addToSet: { restoredItems: restorationId } },
              { session }
            );
            alreadyRestoredInOrder.add(restorationId);
            return;
          }

          if (txLedger && txLedger.status === 'unresolved') {
            unresolvedItems.push(item.productId);
            return;
          }

          // Ensure pending ledger record exists inside transaction
          let activeLedger = txLedger;
          if (!activeLedger) {
            try {
              activeLedger = (
                await InventoryRestoration.create(
                  [
                    {
                      restorationId,
                      orderId: targetOrder._id,
                      orderNumber: targetOrder.orderNumber,
                      lineItemId: item.lineItemId,
                      productId: item.productId,
                      size: item.size,
                      color: item.color,
                      quantity: item.quantity,
                      status: 'pending',
                      workerToken,
                      lockedUntil: lockLease
                    }
                  ],
                  { session }
                )
              )[0];
            } catch (createErr: any) {
              if (createErr.code === 11000) {
                activeLedger = await InventoryRestoration.findOne({ restorationId }, null, { session });
              } else {
                throw createErr;
              }
            }
          }

          if (activeLedger && activeLedger.status === 'completed') {
            await Order.updateOne(
              { _id: targetOrder._id, restorationWorkerToken: workerToken },
              { $addToSet: { restoredItems: restorationId } },
              { session }
            );
            alreadyRestoredInOrder.add(restorationId);
            return;
          }

          // Guarded ownership claim inside transaction
          const claimRes = await InventoryRestoration.findOneAndUpdate(
            {
              restorationId,
              status: 'pending',
              $or: [
                { lockedUntil: { $exists: false } },
                { lockedUntil: { $lte: new Date() } },
                { workerToken }
              ]
            },
            { $set: { workerToken, lockedUntil: lockLease } },
            { session, returnDocument: 'after' }
          );

          if (!claimRes) {
            // Already completed or claimed by another worker with active lease
            return;
          }

          // Catalogue check inside transaction
          const product = await Product.findOne({ id: item.productId }, null, { session });
          if (!product) {
            console.warn(`[OrderExpiry] Missing silhouette: '${item.productId}' not found in Product archive.`);
            unresolvedItems.push(item.productId);
            await InventoryRestoration.updateOne(
              { restorationId, workerToken, status: 'pending' },
              { $set: { status: 'unresolved', unresolvedReason: 'PRODUCT_NOT_FOUND' } },
              { session }
            );
            return;
          }

          // Atomic product stock increment inside transaction
          const productUpdate = await Product.findOneAndUpdate(
            { id: item.productId },
            {
              $inc: { stockCount: item.quantity },
              $set: { inStock: true }
            },
            { session, returnDocument: 'after' }
          );

          if (productUpdate) {
            restoredCount++;
          }

          // Mark durable ledger completed inside transaction
          await InventoryRestoration.updateOne(
            { restorationId, workerToken, status: 'pending' },
            {
              $set: {
                status: 'completed',
                restoredAt: new Date()
              }
            },
            { session }
          );

          // Record in Order inside transaction
          await Order.updateOne(
            { _id: targetOrder._id, restorationWorkerToken: workerToken },
            { $addToSet: { restoredItems: restorationId } },
            { session }
          );
          alreadyRestoredInOrder.add(restorationId);
        });
      } finally {
        await session.endSession();
      }
      continue;
    }

    // ------------------------------------------------------------------------
    // BRANCH B: STANDALONE ENGINE TWO-PHASE FENCING GATE (Fallback for standalone local MongoDB)
    // ------------------------------------------------------------------------

    // Ensure durable ledger record exists in 'pending' state
    let ledger = existingLedger;
    if (!ledger) {
      try {
        ledger = await InventoryRestoration.create({
          restorationId,
          orderId: targetOrder._id,
          orderNumber: targetOrder.orderNumber,
          lineItemId: item.lineItemId,
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          status: 'pending',
          workerToken,
          lockedUntil: lockLease
        });
      } catch (createErr: any) {
        if (createErr.code === 11000) {
          // Concurrent worker created record simultaneously
          ledger = await InventoryRestoration.findOne({ restorationId });
        } else {
          throw createErr;
        }
      }
    } else if (ledger.status === 'pending') {
      // Check if another worker holds an active lease on this record
      if (
        ledger.lockedUntil &&
        ledger.lockedUntil.getTime() > now.getTime() &&
        ledger.workerToken &&
        ledger.workerToken !== workerToken
      ) {
        throw new Error(`STALE_WORKER_FENCE: Ledger record ${restorationId} is actively leased by another worker.`);
      }

      // Claim record with our workerToken and lease
      const claimRes = await InventoryRestoration.updateOne(
        {
          restorationId,
          status: 'pending',
          $or: [
            { lockedUntil: { $exists: false } },
            { lockedUntil: { $lte: now } },
            { workerToken }
          ]
        },
        { $set: { workerToken, lockedUntil: lockLease } }
      );

      if (claimRes.matchedCount === 0) {
        throw new Error(`STALE_WORKER_FENCE: Failed to claim pending ledger record ${restorationId}.`);
      }
    }

    // Check Product catalogue existence
    const product = await Product.findOne({ id: item.productId });
    if (!product) {
      console.warn(`[OrderExpiry] Missing silhouette: '${item.productId}' not found in Product archive.`);
      unresolvedItems.push(item.productId);
      await InventoryRestoration.updateOne(
        { restorationId, workerToken, status: 'pending' },
        { $set: { status: 'unresolved', unresolvedReason: 'PRODUCT_NOT_FOUND' } }
      );
      continue;
    }

    // Determine if stock was ALREADY incremented in an interrupted prior attempt:
    // 1. Is restorationId in product.pendingRestorations?
    // 2. Or is it in product.restorationHistory (backward compatibility with Stage 8B-3B)?
    const stockAlreadyIncremented =
      (product.pendingRestorations?.includes(restorationId) ?? false) ||
      (product.restorationHistory?.some((h) => h.token === restorationId || h.token === legacyOrderKey) ?? false);

    if (!stockAlreadyIncremented) {
      // ATOMIC PRE-WRITE FENCING GATE:
      // Verify this worker STILL holds active ownership of the pending ledger record before modifying Product
      const preWriteClaim = await InventoryRestoration.findOneAndUpdate(
        {
          restorationId,
          workerToken,
          status: 'pending',
          lockedUntil: { $gt: new Date() }
        },
        {
          $set: { lockedUntil: lockLease }
        },
        { returnDocument: 'after' }
      );

      if (!preWriteClaim) {
        throw new Error(`STALE_WORKER_FENCE: Worker ${workerToken} lost ownership or lease expired for ${restorationId}`);
      }

      // Increment stock AND record restorationId in pendingRestorations atomically in a single Product write
      const productUpdate = await Product.findOneAndUpdate(
        {
          id: item.productId,
          pendingRestorations: { $ne: restorationId }
        },
        {
          $inc: { stockCount: item.quantity },
          $set: { inStock: true },
          $push: { pendingRestorations: restorationId }
        },
        { returnDocument: 'after' }
      );

      if (productUpdate) {
        restoredCount++;
      }
    }

    // 1. Mark ledger permanently completed (strictly guarded by workerToken & status: 'pending')
    const completeRes = await InventoryRestoration.updateOne(
      { restorationId, workerToken, status: 'pending' },
      {
        $set: {
          status: 'completed',
          restoredAt: new Date()
        }
      }
    );

    if (completeRes.matchedCount === 0) {
      throw new Error(`STALE_WORKER_FENCE: Lost ownership before ledger completion for ${restorationId}`);
    }

    // 2. Remove from Product.pendingRestorations so array is kept empty at steady state
    await Product.updateOne(
      { id: item.productId, pendingRestorations: restorationId },
      { $pull: { pendingRestorations: restorationId } }
    );

    // 3. Persist to Order.restoredItems so Order log is updated
    await Order.updateOne(
      { _id: targetOrder._id, restorationWorkerToken: workerToken },
      { $addToSet: { restoredItems: restorationId } }
    );
    alreadyRestoredInOrder.add(restorationId);
  }

  // 3. Mark final completion on Order
  const hasUnresolved = unresolvedItems.length > 0;
  let updatedNotes = targetOrder.notes || '';

  if (hasUnresolved) {
    const unresolvedNote = `Unresolved inventory restoration: Silhouettes [${unresolvedItems.join(', ')}] not found in archive.`;
    updatedNotes = updatedNotes ? `${updatedNotes} // ${unresolvedNote}` : unresolvedNote;

    await Order.updateOne(
      { _id: targetOrder._id, restorationWorkerToken: workerToken },
      {
        $set: {
          inventoryRestored: false,
          cancelledReason: 'UNPAID_EXPIRED_PARTIAL_RESTOCK',
          notes: updatedNotes,
          unresolvedItems
        }
      }
    );

    return {
      success: false,
      orderId: targetOrder._id.toString(),
      orderNumber: targetOrder.orderNumber,
      restoredItemCount: restoredCount,
      alreadyRestored: false,
      unresolvedCount: unresolvedItems.length,
      error: `PARTIAL_RESTORATION: Silhouettes [${unresolvedItems.join(', ')}] missing from catalogue.`
    };
  }

  const expiryNote = 'Auto-cancelled due to payment expiration window. Allocation restored to archive.';
  updatedNotes = updatedNotes ? `${updatedNotes} // ${expiryNote}` : expiryNote;

  await Order.updateOne(
    { _id: targetOrder._id, restorationWorkerToken: workerToken },
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
        cancelledReason: { $regex: /^UNPAID_EXPIRED/ },
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
      } else if (res.error) {
        failedCount++;
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
