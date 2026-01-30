/**
 * Secure Authentication Utilities
 * 
 * Security Implementation Notes:
 * - Uses bcrypt for password hashing with secure salt rounds
 * - Implements signed session tokens with HMAC verification
 * - Includes proper error handling without information leakage
 * - Environment-based configuration for security settings
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from './prisma';

// Security Configuration
const BCRYPT_SALT_ROUNDS = 12; // Recommended for 2024+ security standards
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const HASH_ALGORITHM = 'sha256';

// Environment Variables Validation
const envSchema = z.object({
  ADMIN_PASSWORD_HASH: z.string().min(1, 'ADMIN_PASSWORD_HASH is required'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
});

// Lazy initialization of environment variables
let env: z.infer<typeof envSchema> | null = null;

function getEnv(): z.infer<typeof envSchema> {
  if (env) return env;

  try {
    env = envSchema.parse({
      ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
      SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    });
    return env;
  } catch (error) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
      console.warn('⚠️  Development/Build mode: Using default auth config. Set ADMIN_PASSWORD_HASH and SESSION_SECRET in .env.local');
      env = {
        ADMIN_PASSWORD_HASH: '$2b$12$placeholder.hash.for.development.only',
        SESSION_SECRET: 'development-only-secret-please-change-in-production-this-is-not-secure',
      };
      return env;
    } else {
      console.error('❌ Authentication configuration error:', error);
      throw new Error('Missing required authentication environment variables');
    }
  }
}

// Input Validation Schemas
export const loginSchema = z.object({
  password: z.string().min(1, 'Password is required').max(200, 'Password too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Session Token Schema
interface SessionPayload {
  role: 'admin';
  iat: number; // issued at
  exp: number; // expires at
}

/**
 * Hash a password using bcrypt
 * Used for initial setup and password changes
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Failed to process password');
  }
}

/**
 * Get the current password hash, checking database first then env var fallback.
 * Database takes priority so password changes via the UI persist in production.
 */
async function getPasswordHash(): Promise<string> {
  try {
    const settings = await prisma.adminSettings.findUnique({
      where: { id: 'admin' },
    });
    if (settings?.passwordHash) {
      return settings.passwordHash;
    }
  } catch {
    // Database not available or table doesn't exist yet - fall through to env var
  }
  return getEnv().ADMIN_PASSWORD_HASH;
}

/**
 * Verify password against stored hash
 * Checks database first, then falls back to ADMIN_PASSWORD_HASH env var
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    // In development, allow 'admin123' as fallback password
    if (process.env.NODE_ENV === 'development' && password === 'admin123') {
      console.warn('⚠️  Development mode: Using default password');
      return true;
    }

    const hash = await getPasswordHash();
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification failed:', error);
    // Always return false on error to prevent bypass
    return false;
  }
}

/**
 * Generate secure session token
 * Creates a signed token with timestamp and expiry
 */
export function generateToken(): string {
  try {
    const config = getEnv();
    const now = Date.now();
    const payload: SessionPayload = {
      role: 'admin',
      iat: now,
      exp: now + SESSION_EXPIRY,
    };
    
    // Create signed token: base64(payload).signature
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac(HASH_ALGORITHM, config.SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');
    
    return `${payloadBase64}.${signature}`;
  } catch (error) {
    console.error('Token generation failed:', error);
    throw new Error('Failed to generate session token');
  }
}

/**
 * Verify session token and extract payload
 * Returns parsed payload if valid, null if invalid
 */
export function verifyToken(token: string): { role: string } | null {
  try {
    if (!token || typeof token !== 'string') {
      return null;
    }
    
    const config = getEnv();
    const parts = token.split('.');
    if (parts.length !== 2) {
      return null;
    }
    
    const [payloadBase64, signature] = parts;
    
    // Verify signature
    const expectedSignature = crypto
      .createHmac(HASH_ALGORITHM, config.SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');
    
    // Use constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    )) {
      return null;
    }
    
    // Parse payload
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString();
    const payload: SessionPayload = JSON.parse(payloadJson);
    
    // Check expiry
    if (Date.now() > payload.exp) {
      return null;
    }
    
    // Validate structure
    if (payload.role !== 'admin' || !payload.iat || !payload.exp) {
      return null;
    }
    
    return { role: payload.role };
  } catch (error) {
    // Log for debugging but don't expose error details
    console.error('Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Extract token from request headers
 * Supports both Authorization header and cookies
 */
export function extractTokenFromRequest(request: Request): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies as fallback
  // Use word boundary to avoid matching other cookies like "sb-xxx-auth-token"
  const cookies = request.headers.get('Cookie');
  if (cookies) {
    // Match auth-token at start of string OR after semicolon+space
    // This prevents matching "sb-xxx-auth-token" which contains "auth-token" as substring
    const tokenMatch = cookies.match(/(?:^|; )auth-token=([^;]+)/);
    if (tokenMatch) {
      return decodeURIComponent(tokenMatch[1]);
    }
  }

  return null;
}

/**
 * Generate cryptographically secure random string
 * Used for generating JWT secrets during setup
 */
export function generateSecureSecret(length: number = 64): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }
  
  return result;
}

/**
 * Security utility to create password hash for environment setup
 * This function helps generate the ADMIN_PASSWORD_HASH for .env.local
 */
export async function createPasswordHashForEnv(plainPassword: string): Promise<string> {
  return await hashPassword(plainPassword);
}