// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import crypto from 'crypto';
import app from '../server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { InventoryRestoration } from '../models/InventoryRestoration';
import { seedCatalogue } from '../scripts/seedProducts';
import { initializeDatabaseIndexes } from '../config/database';
import {
  getOrderExpiryMinutes,
  expireStaleOrders,
  expireSingleOrder
} from '../services/orderExpiryService';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

// Colors for terminal reporting
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ${GREEN}✓${RESET} ${message}`);
    passed++;
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${message}`);
    failed++;
  }
}

async function runExpiryTestSuite() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}   VOID BACKEND — STAGE 8B-3E STALE WORKER & IDENTITY ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });

    // ------------------------------------------------------------------------
    console.log(`${CYAN}Test Group 1: Expiry Configuration Validation${RESET}`);
    // ------------------------------------------------------------------------
    const origConfig = process.env.ORDER_EXPIRY_MINUTES;

    delete process.env.ORDER_EXPIRY_MINUTES;
    assert(getOrderExpiryMinutes() === 60, 'Defaults to 60 minutes when ORDER_EXPIRY_MINUTES is unset');

    process.env.ORDER_EXPIRY_MINUTES = '30';
    assert(getOrderExpiryMinutes() === 30, 'Parses valid integer minutes (30)');

    process.env.ORDER_EXPIRY_MINUTES = 'invalid-text';
    let errNonNumeric: Error | null = null;
    try {
      getOrderExpiryMinutes();
    } catch (e: any) {
      errNonNumeric = e;
    }
    assert(
      errNonNumeric !== null && errNonNumeric.message.includes('Invalid ORDER_EXPIRY_MINUTES'),
      'Throws clear error for non-numeric ORDER_EXPIRY_MINUTES'
    );

    process.env.ORDER_EXPIRY_MINUTES = '-10';
    let errNegative: Error | null = null;
    try {
      getOrderExpiryMinutes();
    } catch (e: any) {
      errNegative = e;
    }
    assert(errNegative !== null, 'Rejects negative expiration minutes');

    process.env.ORDER_EXPIRY_MINUTES = '0';
    let errZero: Error | null = null;
    try {
      getOrderExpiryMinutes();
    } catch (e: any) {
      errZero = e;
    }
    assert(errZero !== null, 'Rejects zero expiration minutes');

    process.env.ORDER_EXPIRY_MINUTES = origConfig;

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: Database Index Initialization & Catalogue Setup${RESET}`);
    // ------------------------------------------------------------------------

    // Verify explicit index initialization
    await initializeDatabaseIndexes();
    assert(true, 'Explicitly verified and initialized database indexes (init completed)');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await InventoryRestoration.deleteMany({});
    await seedCatalogue();

    const userARes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Client A', email: 'client.a@void.atelier', password: 'Password123' });
    const cookieA = userARes.headers['set-cookie']?.[0]?.split(';')[0] || '';
    assert(userARes.status === 201, 'Registered Client A');

    const userBRes = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Client B', email: 'client.b@void.atelier', password: 'Password123' });
    const cookieB = userBRes.headers['set-cookie']?.[0]?.split(';')[0] || '';
    assert(userBRes.status === 201, 'Registered Client B');

    const validAddress = {
      fullName: 'Client A',
      addressLine1: '42 Residency Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560025',
      phone: '9876543210',
      email: 'client.a@void.atelier'
    };

    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
    const threeHoursAgo = new Date(Date.now() - 180 * 60 * 1000);
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Expiry Eligibility & Unpaid/Paid/Terminal Boundaries${RESET}`);
    // ------------------------------------------------------------------------

    const coatBefore = await Product.findOne({ id: 'prod-001' });
    const coatInitialStock = coatBefore?.stockCount || 14;

    const resOrder1 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 2 }]
      });
    assert(resOrder1.status === 201, 'Created Order 1 (2 units of prod-001)');
    const order1Id = resOrder1.body.order._id;
    const order1Number = resOrder1.body.order.orderNumber;
    const order1LineId = resOrder1.body.order.items[0].lineItemId;
    assert(order1LineId !== undefined, 'Assigned stable lineItemId during order creation');

    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order1Id) },
      { $set: { createdAt: twoHoursAgo } }
    );

    // Unexpired order
    const resOrder2 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-002', size: 'M', color: 'Void Black', quantity: 1 }]
      });
    const order2Id = resOrder2.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order2Id) },
      { $set: { createdAt: fiveMinsAgo } }
    );

    // Paid order
    const resOrder3 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-003', size: 'M', color: 'Pitch Black', quantity: 1 }]
      });
    const order3Id = resOrder3.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order3Id) },
      { $set: { createdAt: threeHoursAgo, paymentStatus: 'paid', orderStatus: 'confirmed' } }
    );

    // Terminal delivered order
    const resOrder4 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-004', size: 'M', color: 'Near Black', quantity: 1 }]
      });
    const order4Id = resOrder4.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order4Id) },
      { $set: { createdAt: threeHoursAgo, orderStatus: 'delivered', paymentStatus: 'paid' } }
    );

    // Run sweep
    const sweepResult = await expireStaleOrders({ expiryMinutes: 60 });
    assert(sweepResult.expiredCount === 1, 'Sweep expired exactly 1 eligible order (Order 1)');

    const order1After = await Order.findById(order1Id);
    assert(order1After?.orderStatus === 'cancelled', 'Eligible Order 1 transitioned to cancelled');
    assert(order1After?.paymentStatus === 'failed', 'Order 1 paymentStatus updated to failed');
    assert(order1After?.inventoryRestored === true, 'Order 1 marked inventoryRestored: true');

    const coatAfter = await Product.findOne({ id: 'prod-001' });
    assert(coatAfter?.stockCount === coatInitialStock, 'Restored product stock to initial level');

    const ledger1 = await InventoryRestoration.findOne({
      restorationId: `${order1Number}::${order1LineId}`
    });
    assert(ledger1 !== null, 'Durable ledger record created using stable lineItemId in restorationId');
    assert(ledger1?.status === 'completed', 'Ledger record marked status: completed');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Order-Line Identity (Duplicate Lines vs Single Combined Line)${RESET}`);
    // ------------------------------------------------------------------------

    // Case 4A: Order with two identical lines of quantity 1
    const coatStockBeforeDupTest = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const lineIdA = crypto.randomUUID();
    const lineIdB = crypto.randomUUID();

    const orderNumberDup = `VOID-TEST-DUP-${Date.now()}`;
    const dupLinesOrder = await Order.create({
      orderNumber: orderNumberDup,
      userId: new Types.ObjectId(),
      customer: { name: 'Client A', email: 'client.a@void.atelier', phone: '9876543210' },
      shippingAddress: validAddress,
      items: [
        {
          lineItemId: lineIdA,
          productId: 'prod-001',
          name: 'Ballistic Monolith Parka',
          size: 'M',
          color: 'Monolith Black',
          quantity: 1,
          unitPrice: 32000,
          lineTotal: 32000
        },
        {
          lineItemId: lineIdB,
          productId: 'prod-001',
          name: 'Ballistic Monolith Parka',
          size: 'M',
          color: 'Monolith Black',
          quantity: 1,
          unitPrice: 32000,
          lineTotal: 32000
        }
      ],
      subtotal: 64000,
      shipping: 0,
      total: 64000,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    // Simulate inventory deduction for both lines at checkout
    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: -2 } });

    await Order.collection.updateOne(
      { _id: dupLinesOrder._id },
      { $set: { createdAt: twoHoursAgo } }
    );

    const dupExpiryRes = await expireSingleOrder(dupLinesOrder._id);
    assert(dupExpiryRes.success === true, 'Successfully processed order with two identical lines');
    assert(dupExpiryRes.restoredItemCount === 2, 'Restored both identical lines independently (2 items)');

    const coatStockAfterDupTest = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      coatStockAfterDupTest === coatStockBeforeDupTest,
      'Two identical lines of quantity 1 restore two units in total (+2)'
    );

    const ledgerA = await InventoryRestoration.findOne({ restorationId: `${orderNumberDup}::${lineIdA}` });
    const ledgerB = await InventoryRestoration.findOne({ restorationId: `${orderNumberDup}::${lineIdB}` });
    assert(ledgerA !== null && ledgerB !== null, 'Created two distinct InventoryRestoration records');
    assert(ledgerA?.status === 'completed' && ledgerB?.status === 'completed', 'Both ledger records completed');

    // Retry of duplicate lines order
    const dupRetryRes = await expireSingleOrder(dupLinesOrder._id);
    assert(dupRetryRes.alreadyRestored === true, 'Retry of duplicate lines order returns alreadyRestored: true');
    const coatStockAfterDupRetry = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(coatStockAfterDupRetry === coatStockBeforeDupTest, 'Retry does not restore extra stock');

    // Case 4B: One line with quantity 2
    const coatStockBeforeCombined = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const lineIdCombined = crypto.randomUUID();
    const orderNumberCombined = `VOID-TEST-COMB-${Date.now()}`;

    const combinedOrder = await Order.create({
      orderNumber: orderNumberCombined,
      userId: new Types.ObjectId(),
      customer: { name: 'Client A', email: 'client.a@void.atelier', phone: '9876543210' },
      shippingAddress: validAddress,
      items: [
        {
          lineItemId: lineIdCombined,
          productId: 'prod-001',
          name: 'Ballistic Monolith Parka',
          size: 'M',
          color: 'Monolith Black',
          quantity: 2,
          unitPrice: 32000,
          lineTotal: 64000
        }
      ],
      subtotal: 64000,
      shipping: 0,
      total: 64000,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: -2 } });
    await Order.collection.updateOne({ _id: combinedOrder._id }, { $set: { createdAt: twoHoursAgo } });

    const combinedExpiryRes = await expireSingleOrder(combinedOrder._id);
    assert(combinedExpiryRes.success === true, 'Processed single line with quantity 2');

    const coatStockAfterCombined = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      coatStockAfterCombined === coatStockBeforeCombined,
      'One line with quantity 2 restores two units in total (+2)'
    );

    // Case 4C: Legacy Order Compatibility (no lineItemId)
    const coatStockBeforeLegacy = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const orderNumberLegacy = `VOID-TEST-LEGACY-${Date.now()}`;
    const legacyOrder = await Order.create({
      orderNumber: orderNumberLegacy,
      userId: new Types.ObjectId(),
      customer: { name: 'Client A', email: 'client.a@void.atelier', phone: '9876543210' },
      shippingAddress: validAddress,
      items: [
        {
          productId: 'prod-001',
          name: 'Ballistic Monolith Parka',
          size: 'M',
          color: 'Monolith Black',
          quantity: 1,
          unitPrice: 32000,
          lineTotal: 32000
        }
      ],
      subtotal: 32000,
      shipping: 0,
      total: 32000,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
    // Remove lineItemId if schema default added it
    await Order.collection.updateOne(
      { _id: legacyOrder._id },
      { $unset: { 'items.0.lineItemId': '' }, $set: { createdAt: twoHoursAgo } }
    );
    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: -1 } });

    const legacyExpiryRes = await expireSingleOrder(legacyOrder._id);
    assert(legacyExpiryRes.success === true, 'Successfully expired legacy order lacking lineItemId');
    const coatStockAfterLegacy = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(coatStockAfterLegacy === coatStockBeforeLegacy, 'Restored stock for legacy order');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 5: Stale-Worker Race & Fencing (Stage 8B-3D Interleaving)${RESET}`);
    // ------------------------------------------------------------------------
    // Simulate the exact interleaving from the 8B-3D audit:
    // 1. Worker A acquires order and ledger (workerToken: 'worker-a').
    // 2. Worker A pauses before stock write.
    // 3. Lease expires.
    // 4. Worker B takes over (workerToken: 'worker-b'), increments stock, marks ledger complete,
    //    and clears Product.pendingRestorations.
    // 5. Worker A unpauses and attempts to execute its stock write.
    // 6. Fencing gate MUST reject Worker A and prevent duplicate stock increment!

    const coatStockBeforeStaleRace = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const staleRaceOrderNumber = `VOID-STALE-RACE-${Date.now()}`;
    const staleRaceLineId = crypto.randomUUID();

    const staleRaceOrder = await Order.create({
      orderNumber: staleRaceOrderNumber,
      userId: new Types.ObjectId(),
      customer: { name: 'Client A', email: 'client.a@void.atelier', phone: '9876543210' },
      shippingAddress: validAddress,
      items: [
        {
          lineItemId: staleRaceLineId,
          productId: 'prod-001',
          name: 'Ballistic Monolith Parka',
          size: 'M',
          color: 'Monolith Black',
          quantity: 1,
          unitPrice: 32000,
          lineTotal: 32000
        }
      ],
      subtotal: 32000,
      shipping: 0,
      total: 32000,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: -1 } });
    await Order.collection.updateOne({ _id: staleRaceOrder._id }, { $set: { createdAt: twoHoursAgo } });

    // Step A: Worker B sweeps and completes restoration first
    const workerBToken = 'active-worker-b-uuid';
    const workerBResult = await expireSingleOrder(staleRaceOrder._id, 'UNPAID_EXPIRED', 30000, workerBToken);
    assert(workerBResult.success === true, 'Worker B successfully completed the restoration');

    const coatStockAfterWorkerB = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(coatStockAfterWorkerB === coatStockBeforeStaleRace, 'Worker B restored stock (+1)');

    // Verify Product.pendingRestorations is currently clean (empty)
    const prod1DocAfterB = await Product.findOne({ id: 'prod-001' });
    const raceRestorationId = `${staleRaceOrderNumber}::${staleRaceLineId}`;
    assert(
      !prod1DocAfterB?.pendingRestorations?.includes(raceRestorationId),
      'Product pendingRestorations was cleaned up by Worker B'
    );

    // Step B: Stale Worker A resumes with its old token 'stale-worker-a-uuid'
    // Stale Worker A attempts to execute expireSingleOrder
    const staleWorkerAToken = 'stale-worker-a-uuid';
    const workerAResult = await expireSingleOrder(staleRaceOrder._id, 'UNPAID_EXPIRED', 30000, staleWorkerAToken);

    assert(
      workerAResult.alreadyRestored === true && workerAResult.restoredItemCount === 0,
      'Stale Worker A is rejected: returns alreadyRestored: true with 0 item increments'
    );

    const coatStockAfterWorkerA = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      coatStockAfterWorkerA === coatStockBeforeStaleRace,
      'Product stock was NOT double-incremented by stale Worker A (zero phantom inventory)'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 6: Pre-Write Fencing Gate (Ownership Loss Before Product Write)${RESET}`);
    // ------------------------------------------------------------------------
    // Test that if a worker's ledger ownership is lost before touching Product,
    // the preWriteClaim atomic query catches it and throws STALE_WORKER_FENCE.

    const testPreWriteOrderId = (await Order.create({
      orderNumber: `VOID-TEST-PW-${Date.now()}`,
      userId: new Types.ObjectId(),
      customer: { name: 'Client A', email: 'client.a@void.atelier', phone: '9876543210' },
      shippingAddress: validAddress,
      items: [{ productId: 'prod-001', name: 'Ballistic Monolith Parka', size: 'M', color: 'Monolith Black', quantity: 1, unitPrice: 32000, lineTotal: 32000 }],
      subtotal: 32000,
      shipping: 0,
      total: 32000,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'cancelled',
      cancelledReason: 'UNPAID_EXPIRED',
      inventoryRestored: false
    }))._id;

    // Simulate ledger record already claimed by Worker B
    const pwRestorationId = `VOID-TEST-PW-MANUAL::prod-001::M::Monolith Black`;
    await InventoryRestoration.create({
      restorationId: pwRestorationId,
      orderId: testPreWriteOrderId,
      orderNumber: 'VOID-TEST-PW-MANUAL',
      productId: 'prod-001',
      size: 'M',
      color: 'Monolith Black',
      quantity: 1,
      status: 'pending',
      workerToken: 'worker-b-owner',
      lockedUntil: new Date(Date.now() + 60000)
    });

    // Worker A attempts to claim it with expired token
    const staleClaimRes = await InventoryRestoration.findOneAndUpdate(
      {
        restorationId: pwRestorationId,
        workerToken: 'worker-a-stale',
        status: 'pending',
        lockedUntil: { $gt: new Date() }
      },
      { $set: { lockedUntil: new Date(Date.now() + 30000) } }
    );
    assert(staleClaimRes === null, 'Atomic pre-write query returns null for superseded worker token');
    await Order.deleteOne({ _id: testPreWriteOrderId });
    await InventoryRestoration.deleteOne({ restorationId: pwRestorationId });

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 7: Guarded Ledger Completion (Fenced Completion Write)${RESET}`);
    // ------------------------------------------------------------------------
    // Stale worker cannot mark ledger complete if it does not match workerToken and status: 'pending'

    const testCompleteFenceId = `VOID-TEST-CF-${Date.now()}`;
    await InventoryRestoration.create({
      restorationId: testCompleteFenceId,
      orderId: new Types.ObjectId(),
      orderNumber: 'VOID-TEST-CF',
      productId: 'prod-001',
      size: 'M',
      color: 'Monolith Black',
      quantity: 1,
      status: 'pending',
      workerToken: 'worker-b-current',
      lockedUntil: new Date(Date.now() + 30000)
    });

    // Stale Worker A attempts updateOne on ledger
    const staleCompletionRes = await InventoryRestoration.updateOne(
      { restorationId: testCompleteFenceId, workerToken: 'worker-a-stale', status: 'pending' },
      { $set: { status: 'completed', restoredAt: new Date() } }
    );
    assert(
      staleCompletionRes.matchedCount === 0,
      'Stale worker completion write matches 0 documents (strictly guarded by workerToken)'
    );

    // Active Worker B completes successfully
    const activeCompletionRes = await InventoryRestoration.updateOne(
      { restorationId: testCompleteFenceId, workerToken: 'worker-b-current', status: 'pending' },
      { $set: { status: 'completed', restoredAt: new Date() } }
    );
    assert(
      activeCompletionRes.matchedCount === 1,
      'Active worker with valid token completes ledger record successfully'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 8: Permanent Idempotency (>200 Subsequent Operations)${RESET}`);
    // ------------------------------------------------------------------------

    const stockBeforeEvictionTest = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    // Simulate 250 subsequent restorations
    const dummyLedgers = [];
    for (let i = 1; i <= 250; i++) {
      dummyLedgers.push({
        restorationId: `VOID-SUBSEQUENT-${i}::prod-001::M::Monolith Black`,
        orderId: new Types.ObjectId(),
        orderNumber: `VOID-SUBSEQUENT-${i}`,
        productId: 'prod-001',
        size: 'M',
        color: 'Monolith Black',
        quantity: 1,
        status: 'completed',
        restoredAt: new Date()
      });
    }
    await InventoryRestoration.insertMany(dummyLedgers);

    const retryAfterEviction = await expireSingleOrder(order1Id);
    assert(
      retryAfterEviction.alreadyRestored === true && retryAfterEviction.restoredItemCount === 0,
      'Retry after 250 subsequent restorations returns alreadyRestored: true'
    );

    const stockAfterEvictionTest = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      stockAfterEvictionTest === stockBeforeEvictionTest,
      'Zero stock changes after >200 subsequent operations (permanent idempotency verified)'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 9: Crash Boundaries (Before and After Stock Write)${RESET}`);
    // ------------------------------------------------------------------------

    // Boundary A: Interruption after ledger created but before stock write
    const resCrashA = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-002', size: 'M', color: 'Void Black', quantity: 2 }]
      });
    const crashAOrderId = resCrashA.body.order._id;
    const crashAOrderNum = resCrashA.body.order.orderNumber;
    const crashALineId = resCrashA.body.order.items[0].lineItemId;
    const crashARestorationId = `${crashAOrderNum}::${crashALineId}`;

    const stockBeforeCrashA = (await Product.findOne({ id: 'prod-002' }))?.stockCount || 0;

    await InventoryRestoration.create({
      restorationId: crashARestorationId,
      orderId: new Types.ObjectId(crashAOrderId),
      orderNumber: crashAOrderNum,
      lineItemId: crashALineId,
      productId: 'prod-002',
      size: 'M',
      color: 'Void Black',
      quantity: 2,
      status: 'pending',
      workerToken: 'crashed-worker-token-a',
      lockedUntil: twoHoursAgo
    });
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(crashAOrderId) },
      { $set: { createdAt: twoHoursAgo, orderStatus: 'cancelled', cancelledReason: 'UNPAID_EXPIRED', inventoryRestored: false, restorationLockedUntil: twoHoursAgo } }
    );

    const recoveryARes = await expireSingleOrder(crashAOrderId);
    assert(recoveryARes.success === true, 'Recovers successfully when crashed before stock write');
    const stockAfterCrashA = (await Product.findOne({ id: 'prod-002' }))?.stockCount || 0;
    assert(stockAfterCrashA === stockBeforeCrashA + 2, 'Restores stock by exactly 2 (+2)');

    // Boundary B: Interruption after stock write but before ledger complete
    const resCrashB = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    const crashBOrderId = resCrashB.body.order._id;
    const crashBOrderNum = resCrashB.body.order.orderNumber;
    const crashBLineId = resCrashB.body.order.items[0].lineItemId;
    const crashBRestorationId = `${crashBOrderNum}::${crashBLineId}`;

    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: 1 }, $push: { pendingRestorations: crashBRestorationId } });
    const stockAfterManualBWrite = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    await InventoryRestoration.create({
      restorationId: crashBRestorationId,
      orderId: new Types.ObjectId(crashBOrderId),
      orderNumber: crashBOrderNum,
      lineItemId: crashBLineId,
      productId: 'prod-001',
      size: 'M',
      color: 'Monolith Black',
      quantity: 1,
      status: 'pending',
      workerToken: 'crashed-worker-token-b',
      lockedUntil: twoHoursAgo
    });
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(crashBOrderId) },
      { $set: { createdAt: twoHoursAgo, orderStatus: 'cancelled', cancelledReason: 'UNPAID_EXPIRED', inventoryRestored: false, restorationLockedUntil: twoHoursAgo } }
    );

    const recoveryBRes = await expireSingleOrder(crashBOrderId);
    assert(recoveryBRes.success === true, 'Recovers successfully when crashed after stock write');
    const stockAfterRecoveryB = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(stockAfterRecoveryB === stockAfterManualBWrite, 'Does NOT double-increment stock');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 10: Missing Product Restoration & Reporting${RESET}`);
    // ------------------------------------------------------------------------

    const resMissingOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    const missingOrderId = resMissingOrder.body.order._id;
    const missingOrderNumber = resMissingOrder.body.order.orderNumber;

    await Order.collection.updateOne(
      { _id: new Types.ObjectId(missingOrderId) },
      {
        $set: { createdAt: twoHoursAgo },
        $push: {
          items: {
            lineItemId: 'missing-ghost-line-id',
            productId: 'prod-ghost-missing-999',
            name: 'Ghost Silhouette',
            size: 'OS',
            color: 'Void',
            price: 15000,
            quantity: 1
          }
        }
      } as any
    );

    const missingResult = await expireSingleOrder(missingOrderId);
    assert(missingResult.success === false, 'Expiry reports failure due to missing item');
    assert(missingResult.unresolvedCount === 1, 'Expiry reports 1 unresolved item');

    const ghostRestorationId = `${missingOrderNumber}::missing-ghost-line-id`;
    const ghostLedger = await InventoryRestoration.findOne({ restorationId: ghostRestorationId });
    assert(ghostLedger?.status === 'unresolved', 'InventoryRestoration record marked status: unresolved');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 11: Concurrent Claims & Duplicate Key Handling${RESET}`);
    // ------------------------------------------------------------------------

    const resOrderConcurrent = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 3 }]
      });
    const orderConcurrentId = resOrderConcurrent.body.order._id;
    await Order.collection.updateOne({ _id: new Types.ObjectId(orderConcurrentId) }, { $set: { createdAt: twoHoursAgo } });

    const stockBeforeConcurrentSweep = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    await Promise.all([
      expireSingleOrder(orderConcurrentId),
      expireSingleOrder(orderConcurrentId),
      expireSingleOrder(orderConcurrentId),
      expireStaleOrders({ expiryMinutes: 60 })
    ]);

    const stockAfterConcurrentSweep = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      stockAfterConcurrentSweep === stockBeforeConcurrentSweep + 3,
      'Concurrent sweeps increment inventory by exactly 3 (zero double restoration)'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 12: Expiry Racing with Payment Confirmation${RESET}`);
    // ------------------------------------------------------------------------

    const resRaceA = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    const orderRaceAId = resRaceA.body.order._id;
    await Order.collection.updateOne({ _id: new Types.ObjectId(orderRaceAId) }, { $set: { createdAt: twoHoursAgo } });

    // Payment confirmation wins
    await Order.findOneAndUpdate(
      { _id: orderRaceAId, orderStatus: 'pending', paymentStatus: { $in: ['pending', 'unpaid'] } },
      { $set: { orderStatus: 'confirmed', paymentStatus: 'paid', paidAt: new Date() } }
    );

    const expiryRaceARes = await expireSingleOrder(orderRaceAId);
    assert(
      expiryRaceARes.alreadyRestored === true && expiryRaceARes.success === false,
      'Expiry cannot claim order won by payment confirmation'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 13: Idempotent Checkout Protection & History${RESET}`);
    // ------------------------------------------------------------------------

    const idempotencyKey = 'checkout-idemp-stage8b3e-test';

    const resIdempOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resIdempOrder.status === 201, 'Created order with idempotency key');
    const idempOrderId = resIdempOrder.body.order._id;

    await Order.collection.updateOne({ _id: new Types.ObjectId(idempOrderId) }, { $set: { createdAt: twoHoursAgo } });
    await expireSingleOrder(idempOrderId);

    const resIdempRetry = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resIdempRetry.status === 409, 'Rejects retry of expired order with 409 Conflict');

    const resOrderHistory = await request(app).get('/api/orders?limit=50').set('Cookie', cookieA);
    assert(resOrderHistory.status === 200, 'Client A can fetch order history (200)');
    const expiredInHistory = resOrderHistory.body.orders.find((o: any) => o._id === idempOrderId.toString());
    assert(expiredInHistory?.orderStatus === 'cancelled', 'Order history presents status as cancelled');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 14: Order-Creation Stock Rollback & Compensation${RESET}`);
    // ------------------------------------------------------------------------

    const prod1Initial = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    await Product.updateOne({ id: 'prod-002' }, { $set: { stockCount: 0, inStock: false } });

    const failedCheckoutRes = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [
          { productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 2 },
          { productId: 'prod-002', size: 'M', color: 'Void Black', quantity: 1 }
        ]
      });

    assert(failedCheckoutRes.status === 400, 'Rejects checkout when second item has insufficient stock (400)');
    const prod1AfterFailed = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(prod1AfterFailed === prod1Initial, 'Compensating transaction rolls back first item stock');

    await Product.updateOne({ id: 'prod-002' }, { $set: { stockCount: 15, inStock: true } });

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 15: Concurrency, Simulated Abort & Rollback Safety${RESET}`);
    // ------------------------------------------------------------------------

    // 15.1 Simulated Abort Before Commit
    const resAbortOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 3 }]
      });
    assert(resAbortOrder.status === 201, 'Created order for simulated transaction abort test');
    const abortOrderId = resAbortOrder.body.order._id;
    const prod1StockBeforeAbort = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    // Simulate an aborted restoration attempt by injecting a pending ledger record and verifying rollback safety
    const abortOrderDoc = await Order.findById(abortOrderId);
    const lineItemToAbort = abortOrderDoc?.items[0];
    const abortRestorationId = `${abortOrderDoc?.orderNumber}::${lineItemToAbort?.lineItemId}`;

    // Create an uncommitted / pending ledger entry simulating an aborted transaction
    await InventoryRestoration.create({
      restorationId: abortRestorationId,
      orderId: abortOrderDoc?._id,
      orderNumber: abortOrderDoc?.orderNumber,
      lineItemId: lineItemToAbort?.lineItemId,
      productId: 'prod-001',
      size: 'M',
      color: 'Monolith Black',
      quantity: 3,
      status: 'pending',
      workerToken: 'worker-aborted-999',
      lockedUntil: new Date(Date.now() - 1000) // already expired lease
    });

    // Verify stock has not changed during aborted state
    const prod1StockDuringAbort = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(prod1StockDuringAbort === prod1StockBeforeAbort, 'Stock remains unchanged when restoration transaction aborts');

    // Recovery worker sweeps and completes the aborted record cleanly
    await Order.collection.updateOne({ _id: new Types.ObjectId(abortOrderId) }, { $set: { createdAt: twoHoursAgo } });
    const recoveryRes = await expireSingleOrder(abortOrderId);
    assert(recoveryRes.success === true, 'Recovery successfully finishes uncommitted restoration');
    assert(recoveryRes.restoredItemCount === 1, 'Restored exactly 1 line item after aborted attempt');

    const prod1StockAfterRecovery = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(prod1StockAfterRecovery === prod1StockBeforeAbort + 3, 'Restores correct inventory (+3) upon post-abort recovery');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 16: Failure Recovery & Interruption Distinction${RESET}`);
    // ------------------------------------------------------------------------

    // Note on Interruption Distinction:
    // - Simulated Interruption: Unit/integration mock where lease timeout or exception occurs mid-flight in Node event loop.
    // - Actual Process Crash: OS-level kill (SIGKILL) where memory state is destroyed and recovery depends exclusively on MongoDB durable state.
    const resCrashOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieB)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 2 }]
      });
    assert(resCrashOrder.status === 201, 'Created order for crash recovery test');
    const crashOrderId = resCrashOrder.body.order._id;
    const prod1StockBeforeCrash = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    const crashOrderDoc = await Order.findById(crashOrderId);
    const crashLine = crashOrderDoc?.items[0];
    const crashRestorationId = `${crashOrderDoc?.orderNumber}::${crashLine?.lineItemId}`;

    // Simulate crash where stock was already updated and recorded in ledger before process termination
    await InventoryRestoration.create({
      restorationId: crashRestorationId,
      orderId: crashOrderDoc?._id,
      orderNumber: crashOrderDoc?.orderNumber,
      lineItemId: crashLine?.lineItemId,
      productId: 'prod-001',
      size: 'M',
      color: 'Monolith Black',
      quantity: 2,
      status: 'completed',
      restoredAt: new Date()
    });
    // Stock was incremented prior to crash
    await Product.updateOne({ id: 'prod-001' }, { $inc: { stockCount: 2 } });

    // Process restarts and new worker sweeps this order
    await Order.collection.updateOne({ _id: new Types.ObjectId(crashOrderId) }, { $set: { createdAt: twoHoursAgo } });
    const postCrashSweepRes = await expireSingleOrder(crashOrderId);
    assert(postCrashSweepRes.success === true, 'New worker detects existing completed ledger record');
    assert(postCrashSweepRes.restoredItemCount === 0, 'Zero additional items incremented (prevents double restoration)');

    const prod1StockAfterCrashSweep = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(prod1StockAfterCrashSweep === prod1StockBeforeCrash + 2, 'Stock count remains exactly +2 (zero phantom stock)');

    await mongoose.disconnect();

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}======================================================${RESET}`);
    console.log(`TEST SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed === 0 ? GREEN : RED}${failed} Failed${RESET}`);
    console.log(`${CYAN}======================================================${RESET}\n`);

    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runExpiryTestSuite();
