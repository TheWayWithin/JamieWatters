#!/usr/bin/env node

/**
 * Admin Password Reset Script
 *
 * Generates a bcrypt hash for a new admin password.
 * Updates the .env file with the new hash.
 *
 * Usage: node scripts/reset-admin-password.js
 */

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 Admin Password Reset\n');

  // Get new password from user
  const password = await question('Enter new admin password: ');

  if (!password || password.length < 8) {
    console.error('\n❌ Password must be at least 8 characters long');
    rl.close();
    process.exit(1);
  }

  const confirmPassword = await question('Confirm password: ');

  if (password !== confirmPassword) {
    console.error('\n❌ Passwords do not match');
    rl.close();
    process.exit(1);
  }

  console.log('\n⏳ Generating secure password hash...');

  // Generate bcrypt hash (cost factor: 12)
  const hash = await bcrypt.hash(password, 12);

  console.log('\n✅ Password hash generated successfully!\n');
  console.log('Hash:', hash);

  // Update .env file
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');

  const updateChoice = await question('\nUpdate .env files automatically? (y/n): ');

  if (updateChoice.toLowerCase() === 'y') {
    try {
      // Update .env
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (envContent.includes('ADMIN_PASSWORD_HASH=')) {
          // Replace existing hash
          envContent = envContent.replace(
            /ADMIN_PASSWORD_HASH=.*/,
            `ADMIN_PASSWORD_HASH="${hash}"`
          );
        } else {
          // Add new hash
          envContent += `\nADMIN_PASSWORD_HASH="${hash}"\n`;
        }

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Updated .env');
      }

      // Update .env.local
      if (fs.existsSync(envLocalPath)) {
        let envLocalContent = fs.readFileSync(envLocalPath, 'utf8');

        if (envLocalContent.includes('ADMIN_PASSWORD_HASH=')) {
          envLocalContent = envLocalContent.replace(
            /ADMIN_PASSWORD_HASH=.*/,
            `ADMIN_PASSWORD_HASH="${hash}"`
          );
        } else {
          envLocalContent += `\nADMIN_PASSWORD_HASH="${hash}"\n`;
        }

        fs.writeFileSync(envLocalPath, envLocalContent);
        console.log('✅ Updated .env.local');
      }

      console.log('\n✅ Password updated successfully!');
      console.log('\n⚠️  Important: Restart your development server for changes to take effect');
      console.log('   If running locally: Stop and restart `npm run dev`');
      console.log('\n⚠️  For production: Commit and push changes, or update environment variables in Netlify');

    } catch (error) {
      console.error('\n❌ Error updating .env files:', error.message);
      console.log('\nManually add this to your .env file:');
      console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    }
  } else {
    console.log('\nManually add this to your .env file:');
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  }

  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
