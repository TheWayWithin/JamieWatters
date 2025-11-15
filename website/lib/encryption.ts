/**
 * Token Encryption Utilities
 *
 * Security Implementation:
 * - Uses AES-256-GCM for authenticated encryption
 * - Uses SESSION_SECRET as encryption key (already in environment)
 * - Includes authentication tag to prevent tampering
 * - Random IV for each encryption operation
 *
 * Critical Security Principles:
 * - NEVER log or expose encrypted tokens
 * - NEVER return decrypted tokens in API responses
 * - ALWAYS validate token format before operations
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Derive a 32-byte key from SESSION_SECRET using PBKDF2
 * This ensures we have a proper key length for AES-256
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Development mode: Using default encryption key');
      return crypto.scryptSync('development-key-not-secure', 'salt', KEY_LENGTH);
    }
    throw new Error('SESSION_SECRET environment variable is required for encryption');
  }

  // Derive a proper 32-byte key from SESSION_SECRET
  // Using scrypt for key derivation (more secure than simple hashing)
  return crypto.scryptSync(secret, 'github-token-encryption-salt', KEY_LENGTH);
}

/**
 * Encrypt a GitHub token
 *
 * @param token - Plain text GitHub token (e.g., ghp_xxxxx)
 * @returns Encrypted string in format: iv:authTag:encrypted
 *
 * Security: Each encryption uses a random IV for semantic security
 */
export function encryptToken(token: string): string {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }

    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return format: iv:authTag:encrypted (all in hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Token encryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a GitHub token
 *
 * @param encryptedData - Encrypted token in format: iv:authTag:encrypted
 * @returns Decrypted plain text token
 *
 * Security: Verifies authentication tag to ensure data integrity
 */
export function decryptToken(encryptedData: string): string {
  try {
    if (!encryptedData || typeof encryptedData !== 'string') {
      throw new Error('Encrypted data must be a non-empty string');
    }

    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Token decryption failed:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Validate GitHub token format
 * Supports both classic (ghp_) and fine-grained (github_pat_) tokens
 *
 * @param token - Token to validate
 * @returns true if format is valid
 */
export function isValidGitHubTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Classic tokens: ghp_[A-Za-z0-9]{36}
  // Fine-grained tokens: github_pat_[A-Za-z0-9_]{82}
  const classicPattern = /^ghp_[A-Za-z0-9]{36}$/;
  const fineGrainedPattern = /^github_pat_[A-Za-z0-9_]{82}$/;

  return classicPattern.test(token) || fineGrainedPattern.test(token);
}

/**
 * Sanitize token for logging (show only first/last 4 characters)
 * Used for debug logging without exposing the actual token
 *
 * @param token - Token to sanitize
 * @returns Sanitized string like "ghp_****...****1234"
 */
export function sanitizeToken(token: string): string {
  if (!token || token.length < 12) {
    return '****';
  }

  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}****...****${suffix}`;
}
