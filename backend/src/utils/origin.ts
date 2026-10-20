/**
 * VOID Origin & URL Normalization Utilities
 *
 * Ensures consistent handling of frontend origins across CORS, CSRF,
 * and security headers. Supports comma-separated allowlists and normalizes
 * trailing slashes and whitespace.
 */

/**
 * Normalizes an origin string by trimming whitespace and trailing slashes.
 * Parses through URL to ensure consistent protocol and host casing.
 */
export function normalizeOrigin(origin: string): string {
  if (!origin) return '';
  const trimmed = origin.trim().replace(/\/+$/, '');
  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    // Fallback for non-standard or partial origin strings
    return trimmed.toLowerCase();
  }
}

/**
 * Parses a comma-separated list of allowed frontend origins from configuration.
 * Returns a Set of normalized origin strings.
 */
export function parseAllowedOrigins(configured?: string): Set<string> {
  const raw = configured !== undefined ? configured : (process.env.FRONTEND_URL || 'http://localhost:5173');
  const allowed = new Set<string>();

  raw.split(',').forEach((item) => {
    const normalized = normalizeOrigin(item);
    if (normalized) {
      allowed.add(normalized);
    }
  });

  // Guarantee fallback if empty string or blank value was provided
  if (allowed.size === 0) {
    allowed.add('http://localhost:5173');
  }

  return allowed;
}

/**
 * Checks whether an incoming request origin is permitted by the allowlist.
 * Returns false if origin is undefined, empty, or not in the allowlist.
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: Set<string>): boolean {
  if (!origin || !origin.trim()) return false;
  const normalized = normalizeOrigin(origin);
  return allowedOrigins.has(normalized);
}
