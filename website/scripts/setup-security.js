/**
 * Security Setup Script
 * 
 * Generates secure environment variables for production deployment:
 * - ADMIN_PASSWORD_HASH (bcrypt hash of admin password)
 * - JWT_SECRET (cryptographically secure random string)
 * 
 * Usage:
 *   node scripts/setup-security.js [admin_password]
 * 
 * If no password provided, prompts for secure password creation.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const readline = require('readline');

const BCRYPT_SALT_ROUNDS = 12;

function generateSecureSecret(length = 64) {
  return crypto.randomBytes(length).toString('base64url');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.stdoutMuted = true;
    rl.question('Enter admin password (will be hidden): ', (password) => {
      rl.close();
      console.log(''); // New line after hidden input
      resolve(password);
    });
    
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*');
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });
}

function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
}

async function main() {
  console.log('🔐 AGENT-11 Security Setup');
  console.log('================================');
  console.log('');
  
  try {
    let password;
    
    // Get password from command line or prompt
    if (process.argv[2]) {
      password = process.argv[2];
      console.log('Using password from command line argument');
    } else {
      console.log('No password provided. Creating secure admin password...');
      password = await promptPassword();
    }
    
    // Validate password strength
    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      console.error('❌ Password does not meet security requirements:');
      validationErrors.forEach(error => console.error(`   • ${error}`));
      process.exit(1);
    }
    
    console.log('✅ Password meets security requirements');
    console.log('');
    
    // Generate secure values
    console.log('Generating secure values...');
    const passwordHash = await hashPassword(password);
    const jwtSecret = generateSecureSecret();
    
    console.log('✅ Password hash generated with bcrypt');
    console.log('✅ JWT secret generated (64 random bytes)');
    console.log('');
    
    // Output environment variables
    console.log('📋 Add these to your .env.local file:');
    console.log('=================================');
    console.log('');
    console.log(`ADMIN_PASSWORD_HASH="${passwordHash}"`);
    console.log(`SESSION_SECRET="${jwtSecret}"`);
    console.log('');
    
    // Security instructions
    console.log('🛡️  Security Instructions:');
    console.log('=========================');
    console.log('1. Add these variables to .env.local (development)');
    console.log('2. Add these to your production environment variables');
    console.log('3. Never commit .env.local to version control');
    console.log('4. Store the plain text password securely (password manager)');
    console.log('5. Rotate SESSION_SECRET periodically for security');
    console.log('');
    
    // Deployment checklist
    console.log('✅ Deployment Security Checklist:');
    console.log('=================================');
    console.log('□ Environment variables configured');
    console.log('□ HTTPS enabled in production');
    console.log('□ CSP headers configured');
    console.log('□ Rate limiting enabled');
    console.log('□ Security monitoring in place');
    console.log('□ Regular security audits scheduled');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateSecureSecret, hashPassword, validatePassword };