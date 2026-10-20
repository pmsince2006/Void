// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Wishlist } from '../models/Wishlist';
import { Order } from '../models/Order';
import { seedCatalogue } from '../scripts/seedProducts';
import { SESSION_COOKIE_NAME } from '../utils/token';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

// Terminal colors
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

async function runOrdersTestSuite() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}   VOID BACKEND — STAGE 7B ORDERS TEST SUITE          ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to isolated test database: ${TEST_DB_URI}\n`);

    // Clean test database and re-seed catalogue
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Order.deleteMany({});
    await Order.collection.dropIndexes().catch(() => {});
    await Order.syncIndexes();
    await Product.deleteMany({});
    await seedCatalogue();

    // ------------------------------------------------------------------------
    console.log(`${CYAN}Test Group 1: Unauthenticated Rejections (401)${RESET}`);
    // ------------------------------------------------------------------------

    const resOrderCreateNoAuth = await request(app)
      .post('/api/orders')
      .send({
        shippingAddress: {
          fullName: 'Guest Tester',
          addressLine1: '22 Horizon Avenue',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400001',
          phone: '9876543210'
        }
      });
    assert(resOrderCreateNoAuth.status === 401, 'Rejects unauthenticated POST /api/orders with 401');

    const resOrdersGetNoAuth = await request(app).get('/api/orders');
    assert(resOrdersGetNoAuth.status === 401, 'Rejects unauthenticated GET /api/orders with 401');

    const resOrderGetByIdNoAuth = await request(app).get('/api/orders/VOID-20261020-ABCDEF');
    assert(resOrderGetByIdNoAuth.status === 401, 'Rejects unauthenticated GET /api/orders/:id with 401');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: User Setup & Session Provisioning${RESET}`);
    // ------------------------------------------------------------------------

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
    console.log(`\n${CYAN}Test Group 3: Input Validation & Shipping Rejections${RESET}`);
    // ------------------------------------------------------------------------

    // Reject missing/short name
    const resBadName = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resBadName.status === 400, 'Rejects name with fewer than 2 characters with 400');

    // Reject invalid Indian phone
    const resBadPhone = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '12345'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resBadPhone.status === 400, 'Rejects invalid phone number format with 400');

    // Reject invalid PIN code
    const resBadPin = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '012345',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resBadPin.status === 400, 'Rejects invalid PIN code format with 400');

    // Reject short address
    const resShortAddr = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: 'Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resShortAddr.status === 400, 'Rejects street address shorter than 5 characters with 400');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Variant Validation & Empty Cart Rejections${RESET}`);
    // ------------------------------------------------------------------------

    // Reject empty bag
    const resEmptyBag = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: []
      });
    assert(resEmptyBag.status === 400, 'Rejects empty items array with 400');

    // Reject non-existent product
    const resFakeProd = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-999', size: 'M', color: 'Black', quantity: 1 }]
      });
    assert(resFakeProd.status === 404, 'Rejects non-existent product ID with 404');

    // Reject invalid size
    const resBadSize = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'XXXL', color: 'Monolith Black', quantity: 1 }]
      });
    assert(resBadSize.status === 400, 'Rejects unavailable size for piece with 400');

    // Reject invalid color
    const resBadColor = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Neon Pink', quantity: 1 }]
      });
    assert(resBadColor.status === 400, 'Rejects unavailable color for piece with 400');

    // Reject negative/zero quantity
    const resBadQty = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 0 }]
      });
    assert(resBadQty.status === 400, 'Rejects zero quantity with 400');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 5: Server-Calculated Totals & Security${RESET}`);
    // ------------------------------------------------------------------------

    // Product prod-001 price in DB is ₹24,990.
    // Client attempts to pass a malicious price (₹1), fake discount, and fake total.
    const initialProduct = await Product.findOne({ id: 'prod-001' });
    const initialStock = initialProduct?.stockCount || 14;

    const resTamperedPrice = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road, Block C',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [
          {
            productId: 'prod-001',
            size: 'M',
            color: 'Monolith Black',
            quantity: 2,
            price: 1, // Tampered unit price
            unitPrice: 1,
            lineTotal: 2,
            subtotal: 2,
            total: 2
          }
        ],
        subtotal: 2,
        total: 2,
        paymentStatus: 'paid' // Malicious client claims already paid
      });

    assert(resTamperedPrice.status === 201, 'Creates order successfully (201)');
    const createdOrder = resTamperedPrice.body.order;
    assert(createdOrder.orderNumber.startsWith('VOID-'), 'Generates valid human-readable orderNumber');
    assert(createdOrder.subtotal === 24990 * 2, 'Calculates authoritative subtotal from MongoDB price (2 × 24990 = 49980)');
    assert(createdOrder.shipping === 0, 'Applies complimentary domestic dispatch (₹0)');
    assert(createdOrder.total === 49980, 'Server-calculated final total matches subtotal');
    assert(createdOrder.paymentStatus === 'pending', 'Order is created with pending paymentStatus (ignores client "paid")');
    assert(createdOrder.orderStatus === 'pending', 'Order status defaults to pending');
    assert(createdOrder.items[0].unitPrice === 24990, 'Line item snapshot unitPrice matches authentic database price');
    assert(createdOrder.items[0].name === 'STRUCTURED COLLAPSE COAT', 'Line item snapshot preserves product name');

    // Verify inventory deduction
    const updatedProduct = await Product.findOne({ id: 'prod-001' });
    assert(updatedProduct?.stockCount === initialStock - 2, `Decrements product stock atomically by 2 (${initialStock} -> ${initialStock - 2})`);

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 6: Snapshot Immutability${RESET}`);
    // ------------------------------------------------------------------------

    // Modify product catalogue price and name
    await Product.updateOne(
      { id: 'prod-001' },
      { $set: { price: 99999, name: 'RENAMED ALTERED COAT' } }
    );

    // Retrieve order to confirm snapshot did NOT change
    const resGetSnapshot = await request(app)
      .get(`/api/orders/${createdOrder._id}`)
      .set('Cookie', cookieA);
    assert(resGetSnapshot.status === 200, 'Retrieves order by ID (200)');
    assert(resGetSnapshot.body.order.items[0].unitPrice === 24990, 'Order purchase-time price snapshot remains unchanged at ₹24,990');
    assert(resGetSnapshot.body.order.items[0].name === 'STRUCTURED COLLAPSE COAT', 'Order purchase-time name snapshot remains unchanged');
    assert(resGetSnapshot.body.order.total === 49980, 'Order total remains unchanged at ₹49,980');

    // Restore product price and name for subsequent tests
    await Product.updateOne(
      { id: 'prod-001' },
      { $set: { price: 24990, name: 'STRUCTURED COLLAPSE COAT' } }
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 7: Idempotency & Duplicate Request Protection${RESET}`);
    // ------------------------------------------------------------------------

    const idempotencyKey = 'IDEM-TEST-KEY-001';
    const prod2 = await Product.findOne({ id: 'prod-002' });
    const stockProd2Before = prod2?.stockCount || 10;

    // First submission with idempotency key
    const resIdem1 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-002', size: 'L', color: 'Void Black', quantity: 1 }]
      });
    assert(resIdem1.status === 201, 'First idempotent submission creates order (201)');
    const orderIdemId = resIdem1.body.order?._id;

    // Stock should be decremented by 1
    const prod2AfterFirst = await Product.findOne({ id: 'prod-002' });
    assert(prod2AfterFirst?.stockCount === stockProd2Before - 1, 'Decrements stock for first submission');

    // Duplicate submission with same idempotency key (simulating network retry / double click)
    const resIdem2 = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-002', size: 'L', color: 'Void Black', quantity: 1 }]
      });
    assert(resIdem2.status === 200, 'Duplicate idempotent submission returns 200 OK');
    assert(resIdem2.body.order._id === orderIdemId, 'Returns the exact same order document');

    // Stock should NOT be decremented again
    const prod2AfterSecond = await Product.findOne({ id: 'prod-002' });
    assert(prod2AfterSecond?.stockCount === stockProd2Before - 1, 'Does not re-decrement inventory on idempotent duplicate');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 8: Out-of-Stock & Rollback Integrity${RESET}`);
    // ------------------------------------------------------------------------

    // Set product stockCount to 1
    await Product.updateOne({ id: 'prod-003' }, { $set: { stockCount: 1, inStock: true } });

    // Requesting quantity of 2 should be rejected
    const resOverstock = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [{ productId: 'prod-003', size: 'M', color: 'Pitch Black', quantity: 2 }]
      });
    assert(resOverstock.status === 400, 'Rejects order exceeding available stockCount with 400');

    // Stock should remain at 1
    const prod3Stock = await Product.findOne({ id: 'prod-003' });
    assert(prod3Stock?.stockCount === 1, 'Inventory remains unchanged after rejected overstock order');

    // Multi-item order rollback test:
    // Item 1 has 5 stock. Item 2 has 0 stock (out-of-stock).
    await Product.updateOne({ id: 'prod-004' }, { $set: { stockCount: 5, inStock: true } });
    await Product.updateOne({ id: 'prod-005' }, { $set: { stockCount: 0, inStock: false } });

    const resPartialFail = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        },
        items: [
          { productId: 'prod-004', size: 'M', color: 'Concrete Grey', quantity: 2 },
          { productId: 'prod-005', size: 'M', color: 'Monolith Black', quantity: 1 } // Out of stock!
        ]
      });

    assert(resPartialFail.status === 400, 'Rejects multi-item order when one piece is out of stock (400)');

    // Ensure prod-004 was rolled back and still has exactly 5 stock
    const prod4AfterRollback = await Product.findOne({ id: 'prod-004' });
    assert(prod4AfterRollback?.stockCount === 5, 'Compensates and rolls back stock for earlier items in failed order (still 5)');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 9: Concurrent Stock Protection${RESET}`);
    // ------------------------------------------------------------------------

    // Set prod-006 stockCount to 3
    await Product.updateOne({ id: 'prod-006' }, { $set: { stockCount: 3, inStock: true } });

    // Launch two simultaneous order requests for 2 units each (total 4 > 3).
    // Exactly ONE request must succeed (leaving 1 unit), and ONE request must fail with 400.
    const [concurrent1, concurrent2] = await Promise.all([
      request(app)
        .post('/api/orders')
        .set('Cookie', cookieA)
        .send({
          shippingAddress: {
            fullName: 'Client A',
            addressLine1: '42 Residency Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pinCode: '560001',
            phone: '9876543210'
          },
          items: [{ productId: 'prod-006', size: 'ONE SIZE', color: 'Matte Black', quantity: 2 }]
        }),
      request(app)
        .post('/api/orders')
        .set('Cookie', cookieB)
        .send({
          shippingAddress: {
            fullName: 'Client B',
            addressLine1: '10 Marine Drive',
            city: 'Mumbai',
            state: 'Maharashtra',
            pinCode: '400020',
            phone: '9876543210'
          },
          items: [{ productId: 'prod-006', size: 'ONE SIZE', color: 'Matte Black', quantity: 2 }]
        })
    ]);

    const statuses = [concurrent1.status, concurrent2.status].sort();
    assert(statuses[0] === 201 && statuses[1] === 400, 'One concurrent request succeeds (201) and one fails (400)');

    const prod6Final = await Product.findOne({ id: 'prod-006' });
    assert(prod6Final?.stockCount === 1, 'Inventory reflects exact remaining stock (3 - 2 = 1), preventing overselling');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 10: Data Isolation & Order History${RESET}`);
    // ------------------------------------------------------------------------

    // Client B attempts to read Client A's order by ID
    const resSnoop = await request(app)
      .get(`/api/orders/${createdOrder._id}`)
      .set('Cookie', cookieB);
    assert(resSnoop.status === 404, 'Client B cannot retrieve Client A order (returns 404)');

    // Client A retrieves their own order list
    const resListA = await request(app)
      .get('/api/orders')
      .set('Cookie', cookieA);
    assert(resListA.status === 200, 'Client A retrieves orders list (200)');
    assert(resListA.body.orders.length >= 2, 'Returns Client A orders');
    assert(resListA.body.pagination.totalOrders >= 2, 'Includes pagination metadata');

    // Client B order list
    const resListB = await request(app)
      .get('/api/orders')
      .set('Cookie', cookieB);
    assert(resListB.status === 200, 'Client B retrieves orders list (200)');
    // Client B might have 0 or 1 depending on which concurrent request won
    assert(
      resListB.body.orders.every((o: any) => o.userId !== createdOrder.userId),
      'Client B list contains only their own orders'
    );

    // Retrieve single order by orderNumber
    const resByNumber = await request(app)
      .get(`/api/orders/${createdOrder.orderNumber}`)
      .set('Cookie', cookieA);
    assert(resByNumber.status === 200, 'Can retrieve order by human-readable orderNumber');
    assert(resByNumber.body.order._id === createdOrder._id, 'Retrieved order matches ID');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 11: Cart Cleared on Successful Order${RESET}`);
    // ------------------------------------------------------------------------

    // Add item to Client A cart first
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', cookieA)
      .send({ productId: 'prod-007', size: 'M', color: 'Monolith Black', quantity: 1 });

    const cartBefore = await Cart.findOne({ userId: userARes.body.user.id });
    assert((cartBefore?.items.length || 0) === 1, 'Client A has 1 item in cart');

    // Place order using cart items (no explicit items passed in body)
    const resOrderFromCart = await request(app)
      .post('/api/orders')
      .set('Cookie', cookieA)
      .send({
        shippingAddress: {
          fullName: 'Client A',
          addressLine1: '42 Residency Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pinCode: '560001',
          phone: '9876543210'
        }
      });
    assert(resOrderFromCart.status === 201, 'Creates order directly using active cart items (201)');

    const cartAfter = await Cart.findOne({ userId: userARes.body.user.id });
    assert(cartAfter?.items.length === 0, 'User cart is cleared in MongoDB after confirmed order');

  } catch (error) {
    console.error('Fatal error running orders test suite:', error);
    failed++;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }

  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`ORDERS TEST SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed > 0 ? RED : GREEN}${failed} Failed${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runOrdersTestSuite();
}
