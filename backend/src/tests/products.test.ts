// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { Product } from '../models/Product';
import { CollectionModel } from '../models/Collection';
import { seedCatalogue } from '../scripts/seedProducts';

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

async function runProductTestSuite() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}   VOID BACKEND — STAGE 5B PRODUCT & CATALOGUE TESTS  ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to isolated test database: ${TEST_DB_URI}\n`);

    // Clean test catalogue and seed authentic items
    await Product.deleteMany({});
    await CollectionModel.deleteMany({});
    await seedCatalogue();

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 1: Catalogue Retrieval & Category Filtering${RESET}`);
    // ------------------------------------------------------------------------

    // Case 1: List all products
    const resAll = await request(app).get('/api/products');
    assert(resAll.status === 200, 'GET /api/products returns 200 OK');
    assert(resAll.body.count === 8, 'Returns exactly 8 catalogue pieces');
    assert(Array.isArray(resAll.body.products), 'Returns products array');
    assert(resAll.body.products[0].id !== undefined, 'Products contain stable id field');

    // Case 2: Filter Uppers
    const resUppers = await request(app).get('/api/products?category=uppers');
    assert(resUppers.status === 200, 'GET /api/products?category=uppers returns 200');
    assert(
      resUppers.body.products.every((p: any) => p.category === 'uppers'),
      'All filtered products belong to "uppers" category'
    );
    assert(resUppers.body.count === 6, 'Contains 6 upper garments');

    // Case 3: Filter Bottoms
    const resBottoms = await request(app).get('/api/products?category=bottoms');
    assert(resBottoms.status === 200, 'GET /api/products?category=bottoms returns 200');
    assert(
      resBottoms.body.products.every((p: any) => p.category === 'bottoms'),
      'All filtered products belong to "bottoms" category'
    );
    assert(resBottoms.body.count === 1, 'Contains 1 bottom piece');

    // Case 4: Filter Shoes (currently 0 in drop 01)
    const resShoes = await request(app).get('/api/products?category=shoes');
    assert(resShoes.status === 200, 'GET /api/products?category=shoes returns 200');
    assert(resShoes.body.count === 0, 'Returns 0 items for empty shoes category');

    // Case 5: Filter Accessories
    const resAcc = await request(app).get('/api/products?category=accessories');
    assert(resAcc.status === 200, 'GET /api/products?category=accessories returns 200');
    assert(
      resAcc.body.products.every((p: any) => p.category === 'accessories'),
      'All filtered products belong to "accessories" category'
    );
    assert(resAcc.body.count === 1, 'Contains 1 accessory');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: Search, Price Bounds & Sorting${RESET}`);
    // ------------------------------------------------------------------------

    // Case 6: Search by keyword
    const resSearch = await request(app).get('/api/products?search=parka');
    assert(resSearch.status === 200, 'Search returns 200 OK');
    assert(
      resSearch.body.products.some((p: any) => p.name.includes('PARKA')),
      'Search matches "BALLISTIC MONOLITH PARKA"'
    );

    // Case 7: Price ascending sort
    const resSortAsc = await request(app).get('/api/products?sort=price-asc');
    assert(resSortAsc.status === 200, 'Price-asc sort returns 200 OK');
    const pricesAsc = resSortAsc.body.products.map((p: any) => p.price);
    const isAscending = pricesAsc.every((v: number, i: number) => i === 0 || v >= pricesAsc[i - 1]);
    assert(isAscending, 'Products sorted in ascending order of price');

    // Case 8: Price descending sort
    const resSortDesc = await request(app).get('/api/products?sort=price-desc');
    assert(resSortDesc.status === 200, 'Price-desc sort returns 200 OK');
    const pricesDesc = resSortDesc.body.products.map((p: any) => p.price);
    const isDescending = pricesDesc.every((v: number, i: number) => i === 0 || v <= pricesDesc[i - 1]);
    assert(isDescending, 'Products sorted in descending order of price');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Product by Slug & Unknown Handling${RESET}`);
    // ------------------------------------------------------------------------

    // Case 9: Valid Slug
    const resSlug = await request(app).get('/api/products/structured-collapse-coat');
    assert(resSlug.status === 200, 'GET /api/products/:slug returns 200 for valid slug');
    assert(resSlug.body.product.name === 'STRUCTURED COLLAPSE COAT', 'Returns matching product details');
    assert(resSlug.body.product.id === 'prod-001', 'Preserves stable product id "prod-001"');
    assert(Array.isArray(resSlug.body.product.images), 'Images is an array');
    assert(Array.isArray(resSlug.body.product.sizes), 'Sizes is an array');
    assert(Array.isArray(resSlug.body.product.colors), 'Colors is an array');

    // Case 10: Unknown Slug (404)
    const resUnknown = await request(app).get('/api/products/unknown-piece-slug-xyz');
    assert(resUnknown.status === 404, 'Returns 404 for unknown slug');
    assert(resUnknown.body.message.includes('not found'), 'Returns clean archive not-found message');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Collections & Query Safety${RESET}`);
    // ------------------------------------------------------------------------

    // Case 11: Collections list
    const resCollections = await request(app).get('/api/collections');
    assert(resCollections.status === 200, 'GET /api/collections returns 200 OK');
    assert(resCollections.body.count === 4, 'Returns exactly 4 curated collections');
    assert(
      resCollections.body.collections.every((c: any) => typeof c.itemCount === 'number'),
      'Each collection includes valid itemCount'
    );

    // Case 12: Query safety with non-numeric price parameters
    const resSafeQuery = await request(app).get('/api/products?minPrice=invalid&maxPrice=xyz');
    assert(resSafeQuery.status === 200, 'Safely ignores invalid numeric query parameters without crashing');
    assert(resSafeQuery.body.count === 8, 'Returns full catalogue when bounds are unparseable');

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}======================================================${RESET}`);
    console.log(`PRODUCT TEST SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed === 0 ? GREEN : RED}${failed} Failed${RESET}`);
    console.log(`${CYAN}======================================================${RESET}\n`);

    // Clean test collection
    await Product.deleteMany({});
    await CollectionModel.deleteMany({});
    await mongoose.disconnect();

    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Fatal product test error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runProductTestSuite();
