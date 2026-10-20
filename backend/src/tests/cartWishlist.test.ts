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

async function runCartWishlistTestSuite() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}   VOID BACKEND — STAGE 6A CART & WISHLIST TESTS      ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to isolated test database: ${TEST_DB_URI}\n`);

    // Clean test database and re-seed
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Product.deleteMany({});
    await seedCatalogue();

    // ------------------------------------------------------------------------
    console.log(`${CYAN}Test Group 1: Unauthenticated Rejections (401)${RESET}`);
    // ------------------------------------------------------------------------

    const resCartNoAuth = await request(app).get('/api/cart');
    assert(resCartNoAuth.status === 401, 'Rejects unauthenticated GET /api/cart with 401');

    const resAddNoAuth = await request(app)
      .post('/api/cart/items')
      .send({ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 });
    assert(resAddNoAuth.status === 401, 'Rejects unauthenticated POST /api/cart/items with 401');

    const resWishNoAuth = await request(app).get('/api/wishlist');
    assert(resWishNoAuth.status === 401, 'Rejects unauthenticated GET /api/wishlist with 401');

    const resWishToggleNoAuth = await request(app)
      .post('/api/wishlist/toggle')
      .send({ productId: 'prod-001' });
    assert(resWishToggleNoAuth.status === 401, 'Rejects unauthenticated POST /api/wishlist/toggle with 401');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: User Setup & Session Provisioning${RESET}`);
    // ------------------------------------------------------------------------

    // Register User A
    const resUserA = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User A', email: 'userA@void.atelier', password: 'password1234' });
    assert(resUserA.status === 201, 'Registered User A');
    const rawCookiesA = resUserA.headers['set-cookie'] || [];
    const cookiesA = Array.isArray(rawCookiesA) ? rawCookiesA : [rawCookiesA];
    const cookieA = cookiesA.find((c: string) => c.includes(SESSION_COOKIE_NAME))?.split(';')[0] || '';

    // Register User B
    const resUserB = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'User B', email: 'userB@void.atelier', password: 'password1234' });
    assert(resUserB.status === 201, 'Registered User B');
    const rawCookiesB = resUserB.headers['set-cookie'] || [];
    const cookiesB = Array.isArray(rawCookiesB) ? rawCookiesB : [rawCookiesB];
    const cookieB = cookiesB.find((c: string) => c.includes(SESSION_COOKIE_NAME))?.split(';')[0] || '';

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Cart Mutations & Trusted Price Calculation${RESET}`);
    // ------------------------------------------------------------------------

    // Add piece as User A, attempting to inject a malicious client price
    const resAddA = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({
        productId: 'prod-001',
        size: 'M',
        color: 'Monolith Black',
        quantity: 1,
        price: 1 // Malicious client price injection attempt
      });

    assert(resAddA.status === 200, 'User A adds item to bag (200)');
    assert(resAddA.body.cart.totalCount === 1, 'Total count is 1');
    assert(resAddA.body.cart.subtotal === 24990, 'Server uses authentic DB price (₹24,990), ignoring client price (₹1)');
    assert(resAddA.body.cart.items[0].product.name === 'STRUCTURED COLLAPSE COAT', 'Populates product details');
    assert(resAddA.body.cart.items[0].id === 'prod-001-M-Monolith Black', 'Emits composite variant ID');

    // Increment same variant by adding again
    const resIncA = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({
        productId: 'prod-001',
        size: 'M',
        color: 'Monolith Black',
        quantity: 1
      });

    assert(resIncA.status === 200, 'Adding same variant increments quantity');
    assert(resIncA.body.cart.items.length === 1, 'Does not create duplicate line item');
    assert(resIncA.body.cart.items[0].quantity === 2, 'Variant quantity incremented to 2');
    assert(resIncA.body.cart.subtotal === 49980, 'Subtotal correctly updated to 2 × ₹24,990');

    // Update quantity via PUT
    const resPutA = await request(app)
      .put('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({
        id: 'prod-001-M-Monolith Black',
        quantity: 3
      });

    assert(resPutA.status === 200, 'PUT /api/cart/items updates quantity');
    assert(resPutA.body.cart.items[0].quantity === 3, 'Variant quantity updated to 3');
    assert(resPutA.body.cart.subtotal === 74970, 'Subtotal updated to 3 × ₹24,990');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Data Isolation Between Accounts${RESET}`);
    // ------------------------------------------------------------------------

    // User B fetches their own cart
    const resCartB = await request(app)
      .get('/api/cart')
      .set('Cookie', [cookieB]);

    assert(resCartB.status === 200, 'User B retrieves cart');
    assert(resCartB.body.cart.items.length === 0, 'User B cart is completely empty (isolated from User A)');
    assert(resCartB.body.cart.totalCount === 0, 'User B totalCount is 0');

    // User B adds a different piece
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieB])
      .send({ productId: 'prod-002', size: 'L', color: 'Void Black', quantity: 1 });

    // Verify User A cart is unchanged
    const resCheckA = await request(app)
      .get('/api/cart')
      .set('Cookie', [cookieA]);
    assert(resCheckA.body.cart.items.length === 1, 'User A cart still contains only their own piece');
    assert(resCheckA.body.cart.items[0].productId === 'prod-001', 'User A piece remains prod-001');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 5: Validation & Guard Rails${RESET}`);
    // ------------------------------------------------------------------------

    // Unknown product ID
    const resBadProd = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-999', size: 'M', color: 'Black', quantity: 1 });
    assert(resBadProd.status === 404, 'Rejects non-existent product ID with 404');

    // Invalid size
    const resBadSize = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001', size: 'XXXL', color: 'Monolith Black', quantity: 1 });
    assert(resBadSize.status === 400, 'Rejects invalid size for piece with 400');
    assert(resBadSize.body.message.includes('Invalid size'), 'Returns descriptive size error');

    // Invalid color
    const resBadColor = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001', size: 'M', color: 'Neon Yellow', quantity: 1 });
    assert(resBadColor.status === 400, 'Rejects invalid color for piece with 400');

    // Invalid quantity
    const resBadQty = await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: -5 });
    assert(resBadQty.status === 400, 'Rejects invalid negative quantity with 400');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 6: Cart Item Removal & Clear${RESET}`);
    // ------------------------------------------------------------------------

    // Remove single variant via DELETE /api/cart/items/:id
    const resRemoveA = await request(app)
      .delete('/api/cart/items/prod-001-M-Monolith Black')
      .set('Cookie', [cookieA]);
    assert(resRemoveA.status === 200, 'Removes variant via composite ID');
    assert(resRemoveA.body.cart.items.length === 0, 'Cart is now empty after removing variant');

    // Add back an item then clear cart completely
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-003', size: 'S', color: 'Pitch Black', quantity: 2 });

    const resClearA = await request(app)
      .delete('/api/cart')
      .set('Cookie', [cookieA]);
    assert(resClearA.status === 200, 'DELETE /api/cart clears cart');
    assert(resClearA.body.cart.items.length === 0, 'Cart items cleared');
    assert(resClearA.body.cart.totalCount === 0, 'totalCount reset to 0');
    assert(resClearA.body.cart.subtotal === 0, 'subtotal reset to 0');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 7: Guest Cart Merging (Assimilating LocalStorage)${RESET}`);
    // ------------------------------------------------------------------------

    // Seed User A with existing piece in DB
    await request(app)
      .post('/api/cart/items')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 1 });

    // Guest cart has:
    // 1. Matching variant: prod-001, M, Monolith Black, qty 2 -> should combine to qty 3
    // 2. New variant: prod-002, L, Void Black, qty 1
    const resMerge = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', [cookieA])
      .send({
        items: [
          { productId: 'prod-001', size: 'M', color: 'Monolith Black', quantity: 2 },
          { productId: 'prod-002', size: 'L', color: 'Void Black', quantity: 1 }
        ]
      });

    assert(resMerge.status === 200, 'Guest merge succeeds with 200');
    assert(resMerge.body.cart.items.length === 2, 'Cart has exactly 2 distinct variants (no duplicate lines)');
    const mergedVariant001 = resMerge.body.cart.items.find((i: any) => i.productId === 'prod-001');
    assert(mergedVariant001?.quantity === 3, 'Combined quantities for matching variant (1 + 2 = 3)');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 8: Wishlist Toggle & Merging${RESET}`);
    // ------------------------------------------------------------------------

    // User A toggles prod-001 into wishlist
    const resWishAdd = await request(app)
      .post('/api/wishlist/toggle')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001' });

    assert(resWishAdd.status === 200, 'Toggle wishlist returns 200');
    assert(resWishAdd.body.action === 'added', 'Reports item added');
    assert(resWishAdd.body.wishlist.totalCount === 1, 'Wishlist count is 1');
    assert(resWishAdd.body.wishlist.items[0].product.name === 'STRUCTURED COLLAPSE COAT', 'Populates product details');

    // Toggle same piece again -> should remove
    const resWishRemove = await request(app)
      .post('/api/wishlist/toggle')
      .set('Cookie', [cookieA])
      .send({ productId: 'prod-001' });

    assert(resWishRemove.status === 200, 'Second toggle returns 200');
    assert(resWishRemove.body.action === 'removed', 'Reports item removed');
    assert(resWishRemove.body.wishlist.totalCount === 0, 'Wishlist count is now 0');

    // Merge guest wishlist with duplicate IDs
    const resWishMerge = await request(app)
      .post('/api/wishlist/merge')
      .set('Cookie', [cookieA])
      .send({
        productIds: ['prod-001', 'prod-002', 'prod-001', 'prod-003'] // Contains duplicate 'prod-001'
      });

    assert(resWishMerge.status === 200, 'Wishlist merge returns 200');
    assert(resWishMerge.body.wishlist.totalCount === 3, 'Deduplicates incoming items (exact count: 3)');

    // Repeat identical merge request (idempotency check)
    const resWishMergeRepeat = await request(app)
      .post('/api/wishlist/merge')
      .set('Cookie', [cookieA])
      .send({
        productIds: ['prod-001', 'prod-002']
      });

    assert(resWishMergeRepeat.body.wishlist.totalCount === 3, 'Repeated merge does not duplicate existing items');

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}======================================================${RESET}`);
    console.log(`CART & WISHLIST TEST SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed === 0 ? GREEN : RED}${failed} Failed${RESET}`);
    console.log(`${CYAN}======================================================${RESET}\n`);

    // Clean test collection
    await User.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await mongoose.disconnect();

    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Fatal cart/wishlist test error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runCartWishlistTestSuite();
