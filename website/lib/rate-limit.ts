/**
 * Rate Limiting Utilities
 * 
 * Simple in-memory rate limiting for authentication endpoints
 * In production, consider using Redis or database-backed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (use Redis in production for distributed systems)
const store = new Map<string, RateLimitEntry>();

// Rate limit configuration
const RATE_LIMITS = {
  auth: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  metrics: { requests: 100, windowMs: 60 * 60 * 1000 }, // 100 requests per hour
} as const;

/**
 * Check if request should be rate limited
 * Returns null if allowed, or retry-after seconds if limited
 */
export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const config = RATE_LIMITS[endpoint];
  const now = Date.now();
  const key = `${endpoint}:${identifier}`;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanExpiredEntries();
  }
  
  const entry = store.get(key);
  
  // No previous requests or window expired
  if (!entry || now > entry.resetTime) {
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.requests - 1,
    };
  }
  
  // Within rate limit
  if (entry.count < config.requests) {
    entry.count++;
    store.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.requests - entry.count,
    };
  }
  
  // Rate limited
  const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
  return {
    allowed: false,
    retryAfter,
    remaining: 0,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanExpiredEntries(): void {
  const now = Date.now();
  
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Get client identifier for rate limiting
 * Uses IP address with fallback to user agent
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (reverse proxy setup)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwardedFor?.split(',')[0]?.trim() || realIp || cfConnectingIp;
  
  if (ip && ip !== 'unknown') {
    return ip;
  }
  
  // Fallback to user agent (less reliable but better than nothing)
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `ua:${userAgent.slice(0, 50)}`; // Truncate to prevent abuse
}

/**
 * Reset rate limit for a specific identifier and endpoint
 * Useful for testing or manual intervention
 */
export function resetRateLimit(identifier: string, endpoint: keyof typeof RATE_LIMITS): void {
  const key = `${endpoint}:${identifier}`;
  store.delete(key);
}

/**
 * Get current rate limit status for an identifier
 * Useful for debugging or monitoring
 */
export function getRateLimitStatus(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS
): { count: number; resetTime: number; remaining: number } | null {
  const config = RATE_LIMITS[endpoint];
  const key = `${endpoint}:${identifier}`;
  const entry = store.get(key);
  
  if (!entry || Date.now() > entry.resetTime) {
    return null;
  }
  
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, config.requests - entry.count),
  };
}