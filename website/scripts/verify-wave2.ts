/**
 * Regression check for PRJ-18 Wave 2 (dead-code purge, JW-ISS-4).
 *
 * Verifies: the four deleted surfaces 404, every AdminTabs route returns 200,
 * every /api/admin/* endpoint still requires auth (401 without a token), and
 * package.json no longer lists bcryptjs or @vercel/analytics.
 * Run from website/: npx tsx scripts/verify-wave2.ts
 * Against production instead: BASE_URL=https://jamiewatters.work npx tsx scripts/verify-wave2.ts
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
}

async function main() {
  // 1. Deleted surfaces are gone.
  for (const deleted of ['/admin/mission-control', '/admin/metrics', '/api/metrics', '/api/admin/metrics-v2']) {
    const res = await fetch(`${BASE_URL}${deleted}`);
    check(`${deleted} is gone (404)`, res.status === 404, String(res.status));
  }

  // 2. Every AdminTabs route renders. Unauthenticated requests still get a 200
  //    page (the client-side AdminAuth gate shows the login form), so 200 here
  //    proves the route exists and renders, not that data is exposed.
  const adminRoutes = [
    '/admin',
    '/admin/content',
    '/admin/projects',
    '/admin/settings',
    '/admin/cockpit',
    '/admin/goals',
    '/admin/hitl',
    '/admin/execution',
    '/admin/portfolio',
    '/admin/agents',
    '/admin/audit',
  ];
  for (const route of adminRoutes) {
    const res = await fetch(`${BASE_URL}${route}`);
    const html = res.ok ? await res.text() : '';
    check(`${route} returns 200 and renders`, res.status === 200 && html.includes('<html'), String(res.status));
  }

  // 3. Admin API routes self-enforce auth (middleware is CSP-only now).
  const adminApis = [
    '/api/admin/overview',
    '/api/admin/cockpit',
    '/api/admin/goals',
    '/api/admin/hitl',
    '/api/admin/posts',
    '/api/admin/projects',
    '/api/admin/tasks',
    '/api/admin/issues',
    '/api/admin/agents',
    '/api/admin/activity',
    '/api/admin/health',
    '/api/admin/memory',
  ];
  for (const api of adminApis) {
    const res = await fetch(`${BASE_URL}${api}`);
    check(`${api} requires auth (401)`, res.status === 401, String(res.status));
  }

  // 4. Dead dependencies are out of package.json.
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  check('package.json no longer lists bcryptjs', !('bcryptjs' in allDeps));
  check('package.json no longer lists @vercel/analytics', !('@vercel/analytics' in allDeps));
  check('package.json still lists bcrypt (live auth dep)', 'bcrypt' in allDeps);

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
