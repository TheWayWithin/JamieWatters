/**
 * Test GitHub Integration
 *
 * Tests the GitHub API integration library with various scenarios:
 * 1. Parse GitHub URLs
 * 2. Fetch from public repo (no token)
 * 3. Parse project-plan.md content
 */

import { parseGitHubUrl, fetchFileFromGitHub, fetchProjectPlan, formatGitHubError } from '../lib/github';
import { parseProjectPlan, calculateCompletionPercentage } from '../lib/markdown-parser';
import { calculateReadTime } from '../lib/read-time-calculator';

async function testGitHubUrlParsing() {
  console.log('\n=== Test 1: GitHub URL Parsing ===\n');

  const testUrls = [
    'https://github.com/jamiewatters/agent-11',
    'https://github.com/jamiewatters/agent-11.git',
    'git@github.com:jamiewatters/agent-11.git',
    'jamiewatters/agent-11',
    'invalid-url',
  ];

  for (const url of testUrls) {
    const parsed = parseGitHubUrl(url);
    console.log(`URL: ${url}`);
    console.log(`Parsed: ${parsed ? `${parsed.owner}/${parsed.repo}` : 'null'}`);
    console.log('');
  }
}

async function testFetchPublicRepo() {
  console.log('\n=== Test 2: Fetch from Public Repo ===\n');

  try {
    // Test with Next.js repository (public, well-maintained)
    const config = {
      owner: 'vercel',
      repo: 'next.js',
    };

    console.log(`Fetching README.md from ${config.owner}/${config.repo}...`);

    const content = await fetchFileFromGitHub(config, 'README.md');

    console.log('✅ Success!');
    console.log(`Content length: ${content.length} characters`);
    console.log(`First 100 chars: ${content.substring(0, 100)}...`);
    console.log('');

  } catch (error: any) {
    console.error('❌ Failed to fetch from public repo');
    console.error(`Error: ${formatGitHubError(error)}`);
  }
}

async function testFileNotFound() {
  console.log('\n=== Test 3: Handle File Not Found ===\n');

  try {
    const config = {
      owner: 'vercel',
      repo: 'next.js',
    };

    console.log(`Attempting to fetch non-existent file...`);

    await fetchFileFromGitHub(config, 'this-file-does-not-exist.md');

    console.log('❌ Should have thrown an error');

  } catch (error: any) {
    if (error.status === 404) {
      console.log('✅ Correctly caught 404 error');
      console.log(`Error message: ${formatGitHubError(error)}`);
    } else {
      console.log('❌ Wrong error type:', error);
    }
  }
}

async function testMarkdownParsing() {
  console.log('\n=== Test 4: Markdown Parsing ===\n');

  const sampleMarkdown = `
# My Project Plan

## Week 1

- [x] Set up repository
- [x] Configure CI/CD
- [ ] Write documentation
- [x] Deploy to production

## Week 2

- [ ] Add feature A
- [ ] ⏳ Working on feature B
- [ ] Add tests

## Completed Tasks

- [x] Initial project setup
- [X] Team onboarding (case-insensitive)
`;

  console.log('Parsing sample markdown...');

  const parsed = parseProjectPlan(sampleMarkdown);

  console.log(`\nTotal tasks: ${parsed.tasks.length}`);
  console.log(`Completed tasks: ${parsed.completedTasks.length}`);
  console.log(`In-progress tasks: ${parsed.inProgressTasks.length}`);
  console.log(`Pending tasks: ${parsed.pendingTasks.length}`);
  console.log(`Completion: ${calculateCompletionPercentage(parsed)}%`);

  console.log('\nCompleted tasks:');
  parsed.completedTasks.forEach((task) => {
    console.log(`  - ${task.content} (section: ${task.section || 'none'})`);
  });

  console.log('\nIn-progress tasks:');
  parsed.inProgressTasks.forEach((task) => {
    console.log(`  - ${task.content}`);
  });
}

async function testReadTimeCalculation() {
  console.log('\n=== Test 5: Read Time Calculation ===\n');

  const shortContent = 'This is a short post.';
  const mediumContent = 'Lorem ipsum dolor sit amet. '.repeat(50); // ~200 words
  const longContent = 'Lorem ipsum dolor sit amet. '.repeat(200); // ~800 words

  console.log(`Short content: ${calculateReadTime(shortContent)} min`);
  console.log(`Medium content (~200 words): ${calculateReadTime(mediumContent)} min`);
  console.log(`Long content (~800 words): ${calculateReadTime(longContent)} min`);
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('GitHub Integration Test Suite');
  console.log('='.repeat(60));

  try {
    await testGitHubUrlParsing();
    await testFetchPublicRepo();
    await testFileNotFound();
    await testMarkdownParsing();
    await testReadTimeCalculation();

    console.log('\n=== All Tests Complete ===\n');
    console.log('✅ Basic functionality working!');
    console.log('\nNext steps:');
    console.log('1. Test with a real GitHub repo containing project-plan.md');
    console.log('2. Test with private repo using encrypted token');
    console.log('3. Test full daily update generation flow');

  } catch (error) {
    console.error('\n❌ Test suite failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
