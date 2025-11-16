#!/usr/bin/env node
/**
 * Auth Diagnostic Script
 * Tests the actual token generation and verification flow
 * to identify exactly where the 401 errors originate
 */

require('dotenv').config({ path: '.env.local' });

console.log('=== AUTH DIAGNOSTIC TEST ===\n');

// Test 1: Environment Variables
console.log('TEST 1: Environment Variables');
console.log('------------------------------');
const hasPasswordHash = !!process.env.ADMIN_PASSWORD_HASH;
const hasSessionSecret = !!process.env.SESSION_SECRET;
const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

console.log(`ADMIN_PASSWORD_HASH: ${hasPasswordHash ? '✅ Set' : '❌ Missing'}`);
if (hasPasswordHash) {
  console.log(`  Length: ${process.env.ADMIN_PASSWORD_HASH.length}`);
  console.log(`  Starts with $2b$12$: ${process.env.ADMIN_PASSWORD_HASH.startsWith('$2b$12$')}`);
}

console.log(`SESSION_SECRET: ${hasSessionSecret ? '✅ Set' : '❌ Missing'}`);
if (hasSessionSecret) {
  console.log(`  Length: ${process.env.SESSION_SECRET.length}`);
  console.log(`  Value: ${process.env.SESSION_SECRET.substring(0, 20)}...`);
}

console.log(`ENCRYPTION_KEY: ${hasEncryptionKey ? '✅ Set' : '❌ Missing'}`);
if (hasEncryptionKey) {
  console.log(`  Length: ${process.env.ENCRYPTION_KEY.length}`);
}

if (!hasSessionSecret || !hasPasswordHash) {
  console.log('\n❌ CRITICAL: Missing environment variables!');
  process.exit(1);
}

// Test 2: Token Generation
console.log('\n\nTEST 2: Token Generation');
console.log('-------------------------');

const crypto = require('crypto');
const HASH_ALGORITHM = 'sha256';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;

function generateToken() {
  const now = Date.now();
  const payload = {
    role: 'admin',
    iat: now,
    exp: now + SESSION_EXPIRY,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac(HASH_ALGORITHM, process.env.SESSION_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

const token = generateToken();
console.log(`Generated Token: ${token}`);
console.log(`Token Length: ${token.length}`);
console.log(`Token Parts: ${token.split('.').length}`);

// Test 3: Token Verification
console.log('\n\nTEST 3: Token Verification');
console.log('---------------------------');

function verifyToken(token) {
  try {
    if (!token || typeof token !== 'string') {
      console.log('  ❌ Token is null or not a string');
      return null;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      console.log(`  ❌ Token has ${parts.length} parts (expected 2)`);
      return null;
    }

    const [payloadBase64, signature] = parts;
    console.log(`  Payload (base64url): ${payloadBase64}`);
    console.log(`  Signature: ${signature}`);

    // Verify signature
    const expectedSignature = crypto
      .createHmac(HASH_ALGORITHM, process.env.SESSION_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    console.log(`  Expected Signature: ${expectedSignature}`);
    console.log(`  Signatures Match: ${signature === expectedSignature ? '✅ YES' : '❌ NO'}`);

    if (signature !== expectedSignature) {
      console.log('  ❌ SIGNATURE MISMATCH - This is the root cause!');
      return null;
    }

    // Parse payload
    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString();
    console.log(`  Decoded Payload: ${payloadJson}`);

    const payload = JSON.parse(payloadJson);
    console.log(`  Role: ${payload.role}`);
    console.log(`  Issued At: ${new Date(payload.iat).toISOString()}`);
    console.log(`  Expires At: ${new Date(payload.exp).toISOString()}`);
    console.log(`  Is Expired: ${Date.now() > payload.exp ? '❌ YES' : '✅ NO'}`);

    if (payload.role !== 'admin') {
      console.log('  ❌ Role is not admin');
      return null;
    }

    console.log('  ✅ Token verification PASSED');
    return { role: payload.role };
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

const result = verifyToken(token);
console.log(`\nVerification Result: ${result ? '✅ VALID' : '❌ INVALID'}`);

// Test 4: Cookie Extraction Simulation
console.log('\n\nTEST 4: Cookie Extraction Simulation');
console.log('--------------------------------------');

// Simulate how the token would be in a cookie
const cookieString = `auth-token=${encodeURIComponent(token)}; Path=/`;
console.log(`Cookie String: ${cookieString}`);

const tokenMatch = cookieString.match(/auth-token=([^;]+)/);
if (tokenMatch) {
  const extractedToken = decodeURIComponent(tokenMatch[1]);
  console.log(`Extracted Token: ${extractedToken}`);
  console.log(`Tokens Match: ${extractedToken === token ? '✅ YES' : '❌ NO'}`);

  if (extractedToken !== token) {
    console.log('  ❌ TOKEN CORRUPTION during cookie extraction!');
    console.log(`  Original: ${token}`);
    console.log(`  Extracted: ${extractedToken}`);
  }
} else {
  console.log('❌ Failed to extract token from cookie');
}

// Test 5: Check for common issues
console.log('\n\nTEST 5: Common Issues Check');
console.log('-----------------------------');

// Check if SESSION_SECRET has quotes in it (common .env mistake)
if (process.env.SESSION_SECRET.includes('"') || process.env.SESSION_SECRET.includes("'")) {
  console.log('❌ SESSION_SECRET contains quote characters - remove quotes from .env.local');
}

// Check if SESSION_SECRET is being truncated
if (process.env.SESSION_SECRET.length < 32) {
  console.log('❌ SESSION_SECRET is too short (< 32 chars)');
}

// Check for trailing whitespace
if (process.env.SESSION_SECRET !== process.env.SESSION_SECRET.trim()) {
  console.log('❌ SESSION_SECRET has trailing/leading whitespace');
}

console.log('✅ All common issues checked');

console.log('\n=== DIAGNOSTIC COMPLETE ===\n');
