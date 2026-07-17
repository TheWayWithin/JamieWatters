/**
 * Regression check for the Executor File portfolio entry (T-154).
 *
 * Verifies: the DB row exists with the expected shape, the public pages
 * serve it, and the homepage product counter has not drifted below it.
 * Run from website/: npx tsx scripts/verify-executor-file.ts
 * Against production instead: BASE_URL=https://jamiewatters.work npx tsx scripts/verify-executor-file.ts
 */

import { PrismaClient } from '@prisma/client';
import { loadEnv } from './env';

loadEnv();

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
}

async function main() {
  const row = await prisma.project.findUnique({ where: { slug: 'executor-file' } });
  check('DB row executor-file exists', !!row);
  if (row) {
    check('status is BETA or LIVE', row.status === 'BETA' || row.status === 'LIVE', row.status);
    check('url passes the portfolio http filter', row.url.startsWith('http'), row.url);
    check('projectType is OPEN_SOURCE', row.projectType === 'OPEN_SOURCE');
  }

  const portfolio = await fetch(`${BASE_URL}/portfolio`).then((r) => r.text());
  check('/portfolio lists Executor File', portfolio.includes('Executor File'));

  const detail = await fetch(`${BASE_URL}/portfolio/executor-file`);
  check('/portfolio/executor-file returns 200', detail.status === 200, String(detail.status));

  const home = await fetch(`${BASE_URL}/`).then((r) => r.text());
  check('homepage counter says 20 products', home.includes('20 products built with AI'));

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
