#!/usr/bin/env node

/**
 * Dependency Verification Script
 *
 * Verifies that all critical dependencies are installed for the website.
 * Exits with error code 1 if any required dependencies are missing.
 *
 * Usage:
 *   node scripts/verify-dependencies.js
 *   npm run verify:deps
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

/**
 * Required dependencies with their expected locations and purposes
 */
const requiredDependencies = {
  // Core Markdown Processing
  'remark': {
    type: 'dependencies',
    purpose: 'Markdown parsing',
    critical: true,
  },
  'remark-html': {
    type: 'dependencies',
    purpose: 'HTML conversion from markdown',
    critical: true,
  },
  'remark-gfm': {
    type: 'dependencies',
    purpose: 'GitHub Flavored Markdown support',
    critical: true,
  },
  'rehype-highlight': {
    type: 'dependencies',
    purpose: 'Syntax highlighting for code blocks',
    critical: true,
  },
  'unified': {
    type: 'dependencies',
    purpose: 'Markdown processing pipeline',
    critical: true,
  },
  'gray-matter': {
    type: 'dependencies',
    purpose: 'Frontmatter parsing',
    critical: false,
  },

  // Typography Styling (CRITICAL)
  '@tailwindcss/typography': {
    type: 'devDependencies',
    purpose: 'Prose classes for markdown rendering',
    critical: true,
    details: 'Without this plugin, blog posts will show plain text with no formatting',
  },

  // Core Framework
  'next': {
    type: 'dependencies',
    purpose: 'Next.js framework',
    critical: true,
  },
  'react': {
    type: 'dependencies',
    purpose: 'React library',
    critical: true,
  },
  'react-dom': {
    type: 'dependencies',
    purpose: 'React DOM rendering',
    critical: true,
  },

  // Database
  '@prisma/client': {
    type: 'dependencies',
    purpose: 'Prisma database client',
    critical: true,
  },
  'prisma': {
    type: 'devDependencies',
    purpose: 'Prisma CLI',
    critical: true,
  },

  // Styling
  'tailwindcss': {
    type: 'devDependencies',
    purpose: 'Tailwind CSS framework',
    critical: true,
  },
  'autoprefixer': {
    type: 'devDependencies',
    purpose: 'PostCSS autoprefixer',
    critical: false,
  },
  'postcss': {
    type: 'devDependencies',
    purpose: 'PostCSS processing',
    critical: false,
  },
};

/**
 * Read and parse package.json
 */
function readPackageJson() {
  const packageJsonPath = path.join(__dirname, '../package.json');

  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(packageJsonContent);
  } catch (error) {
    console.error(`${colors.red}${colors.bold}ERROR:${colors.reset} Could not read package.json`);
    console.error(error.message);
    process.exit(1);
  }
}

/**
 * Verify all dependencies
 */
function verifyDependencies() {
  console.log(`${colors.blue}${colors.bold}Verifying Required Dependencies...${colors.reset}\n`);

  const packageJson = readPackageJson();
  let hasErrors = false;
  let hasCriticalErrors = false;
  let warningCount = 0;

  // Check each required dependency
  for (const [pkgName, config] of Object.entries(requiredDependencies)) {
    const deps = packageJson[config.type] || {};

    if (!deps[pkgName]) {
      if (config.critical) {
        console.error(
          `${colors.red}${colors.bold}❌ CRITICAL:${colors.reset} ${colors.red}${pkgName}${colors.reset} missing from ${config.type}`
        );
        console.error(`   Purpose: ${config.purpose}`);
        if (config.details) {
          console.error(`   ${colors.yellow}${config.details}${colors.reset}`);
        }
        console.error('');
        hasErrors = true;
        hasCriticalErrors = true;
      } else {
        console.warn(
          `${colors.yellow}⚠️  WARNING:${colors.reset} ${colors.yellow}${pkgName}${colors.reset} missing from ${config.type}`
        );
        console.warn(`   Purpose: ${config.purpose}`);
        console.warn('');
        hasErrors = true;
        warningCount++;
      }
    } else {
      console.log(
        `${colors.green}✅${colors.reset} ${pkgName}: ${colors.green}${deps[pkgName]}${colors.reset}`
      );
      console.log(`   ${colors.reset}${config.purpose}${colors.reset}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60) + '\n');

  if (hasCriticalErrors) {
    console.error(`${colors.red}${colors.bold}❌ CRITICAL DEPENDENCIES MISSING!${colors.reset}`);
    console.error(`\nThe website will NOT function correctly without these packages.`);
    console.error(`\nTo install missing dependencies:`);
    console.error(`${colors.blue}  npm install -D @tailwindcss/typography${colors.reset}`);
    console.error(`${colors.blue}  npm install remark remark-html remark-gfm rehype-highlight${colors.reset}`);
    process.exit(1);
  } else if (warningCount > 0) {
    console.warn(`${colors.yellow}⚠️  ${warningCount} non-critical dependencies missing${colors.reset}`);
    console.log(`${colors.green}${colors.bold}✅ All critical dependencies present${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.green}${colors.bold}✅ All required dependencies present!${colors.reset}`);
    process.exit(0);
  }
}

/**
 * Additional check: Verify Tailwind configuration
 */
function verifyTailwindConfig() {
  console.log(`\n${colors.blue}${colors.bold}Verifying Tailwind Configuration...${colors.reset}\n`);

  const tailwindConfigPath = path.join(__dirname, '../tailwind.config.ts');

  try {
    const tailwindConfig = fs.readFileSync(tailwindConfigPath, 'utf-8');

    // Check if typography plugin is configured
    if (tailwindConfig.includes('@tailwindcss/typography')) {
      console.log(`${colors.green}✅${colors.reset} Tailwind Typography plugin configured`);
    } else {
      console.error(`${colors.red}❌ CRITICAL:${colors.reset} Tailwind Typography plugin not configured`);
      console.error(`\nAdd this to tailwind.config.ts plugins array:`);
      console.error(`${colors.blue}  plugins: [${colors.reset}`);
      console.error(`${colors.blue}    require('@tailwindcss/typography'),${colors.reset}`);
      console.error(`${colors.blue}  ],${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.warn(`${colors.yellow}⚠️  WARNING:${colors.reset} Could not verify tailwind.config.ts`);
    console.warn(error.message);
    return true; // Don't fail on this
  }

  return true;
}

// Run verification
console.log(`${colors.bold}Website Dependency Verification${colors.reset}`);
console.log('='.repeat(60) + '\n');

verifyDependencies();
const tailwindConfigOk = verifyTailwindConfig();

if (!tailwindConfigOk) {
  process.exit(1);
}
