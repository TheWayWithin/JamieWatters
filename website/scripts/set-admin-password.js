#!/usr/bin/env node

/**
 * Set Admin Password
 *
 * Generates a bcrypt hash for a new admin password.
 * Usage: node scripts/set-admin-password.js <your-password>
 */

const bcrypt = require('bcrypt');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password');
  console.error('');
  console.error('Usage:');
  console.error('  node scripts/set-admin-password.js <your-password>');
  console.error('');
  console.error('Example:');
  console.error('  node scripts/set-admin-password.js mySecurePassword123');
  process.exit(1);
}

// Generate bcrypt hash
const saltRounds = 10;
bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }

  console.log('');
  console.log('✅ Password hash generated successfully!');
  console.log('');
  console.log('Add this line to your .env.local file:');
  console.log('');
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log('');
  console.log('Then restart your dev server.');
  console.log('');
});
