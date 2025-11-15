#!/usr/bin/env node

/**
 * Test script for Projects CRUD operations
 * Tests: Create, Read, Update, Delete
 *
 * Usage: node scripts/test-projects-crud.js
 */

const BASE_URL = 'http://localhost:3003';

// Test data
const testProject = {
  name: 'Test Project CMS',
  slug: 'test-project-cms',
  description: 'This is a test project for Phase 7 CMS implementation',
  url: 'https://example.com',
  techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
  category: 'AI_TOOLS',
  status: 'ACTIVE',
  featured: false,
  mrr: 100,
  users: 50,
  githubUrl: 'https://github.com/test/test-repo',
  githubToken: 'ghp_test1234567890123456789012345678', // Fake token for testing
  trackProgress: true,
};

let authToken = null;
let createdProjectId = null;

// Helper function to make authenticated requests
async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Cookie'] = `auth-token=${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Extract auth token from Set-Cookie header
  const setCookie = response.headers.get('set-cookie');
  if (setCookie && setCookie.includes('auth-token=')) {
    const match = setCookie.match(/auth-token=([^;]+)/);
    if (match) {
      authToken = match[1];
    }
  }

  return response;
}

// Test 1: Authenticate
async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');
  console.log('Logging in with admin credentials...');

  const response = await fetchWithAuth(`${BASE_URL}/api/auth`, {
    method: 'POST',
    body: JSON.stringify({ password: 'admin123' }), // Development password
  });

  if (response.ok) {
    console.log('✅ Authentication successful');
    return true;
  } else {
    console.error('❌ Authentication failed:', await response.text());
    return false;
  }
}

// Test 2: Create project
async function testCreateProject() {
  console.log('\n📝 Test 2: Create Project');
  console.log('Creating test project...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects`, {
    method: 'POST',
    body: JSON.stringify(testProject),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    createdProjectId = data.data.id;
    console.log('✅ Project created successfully');
    console.log('   ID:', createdProjectId);
    console.log('   Name:', data.data.name);
    console.log('   Track Progress:', data.data.trackProgress);
    return true;
  } else {
    console.error('❌ Failed to create project:', data.error || 'Unknown error');
    if (data.details) {
      console.error('   Details:', data.details);
    }
    return false;
  }
}

// Test 3: Get all projects
async function testGetProjects() {
  console.log('\n📋 Test 3: Get All Projects');
  console.log('Fetching all projects...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects`);
  const data = await response.json();

  if (response.ok && data.success) {
    console.log('✅ Projects fetched successfully');
    console.log('   Total projects:', data.count);
    const testProj = data.data.find((p) => p.id === createdProjectId);
    if (testProj) {
      console.log('   Found test project:', testProj.name);
      console.log('   Has GitHub URL:', !!testProj.githubUrl);
      console.log('   Track Progress:', testProj.trackProgress);
    }
    return true;
  } else {
    console.error('❌ Failed to fetch projects:', data.error);
    return false;
  }
}

// Test 4: Get single project
async function testGetSingleProject() {
  console.log('\n🔍 Test 4: Get Single Project');
  console.log('Fetching project by ID...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects/${createdProjectId}`);
  const data = await response.json();

  if (response.ok && data.success) {
    console.log('✅ Project fetched successfully');
    console.log('   Name:', data.data.name);
    console.log('   Slug:', data.data.slug);
    console.log('   GitHub URL:', data.data.githubUrl || 'none');
    console.log('   Track Progress:', data.data.trackProgress);
    console.log('   SECURITY CHECK: githubToken in response?', 'githubToken' in data.data ? '❌ EXPOSED' : '✅ Hidden');
    return true;
  } else {
    console.error('❌ Failed to fetch project:', data.error);
    return false;
  }
}

// Test 5: Update project (toggle trackProgress)
async function testUpdateProject() {
  console.log('\n✏️  Test 5: Update Project (Toggle Track Progress)');
  console.log('Updating project...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects/${createdProjectId}`, {
    method: 'PUT',
    body: JSON.stringify({
      trackProgress: false, // Toggle to false
      mrr: 200, // Update MRR
    }),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    console.log('✅ Project updated successfully');
    console.log('   Track Progress changed to:', data.data.trackProgress);
    console.log('   MRR updated to:', data.data.mrr);
    return true;
  } else {
    console.error('❌ Failed to update project:', data.error);
    return false;
  }
}

// Test 6: Verify token encryption in database
async function testTokenEncryption() {
  console.log('\n🔒 Test 6: Verify Token Encryption');
  console.log('Checking database for encrypted token...');

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const project = await prisma.project.findUnique({
      where: { id: createdProjectId },
      select: { githubToken: true, name: true },
    });

    if (project && project.githubToken) {
      const isEncrypted = project.githubToken.includes(':'); // Our format: iv:authTag:encrypted
      if (isEncrypted && !project.githubToken.startsWith('ghp_')) {
        console.log('✅ Token is encrypted in database');
        console.log('   Format check: Contains separators (:)');
        console.log('   Not plain text: Does not start with ghp_');
        console.log('   Encrypted value sample:', project.githubToken.substring(0, 50) + '...');
      } else {
        console.error('❌ Token appears to be in plain text!');
        console.error('   Value:', project.githubToken.substring(0, 20) + '...');
      }
    } else {
      console.log('⚠️  No token found in database');
    }

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Failed to check database:', error.message);
    await prisma.$disconnect();
    return false;
  }
}

// Test 7: Delete project
async function testDeleteProject() {
  console.log('\n🗑️  Test 7: Delete Project');
  console.log('Deleting test project...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects/${createdProjectId}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (response.ok && data.success) {
    console.log('✅ Project deleted successfully');
    return true;
  } else {
    console.error('❌ Failed to delete project:', data.error);
    return false;
  }
}

// Test 8: Verify deletion
async function testVerifyDeletion() {
  console.log('\n✓ Test 8: Verify Deletion');
  console.log('Attempting to fetch deleted project...');

  const response = await fetchWithAuth(`${BASE_URL}/api/admin/projects/${createdProjectId}`);
  const data = await response.json();

  if (response.status === 404) {
    console.log('✅ Project correctly deleted (404 Not Found)');
    return true;
  } else {
    console.error('❌ Project still exists!');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Phase 7 Day 1 CRUD Tests');
  console.log('=======================================');

  const tests = [
    testAuthentication,
    testCreateProject,
    testGetProjects,
    testGetSingleProject,
    testUpdateProject,
    testTokenEncryption,
    testDeleteProject,
    testVerifyDeletion,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n=======================================');
  console.log('📊 Test Results');
  console.log('=======================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Start tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
