import jwt, { SignOptions } from 'jsonwebtoken';
import { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'void_session';

export interface TokenPayload {
  userId: string;
  email: string;
}

export type CookieSameSiteOption = 'lax' | 'strict' | 'none';

/**
 * Retrieve the JWT signing secret from environment.
 * Enforces security in production.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    // Safe deterministic development secret (never used in production)
    return 'void_dev_insecure_jwt_secret_do_not_use_in_production_key';
  }
  return secret;
}

/**
 * Generates a signed, tamper-proof JSON Web Token.
 */
export function generateToken(payload: TokenPayload): string {
  const secret = getJwtSecret();
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256'
  });
}

/**
 * Verifies a JWT token. Returns the payload or null if invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256']
    }) as TokenPayload;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Resolves the configured SameSite cookie attribute.
 * Defaults to 'lax' for robust CSRF protection, but allows 'strict' or 'none' if configured.
 */
export function resolveCookieSameSite(): CookieSameSiteOption {
  const envVal = process.env.COOKIE_SAME_SITE?.toLowerCase().trim();
  if (envVal === 'none' || envVal === 'strict' || envVal === 'lax') {
    return envVal;
  }
  return 'lax';
}

/**
 * Resolves whether the cookie must enforce the Secure flag (HTTPS).
 * Browsers strictly require Secure=true if SameSite=None.
 */
export function resolveCookieSecure(isProduction: boolean, sameSite: CookieSameSiteOption): boolean {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE.toLowerCase().trim() === 'true';
  }
  // SameSite=None strictly requires Secure=true in all modern browsers
  if (sameSite === 'none') {
    return true;
  }
  return isProduction;
}

/**
 * Base cookie options shared identically between setting and clearing cookies.
 * Ensures consistent attributes (path, domain, sameSite, secure, httpOnly).
 */
export function getBaseCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = resolveCookieSameSite();
  const secure = resolveCookieSecure(isProduction, sameSite);

  const options: CookieOptions = {
    httpOnly: true, // Inaccessible to browser JavaScript (anti-XSS)
    secure,
    sameSite,
    path: '/'
  };

  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (domain) {
    options.domain = domain;
  }

  return options;
}

/**
 * Returns hardened cookie configuration options for issuing sessions.
 */
export function getSessionCookieOptions(): CookieOptions {
  return {
    ...getBaseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
}

/**
 * Options for clearing session cookie.
 * Matches getSessionCookieOptions attributes (path, domain, secure, sameSite, httpOnly)
 * while omitting maxAge to instruct browser deletion.
 */
export function getClearCookieOptions(): CookieOptions {
  return getBaseCookieOptions();
}
