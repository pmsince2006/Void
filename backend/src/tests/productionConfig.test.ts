// Explicitly set test environment before importing server or models
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/void_db_test_suite';

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server';
import { getMongoUri } from '../config/database';
import { normalizeOrigin, parseAllowedOrigins, isOriginAllowed } from '../utils/origin';
import {
  getSessionCookieOptions,
  getClearCookieOptions,
  getBaseCookieOptions,
  resolveCookieSameSite,
  resolveCookieSecure
} from '../utils/token';

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
  console.log(`${CYAN}   VOID BACKEND — STAGE 8B-1 CONFIGURATION TESTS      ${RESET}`);
  console.log(`${CYAN}======================================================${RESET}\n`);

  try {
    // Connect to test database for health check and server-integrated tests
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_DB_URI, { serverSelectionTimeoutMS: 5000 });

    // ------------------------------------------------------------------------
    console.log(`${CYAN}Test Group 1: MongoDB Configuration & Production Guard${RESET}`);
    // ------------------------------------------------------------------------
    const origEnv = process.env.NODE_ENV;
    const origUri = process.env.MONGODB_URI;

    // Case 1A: Production throws fatal error if MONGODB_URI is missing
    process.env.NODE_ENV = 'production';
    delete process.env.MONGODB_URI;
    let thrownError: Error | null = null;
    try {
      getMongoUri();
    } catch (e: any) {
      thrownError = e;
    }
    assert(
      thrownError !== null && thrownError.message.includes('FATAL: MONGODB_URI environment variable is missing'),
      'Throws fatal error in production when MONGODB_URI is missing'
    );

    // Case 1B: Production accepts valid MONGODB_URI
    process.env.MONGODB_URI = 'mongodb+srv://user:pass@cluster.mongodb.net/void_db';
    const prodUri = getMongoUri();
    assert(
      prodUri === 'mongodb+srv://user:pass@cluster.mongodb.net/void_db',
      'Returns configured MONGODB_URI in production'
    );

    // Case 1C: Non-production falls back safely to localhost
    process.env.NODE_ENV = 'development';
    delete process.env.MONGODB_URI;
    const devUri = getMongoUri();
    assert(
      devUri === 'mongodb://127.0.0.1:27017/void_db',
      'Defaults to local database in development when MONGODB_URI is omitted'
    );

    // Restore original env
    process.env.NODE_ENV = origEnv;
    process.env.MONGODB_URI = origUri;

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 2: Origin Normalization & Multi-Origin Allowlist${RESET}`);
    // ------------------------------------------------------------------------

    // Case 2A: Trailing slash and whitespace removal
    assert(
      normalizeOrigin('https://void.atelier/') === 'https://void.atelier',
      'Strips trailing slashes from origin'
    );
    assert(
      normalizeOrigin('  https://void.atelier///  ') === 'https://void.atelier',
      'Trims whitespace and multiple trailing slashes'
    );
    assert(
      normalizeOrigin('https://VOID.ATELIER') === 'https://void.atelier',
      'Normalizes hostname to lowercase'
    );

    // Case 2B: Parsing comma-separated origins
    const allowed = parseAllowedOrigins(
      'https://void.atelier, https://www.void.atelier/, http://localhost:5173  '
    );
    assert(allowed.size === 3, 'Parses all comma-separated origins into set');
    assert(allowed.has('https://void.atelier'), 'Contains normalized apex origin');
    assert(allowed.has('https://www.void.atelier'), 'Contains normalized www origin without trailing slash');
    assert(allowed.has('http://localhost:5173'), 'Contains local development origin');

    // Case 2C: Empty fallback
    const fallbackOrigins = parseAllowedOrigins('  , , ');
    assert(
      fallbackOrigins.has('http://localhost:5173'),
      'Falls back to default localhost origin if configured string is empty'
    );

    // Case 2D: Origin validation
    assert(
      isOriginAllowed('https://void.atelier', allowed),
      'Permits exact match in allowlist'
    );
    assert(
      isOriginAllowed('https://www.void.atelier/', allowed),
      'Permits incoming origin with trailing slash by normalizing'
    );
    assert(
      !isOriginAllowed('https://evil-spoof.com', allowed),
      'Rejects origin not present in allowlist'
    );
    assert(
      !isOriginAllowed(undefined, allowed),
      'Returns false for undefined origin'
    );
    assert(
      !isOriginAllowed('', allowed),
      'Returns false for empty origin string'
    );

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 3: Server CORS and CSRF Protection Behavior${RESET}`);
    // ------------------------------------------------------------------------
    const origFrontendUrl = process.env.FRONTEND_URL;
    process.env.FRONTEND_URL = 'https://void.atelier, https://www.void.atelier, http://localhost:5173';

    // Case 3A: Permitted origin in CORS preflight
    const resCorsApproved = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://void.atelier')
      .set('Access-Control-Request-Method', 'POST');
    assert(
      resCorsApproved.headers['access-control-allow-origin'] === 'https://void.atelier',
      'Allows preflight request from approved primary origin'
    );
    assert(
      resCorsApproved.headers['access-control-allow-credentials'] === 'true',
      'Reflects credential allowance for approved origin'
    );

    // Case 3B: Secondary permitted origin (www)
    const resCorsSecondary = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'https://www.void.atelier')
      .set('Access-Control-Request-Method', 'POST');
    assert(
      resCorsSecondary.headers['access-control-allow-origin'] === 'https://www.void.atelier',
      'Allows preflight request from secondary allowed origin'
    );

    // Case 3C: Unapproved origin rejected by CORS
    const resCorsRejected = await request(app)
      .get('/api/health')
      .set('Origin', 'https://malicious-site.com');
    assert(
      resCorsRejected.status === 403,
      'Rejects unapproved origin with 403 Forbidden'
    );
    assert(
      resCorsRejected.body.message.includes('Blocked by CORS policy'),
      'Returns clean CORS rejection message'
    );

    // Case 3D: State-changing request with unapproved origin rejected by CSRF
    const resCsrfRejected = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://unauthorized-attacker.org');
    assert(
      resCsrfRejected.status === 403,
      'Rejects state-changing POST from unapproved origin (403)'
    );

    // Case 3E: State-changing request with approved origin passes CSRF guard
    const resCsrfApproved = await request(app)
      .post('/api/auth/logout')
      .set('Origin', 'https://void.atelier');
    assert(
      resCsrfApproved.status === 200,
      'Allows state-changing POST from approved frontend origin through CSRF guard (200)'
    );

    // Case 3F: Server-to-server request (no Origin header) passes through
    const resNoOrigin = await request(app).get('/api/health');
    assert(
      resNoOrigin.status === 200,
      'Permits legitimate requests without Origin header (server-to-server / curl)'
    );

    // Restore FRONTEND_URL
    process.env.FRONTEND_URL = origFrontendUrl;

    // ------------------------------------------------------------------------
    console.log(`\n${CYAN}Test Group 4: Cookie Attributes & Clearing Consistency${RESET}`);
    // ------------------------------------------------------------------------
    const origSameSite = process.env.COOKIE_SAME_SITE;
    const origSecure = process.env.COOKIE_SECURE;
    const origDomain = process.env.COOKIE_DOMAIN;

    // Case 4A: Default settings
    delete process.env.COOKIE_SAME_SITE;
    delete process.env.COOKIE_SECURE;
    delete process.env.COOKIE_DOMAIN;

    const baseOpts = getBaseCookieOptions();
    assert(baseOpts.httpOnly === true, 'Enforces HttpOnly flag on cookies');
    assert(baseOpts.path === '/', 'Enforces root path on cookies');
    assert(baseOpts.sameSite === 'lax', 'Defaults SameSite to lax');
    assert(baseOpts.domain === undefined, 'Omits domain by default for host-only cookies');

    // Case 4B: Session vs Clear cookie attribute consistency
    const sessionOpts = getSessionCookieOptions();
    const clearOpts = getClearCookieOptions();

    assert(sessionOpts.httpOnly === clearOpts.httpOnly, 'HttpOnly matches between issue and clear');
    assert(sessionOpts.secure === clearOpts.secure, 'Secure flag matches between issue and clear');
    assert(sessionOpts.sameSite === clearOpts.sameSite, 'SameSite matches between issue and clear');
    assert(sessionOpts.path === clearOpts.path, 'Path matches between issue and clear');
    assert(sessionOpts.domain === clearOpts.domain, 'Domain matches between issue and clear');
    assert(typeof sessionOpts.maxAge === 'number' && sessionOpts.maxAge > 0, 'Session cookie specifies maxAge');
    assert(clearOpts.maxAge === undefined, 'Clear cookie omits maxAge for browser deletion');

    // Case 4C: SameSite=None enforces Secure=true
    process.env.COOKIE_SAME_SITE = 'none';
    const sameSiteVal = resolveCookieSameSite();
    const secureVal = resolveCookieSecure(false, sameSiteVal);
    assert(sameSiteVal === 'none', 'Resolves configured SameSite=none');
    assert(secureVal === true, 'Enforces Secure=true when SameSite=none even in non-production');

    // Case 4D: Configurable cookie domain
    process.env.COOKIE_DOMAIN = '.void.atelier';
    const domainOpts = getBaseCookieOptions();
    assert(
      domainOpts.domain === '.void.atelier',
      'Applies configured root domain to cookie options'
    );
    assert(
      getClearCookieOptions().domain === '.void.atelier',
      'Clear cookie matches configured root domain'
    );

    // Restore env vars
    process.env.COOKIE_SAME_SITE = origSameSite;
    process.env.COOKIE_SECURE = origSecure;
    process.env.COOKIE_DOMAIN = origDomain;

    // Disconnect test database
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

runTestSuite();
