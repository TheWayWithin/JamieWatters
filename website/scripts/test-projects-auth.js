/**
 * Test script to verify Projects API authentication works correctly
 *
 * Tests:
 * 1. Login and get auth token
 * 2. Fetch projects without query params (should work after fix)
 * 3. Fetch projects with query params (should work)
 * 4. Verify server logs show requests arriving
 */

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Testing Projects API Authentication\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'admin123' }),
      credentials: 'include',
    });

    if (!loginRes.ok) {
      console.error('❌ Login failed:', loginRes.status);
      return;
    }

    // Extract cookie from response
    const setCookie = loginRes.headers.get('set-cookie');
    const cookieMatch = setCookie?.match(/auth-token=([^;]+)/);
    const authToken = cookieMatch ? cookieMatch[1] : null;

    if (!authToken) {
      console.error('❌ No auth token in response');
      return;
    }

    console.log('✅ Login successful, token received\n');

    // Step 2: Fetch projects WITHOUT query params
    console.log('2️⃣ Fetching /api/admin/projects (no query params)...');
    const projectsRes = await fetch(`${BASE_URL}/api/admin/projects`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
    });

    console.log(`   Status: ${projectsRes.status} ${projectsRes.statusText}`);

    if (projectsRes.ok) {
      const data = await projectsRes.json();
      console.log(`✅ SUCCESS! Received ${data.count} projects`);
    } else {
      const error = await projectsRes.text();
      console.error(`❌ FAILED: ${error}`);
    }

    console.log('');

    // Step 3: Fetch projects WITH query params
    console.log('3️⃣ Fetching /api/admin/projects?trackProgress=true...');
    const projectsWithParamsRes = await fetch(`${BASE_URL}/api/admin/projects?trackProgress=true`, {
      headers: {
        'Cookie': `auth-token=${authToken}`,
      },
    });

    console.log(`   Status: ${projectsWithParamsRes.status} ${projectsWithParamsRes.statusText}`);

    if (projectsWithParamsRes.ok) {
      const data = await projectsWithParamsRes.json();
      console.log(`✅ SUCCESS! Received ${data.count} projects`);
    } else {
      const error = await projectsWithParamsRes.text();
      console.error(`❌ FAILED: ${error}`);
    }

    console.log('\n✨ Tests complete!');
    console.log('📋 Check the server logs above to verify requests reached the API route');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run tests
runTests().then(() => process.exit(0));
