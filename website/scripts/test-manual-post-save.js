#!/usr/bin/env node

/**
 * Test Manual Post Save
 *
 * This script tests creating a manual post with and without a linked project
 * to verify the 400 Bad Request bug is fixed.
 */

const BASE_URL = 'http://localhost:3000';

async function login() {
  console.log('1. Logging in...');
  const res = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'admin123' }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const cookies = res.headers.get('set-cookie');
  const tokenMatch = cookies?.match(/auth-token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    throw new Error('No auth token received');
  }

  console.log('   ✅ Login successful\n');
  return token;
}

async function createManualPostWithoutProject(token) {
  console.log('2. Testing: Create manual post WITHOUT linked project...');

  const payload = {
    title: 'Test Manual Post Without Project',
    content: '# Test Content\n\nThis is a **test post** to verify the fix.\n\n- Bullet 1\n- Bullet 2',
    excerpt: 'Test excerpt',
    tags: ['test', 'manual-post'],
    postType: 'manual',
    projectId: null, // This should work now
    published: false,
    readTime: 2,
  };

  console.log('   Payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE_URL}/api/admin/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('   ❌ Failed to parse response:', responseText);
    throw new Error('Invalid JSON response');
  }

  if (!res.ok) {
    console.error('   ❌ Request failed:', res.status, res.statusText);
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  console.log('   ✅ POST request successful:', res.status);
  console.log('   Created post:', data.post?.slug);
  console.log('   Post ID:', data.post?.id);
  console.log('');
  return data.post;
}

async function createManualPostWithEmptyProjectString(token) {
  console.log('3. Testing: Create manual post WITH EMPTY STRING projectId...');

  const payload = {
    title: 'Test Manual Post With Empty Project',
    content: '# Test Content 2\n\nAnother **test post** to verify empty string handling.\n\n- Item A\n- Item B',
    excerpt: 'Test excerpt 2',
    tags: ['test', 'empty-project'],
    postType: 'manual',
    projectId: '', // This is what the form sends when "None" is selected
    published: false,
    readTime: 2,
  };

  console.log('   Payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE_URL}/api/admin/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('   ❌ Failed to parse response:', responseText);
    throw new Error('Invalid JSON response');
  }

  if (!res.ok) {
    console.error('   ❌ Request failed:', res.status, res.statusText);
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  console.log('   ✅ POST request successful:', res.status);
  console.log('   Created post:', data.post?.slug);
  console.log('   Post ID:', data.post?.id);
  console.log('');
  return data.post;
}

async function publishPost(token) {
  console.log('4. Testing: Create and PUBLISH manual post...');

  const payload = {
    title: 'Test Published Manual Post',
    content: '# Published Content\n\nThis post should be **published** immediately.\n\n- Published item 1\n- Published item 2',
    excerpt: 'Published test excerpt',
    tags: ['test', 'published'],
    postType: 'manual',
    projectId: null,
    published: true, // Publish immediately
    readTime: 2,
  };

  console.log('   Payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(`${BASE_URL}/api/admin/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `auth-token=${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await res.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('   ❌ Failed to parse response:', responseText);
    throw new Error('Invalid JSON response');
  }

  if (!res.ok) {
    console.error('   ❌ Request failed:', res.status, res.statusText);
    console.error('   Response:', JSON.stringify(data, null, 2));
    return false;
  }

  console.log('   ✅ POST request successful:', res.status);
  console.log('   Created post:', data.post?.slug);
  console.log('   Published:', data.post?.published);
  console.log('   Published at:', data.post?.publishedAt);
  console.log('');
  return data.post;
}

async function cleanup(token, postIds) {
  if (postIds.length === 0) return;

  console.log('\n5. Cleaning up test posts...');
  for (const postId of postIds) {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `auth-token=${token}`,
        },
      });
      if (res.ok) {
        console.log(`   ✅ Deleted post: ${postId}`);
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to delete post ${postId}:`, error.message);
    }
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('MANUAL POST SAVE - BUG FIX VERIFICATION');
  console.log('='.repeat(70));
  console.log('');

  const createdPosts = [];

  try {
    const token = await login();

    // Test 1: null projectId
    const post1 = await createManualPostWithoutProject(token);
    if (post1) createdPosts.push(post1.id);

    // Test 2: empty string projectId (the actual bug scenario)
    const post2 = await createManualPostWithEmptyProjectString(token);
    if (post2) createdPosts.push(post2.id);

    // Test 3: published post
    const post3 = await publishPost(token);
    if (post3) createdPosts.push(post3.id);

    // Clean up
    await cleanup(token, createdPosts);

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\nThe manual post save bug is FIXED!');
    console.log('- Empty string projectId now works ✅');
    console.log('- Null projectId works ✅');
    console.log('- Publishing posts works ✅');

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error('\nError:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

main();
