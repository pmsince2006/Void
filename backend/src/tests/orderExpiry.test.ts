// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import mongoose, { Types } from 'mongoose';
import app from '../server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { seedCatalogue } from '../scripts/seedProducts';
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
  console.log(`${CYAN}   VOID BACKEND — STAGE 8B-3 UNPAID ORDER EXPIRY      ${RESET}`);
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

    // Case 1A: Default fallback (60 minutes)
    delete process.env.ORDER_EXPIRY_MINUTES;
    assert(getOrderExpiryMinutes() === 60, 'Defaults to 60 minutes when ORDER_EXPIRY_MINUTES is unset');

    // Case 1B: Valid configuration
    process.env.ORDER_EXPIRY_MINUTES = '30';
    assert(getOrderExpiryMinutes() === 30, 'Parses valid integer minutes (30)');

    // Case 1C: Non-numeric invalid configuration
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

    // Case 1D: Negative or zero duration
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
    console.log(`\n${CYAN}Test Group 2: User Setup & Catalogue Initialization${RESET}`);
    // ------------------------------------------------------------------------

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
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

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Expiry Eligibility & State Transitions${RESET}`);
    // ------------------------------------------------------------------------

    // Standard valid shipping address
    const validAddress = {
      fullName: 'Client A',
      addressLine1: '42 Residency Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560025',
      phone: '9876543210',
      email: 'client.a@void.atelier'
    };

    // Sub-case 3A: Create Order 1 (qty 2 of prod-001) - will be aged to 2 hours ago
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

    // Age Order 1 to 2 hours ago using direct collection update (bypassing Mongoose timestamps middleware)
    const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000);
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order1Id) },
      { $set: { createdAt: twoHoursAgo } }
    );

    // Sub-case 3B: Create Order 2 (qty 1 of prod-002) - unexpired pending (created 5 mins ago)
    const resOrder2 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-002', size: 'M', color: 'Void Black', quantity: 1 }]
      });
    assert(resOrder2.status === 201, 'Created Order 2 (1 unit of prod-002)');
    const order2Id = resOrder2.body.order._id;
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order2Id) },
      { $set: { createdAt: fiveMinsAgo } }
    );

    // Sub-case 3C: Create Order 3 - Paid Order (aged to 3 hours ago)
    const resOrder3 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-003', size: 'M', color: 'Pitch Black', quantity: 1 }]
      });
    assert(resOrder3.status === 201, 'Created Order 3 (1 unit of prod-003)');
    const order3Id = resOrder3.body.order._id;
    const threeHoursAgo = new Date(Date.now() - 180 * 60 * 1000);
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order3Id) },
      {
        $set: {
          createdAt: threeHoursAgo,
          paymentStatus: 'paid',
          orderStatus: 'confirmed'
        }
      }
    );

    // Sub-case 3D: Create Order 4 - Terminal Delivered Order (aged to 3 hours ago)
    const resOrder4 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-004', size: 'M', color: 'Near Black', quantity: 1 }]
      });
    assert(resOrder4.status === 201, 'Created Order 4 (1 unit of prod-004)');
    const order4Id = resOrder4.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(order4Id) },
      {
        $set: {
          createdAt: threeHoursAgo,
          orderStatus: 'delivered',
          paymentStatus: 'paid'
        }
      }
    );

    // Execute Sweep with 60-minute expiry threshold
    const sweepResult = await expireStaleOrders({ expiryMinutes: 60 });
    assert(sweepResult.expiredCount === 1, 'Sweep expired exactly 1 eligible order (Order 1)');

    // Verify Order 1 state
    const order1After = await Order.findById(order1Id);
    assert(order1After?.orderStatus === 'cancelled', 'Eligible Order 1 transitioned to cancelled');
    assert(order1After?.paymentStatus === 'failed', 'Order 1 paymentStatus updated to failed');
    assert(order1After?.cancelledReason === 'UNPAID_EXPIRED', 'Order 1 records UNPAID_EXPIRED reason');
    assert(order1After?.inventoryRestored === true, 'Order 1 marked inventoryRestored: true');
    assert(order1After?.cancelledAt !== undefined, 'Order 1 records cancelledAt timestamp');

    // Verify Stock Restoration for Order 1
    const coatAfter = await Product.findOne({ id: 'prod-001' });
    assert(
      coatAfter?.stockCount === coatInitialStock,
      `Restored product stock (returned from ${coatInitialStock - 2} to ${coatInitialStock})`
    );

    // Verify Order 2 remains active and unexpired
    const order2After = await Order.findById(order2Id);
    assert(order2After?.orderStatus === 'pending', 'Recent Order 2 remains active (orderStatus: pending)');
    assert(order2After?.paymentStatus === 'pending', 'Recent Order 2 paymentStatus remains pending');
    assert(order2After?.inventoryRestored !== true, 'Recent Order 2 inventory not restored');

    // Verify Order 3 (Paid) never expired
    const order3After = await Order.findById(order3Id);
    assert(order3After?.orderStatus === 'confirmed', 'Paid Order 3 never expires (orderStatus: confirmed)');
    assert(order3After?.paymentStatus === 'paid', 'Paid Order 3 paymentStatus remains paid');

    // Verify Order 4 (Delivered) never expired
    const order4After = await Order.findById(order4Id);
    assert(order4After?.orderStatus === 'delivered', 'Terminal Order 4 remains delivered');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Idempotence & Concurrency (Zero Double Restoration)${RESET}`);
    // ------------------------------------------------------------------------

    // Sub-case 4A: Repeated sweep does not double-restore stock
    const coatStockBeforeRepeated = (await Product.findOne({ id: 'prod-001' }))?.stockCount;
    const repeatedSweep = await expireStaleOrders({ expiryMinutes: 60 });
    assert(repeatedSweep.expiredCount === 0, 'Repeated sweep finds 0 eligible orders');
    const coatStockAfterRepeated = (await Product.findOne({ id: 'prod-001' }))?.stockCount;
    assert(
      coatStockAfterRepeated === coatStockBeforeRepeated,
      'Repeated expiry sweep does not double-restore inventory'
    );

    // Sub-case 4B: Concurrent workers racing on the same expired order
    const resOrderConcurrent = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 3 }]
      });
    const orderConcurrentId = resOrderConcurrent.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(orderConcurrentId) },
      { $set: { createdAt: twoHoursAgo } }
    );

    const stockBeforeConcurrentSweep = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;

    // Simulate 4 concurrent processes racing to expire the exact same order
    const concurrentResults = await Promise.all([
      expireSingleOrder(orderConcurrentId),
      expireSingleOrder(orderConcurrentId),
      expireSingleOrder(orderConcurrentId),
      expireStaleOrders({ expiryMinutes: 60 })
    ]);

    const successfulRestores = concurrentResults.filter(
      (r: any) => r.success === true || (r.expiredCount && r.expiredCount > 0)
    );
    assert(
      successfulRestores.length >= 1,
      'Concurrent execution completes without unhandled race crashes'
    );

    const stockAfterConcurrentSweep = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    assert(
      stockAfterConcurrentSweep === stockBeforeConcurrentSweep + 3,
      'Concurrent sweeps increment inventory by exactly 3 (zero double restoration)'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 5: Partial Failure Recovery & Item-Level Tracking${RESET}`);
    // ------------------------------------------------------------------------

    // Create multi-item order (prod-001 qty 1, prod-002 qty 1)
    const resMultiOrder = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: validAddress,
        items: [
          { productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 },
          { productId: 'prod-002', size: 'M', color: 'Void Black', quantity: 1 }
        ]
      });
    const multiOrderId = resMultiOrder.body.order._id;
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(multiOrderId) },
      { $set: { createdAt: twoHoursAgo } }
    );

    // Simulate partial failure: prod-001 was already restored and recorded in restoredItems,
    // but the worker died before prod-002 could be processed (inventoryRestored: false)
    const prod1StockBeforePartial = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const prod2StockBeforePartial = (await Product.findOne({ id: 'prod-002' }))?.stockCount || 0;

    await Order.updateOne(
      { _id: multiOrderId },
      {
        orderStatus: 'cancelled',
        cancelledReason: 'UNPAID_EXPIRED',
        inventoryRestored: false,
        restoredItems: ['prod-001::M::Monolith Black']
      }
    );

    // Execute recovery
    const retryResult = await expireSingleOrder(multiOrderId);
    assert(retryResult.success === true, 'Resumes and recovers interrupted order restoration');

    const prod1StockAfterPartial = (await Product.findOne({ id: 'prod-001' }))?.stockCount || 0;
    const prod2StockAfterPartial = (await Product.findOne({ id: 'prod-002' }))?.stockCount || 0;

    assert(
      prod1StockAfterPartial === prod1StockBeforePartial,
      'Does not re-increment already-restored item (prod-001)'
    );
    assert(
      prod2StockAfterPartial === prod2StockBeforePartial + 1,
      'Successfully restores pending remaining item (prod-002)'
    );

    const multiOrderFinal = await Order.findById(multiOrderId);
    assert(multiOrderFinal?.inventoryRestored === true, 'Order marked inventoryRestored: true after retry');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 6: Idempotent Checkout Protection & Order History${RESET}`);
    // ------------------------------------------------------------------------

    const idempotencyKey = 'checkout-idemp-expire-test-key-999';

    // Step A: Create order with idempotency key
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

    // Step B: Age and expire the order
    await Order.collection.updateOne(
      { _id: new Types.ObjectId(idempOrderId) },
      { $set: { createdAt: twoHoursAgo } }
    );
    await expireSingleOrder(idempOrderId);

    // Step C: Client retries checkout with the same idempotency key
    const resIdempRetry = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        shippingAddress: validAddress,
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(
      resIdempRetry.status === 409,
      'Rejects idempotent checkout retry of expired order with 409 Conflict'
    );
    assert(
      resIdempRetry.body.message.includes('expired'),
      'Informs client that the previous checkout session expired'
    );

    // Step D: Order History & Ownership Behavior
    const resOrderHistory = await request(app)
      .get('/api/orders')
      .set('Cookie', cookieA);
    assert(resOrderHistory.status === 200, 'Client A can fetch order history (200)');
    const expiredInHistory = resOrderHistory.body.orders.find(
      (o: any) => o._id === idempOrderId.toString()
    );
    assert(expiredInHistory !== undefined, 'Expired order remains visible in Client A history');
    assert(
      expiredInHistory?.orderStatus === 'cancelled',
      'Order history correctly presents status as cancelled'
    );

    // Client A can view order details
    const resClientAView = await request(app)
      .get(`/api/orders/${idempOrderId}`)
      .set('Cookie', cookieA);
    assert(resClientAView.status === 200, 'Client A can view expired order details (200)');

    // Client B cannot view Client A's expired order
    const resClientBView = await request(app)
      .get(`/api/orders/${idempOrderId}`)
      .set('Cookie', cookieB);
    assert(resClientBView.status === 404, 'Client B cannot access Client A expired order (404)');

    // Clean up
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
