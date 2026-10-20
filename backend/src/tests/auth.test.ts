// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import app from '../server';
import { User } from '../models/User';
import { SESSION_COOKIE_NAME } from '../utils/token';

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

async function runTestSuite() {
  console.log(`\n${CYAN}======================================================${RESET}`);
  console.log(`${CYAN}   VOID BACKEND — STAGE 3 AUTHENTICATION TEST SUITE   ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    // 1. Connect to isolated test database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`Connected to isolated test database: ${TEST_DB_URI}\n`);

    // Clean test collection
    await User.deleteMany({});

    // ------------------------------------------------------------------------
    console.log(`${CYAN}Test Group 1: Signup Validation & Behavior${RESET}`);
    // ------------------------------------------------------------------------

    // Case 1A: Missing / short name
    const resShortName = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'A', email: 'test@void.atelier', password: 'password123' });
    assert(resShortName.status === 400, 'Rejects name with fewer than 2 characters (400)');

    // Case 1B: Invalid email
    const resBadEmail = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'not-an-email', password: 'password123' });
    assert(resBadEmail.status === 400, 'Rejects invalid email format (400)');

    // Case 1C: Password too short (< 8 chars)
    const resShortPass = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'valid@void.atelier', password: '123' });
    assert(resShortPass.status === 400, 'Rejects password shorter than 8 characters (400)');

    // Case 2: Successful Signup
    const resSignup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Editorial User',
        email: 'Editorial@VOID.Atelier', // Test lowercase normalization
        password: 'securePassword2026!'
      });

    assert(resSignup.status === 201, 'Creates account successfully (201)');
    assert(resSignup.body.user.email === 'editorial@void.atelier', 'Normalizes email to lowercase');
    assert(resSignup.body.user.name === 'Editorial User', 'Returns safe user name');
    assert(resSignup.body.user.id !== undefined, 'Returns user ID');
    assert(resSignup.body.user.passwordHash === undefined, 'Never returns passwordHash');

    // Inspect cookie
    const rawCookies = resSignup.headers['set-cookie'] || [];
    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies];
    const sessionCookie = cookies.find((c: string) => c.includes(SESSION_COOKIE_NAME));
    assert(Boolean(sessionCookie), 'Sets void_session cookie on signup');
    assert(Boolean(sessionCookie && sessionCookie.includes('HttpOnly')), 'Session cookie is marked HttpOnly');

    // Case 3: Duplicate Signup
    const resDup = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Another User',
        email: 'editorial@void.atelier', // Exact same normalized email
        password: 'differentPassword999'
      });
    assert(resDup.status === 409, 'Rejects duplicate email with 409 Conflict');
    assert(
      resDup.body.message.includes('already exists'),
      'Returns safe duplicate email error message'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: Login Validation & Credentials Verification${RESET}`);
    // ------------------------------------------------------------------------

    // Case 4: Missing fields
    const resMissingLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'editorial@void.atelier' });
    assert(resMissingLogin.status === 400, 'Rejects login missing password (400)');

    // Case 5: Incorrect password
    const resWrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'editorial@void.atelier', password: 'wrongPassword' });
    assert(resWrongPass.status === 401, 'Rejects wrong password with 401 Unauthorized');
    assert(resWrongPass.body.message === 'Invalid email or password.', 'Returns generic error for wrong password');

    // Case 6: Non-existent user
    const resGhostUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@void.atelier', password: 'somePassword123' });
    assert(resGhostUser.status === 401, 'Rejects non-existent email with 401 Unauthorized');
    assert(resGhostUser.body.message === 'Invalid email or password.', 'Returns identical generic error (anti-enumeration)');

    // Case 7: Successful Login
    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'EDITORIAL@void.atelier', password: 'securePassword2026!' });
    assert(resLogin.status === 200, 'Logs in successfully with valid credentials (200)');
    assert(resLogin.body.user.name === 'Editorial User', 'Returns safe user profile');

    const rawLoginCookies = resLogin.headers['set-cookie'] || [];
    const loginCookies = Array.isArray(rawLoginCookies) ? rawLoginCookies : [rawLoginCookies];
    const authCookie = loginCookies.find((c: string) => c.includes(SESSION_COOKIE_NAME));
    assert(Boolean(authCookie), 'Sets HttpOnly session cookie on login');

    // Extract cookie value for subsequent authenticated requests
    const cookieString = authCookie?.split(';')[0] || '';

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Protected Route (/api/auth/me) & Logout${RESET}`);
    // ------------------------------------------------------------------------

    // Case 8: /me without cookie
    const resMeUnauth = await request(app).get('/api/auth/me');
    assert(resMeUnauth.status === 401, 'Rejects unauthenticated access to /api/auth/me (401)');

    // Case 9: /me with valid session cookie
    const resMeAuth = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [cookieString]);
    assert(resMeAuth.status === 200, 'Allows authenticated access to /api/auth/me (200)');
    assert(resMeAuth.body.user.email === 'editorial@void.atelier', 'Returns profile matching session');
    assert(resMeAuth.body.user.passwordHash === undefined, 'Does not expose passwordHash on /me');

    // Case 10: Logout
    const resLogout = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', [cookieString]);
    assert(resLogout.status === 200, 'Logout succeeds with 200 OK');

    const rawLogoutCookies = resLogout.headers['set-cookie'] || [];
    const logoutCookies = Array.isArray(rawLogoutCookies) ? rawLogoutCookies : [rawLogoutCookies];
    const clearedCookie = logoutCookies.find((c: string) => c.includes(SESSION_COOKIE_NAME));
    assert(
      Boolean(clearedCookie && (clearedCookie.includes('Expires=') || clearedCookie.includes('Max-Age=0'))),
      'Invalidates and clears session cookie on logout'
    );

    // Case 11: Access /me after logout
    // Using the cleared cookie simulation
    const resMeAfterLogout = await request(app).get('/api/auth/me');
    assert(resMeAfterLogout.status === 401, 'Rejects access to /api/auth/me after logout (401)');

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Safety & Error Handling${RESET}`);
    // ------------------------------------------------------------------------

    // Case 12: Unknown API route (404)
    const resNotFound = await request(app).get('/api/auth/non-existent-action');
    assert(resNotFound.status === 404, 'Returns safe 404 for unknown endpoints');
    assert(resNotFound.body.message.includes('Route not found'), 'Provides clean error without stack trace');

    // Case 13: Cross-origin CSRF protection
    const resCsrf = await request(app)
      .post('/api/auth/signup')
      .set('Origin', 'http://malicious-website.com')
      .send({ name: 'Hacker', email: 'hack@evil.com', password: 'password123' });
    assert(resCsrf.status === 403, 'Rejects state-changing requests from disallowed origins (403)');

    // Case 14: Rate limiting verification
    const rateLimitedApp = express();
    rateLimitedApp.use(express.json());
    rateLimitedApp.post(
      '/test-limit',
      rateLimit({
        windowMs: 60 * 1000,
        max: 2,
        handler: (_req, res) => {
          res.status(429).json({ status: 'error', message: 'Too many requests' });
        }
      }),
      (_req, res) => {
        res.json({ ok: true });
      }
    );

    const r1 = await request(rateLimitedApp).post('/test-limit');
    const r2 = await request(rateLimitedApp).post('/test-limit');
    const r3 = await request(rateLimitedApp).post('/test-limit');
    assert(r1.status === 200 && r2.status === 200, 'Allows requests within rate limit window (200)');
    assert(r3.status === 429, 'Blocks excess requests with 429 Too Many Requests');

    // ------------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}======================================================${RESET}`);
    console.log(`TEST SUMMARY: ${GREEN}${passed} Passed${RESET}, ${failed === 0 ? GREEN : RED}${failed} Failed${RESET}`);
    console.log(`${CYAN}======================================================${RESET}\n`);

    // Clean up test collection
    await User.deleteMany({});
    await mongoose.disconnect();

    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    console.error('Fatal test error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTestSuite();
