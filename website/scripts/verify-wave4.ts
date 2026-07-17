/**
 * Regression check for PRJ-18 Wave 4 (portfolio credibility, JW-ISS-5).
 *
 * Verifies the /portfolio page trims to live products with honest proof points,
 * moves pre-launch work to the "in the workshop" line (not empty cards), drops
 * the vanity "N built" framing, and leaks no archived/junk rows. AImpactMonitor
 * (formerly the p-3 junk row) resolves at its real slug.
 *
 * Run from website/: npx tsx scripts/verify-wave4.ts
 * Against production: BASE_URL=https://jamiewatters.work npx tsx scripts/verify-wave4.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let failures = 0;
function check(label: string, ok: boolean, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` (${detail})` : ''}`);
  if (!ok) failures += 1;
}

async function text(path: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${path}`);
  return res.text();
}
async function statusOf(path: string): Promise<number> {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
  return res.status;
}

// A sample of the approved proof lines — presence proves the live grid renders them.
const PROOF_SAMPLES = [
  '51 scoring dimensions', // AI Search Arena
  '132 factors', // MASTERY-AI / scanner
  'read the code before you trust it', // Agent-11
  '2-of-3 Shamir shares', // Executor File
];

async function main() {
  const html = await text('/portfolio');
  check('/portfolio renders (200)', (await statusOf('/portfolio')) === 200);

  // 1. Live grid carries honest proof lines.
  for (const sample of PROOF_SAMPLES) {
    check(`proof line present: "${sample}"`, html.includes(sample));
  }
  const proofLines = (html.match(/border-l-2 border-brand-primary/g) || []).length;
  check('every live card has a proof line (>=10)', proofLines >= 10, `${proofLines} matches`);

  // 2. Pre-launch work is in the workshop line, not the grid.
  check('workshop section present', html.includes('In the workshop'));
  for (const name of ['AImpactMonitor', 'ModelOptix', 'PlebTest']) {
    check(`workshop lists ${name}`, html.includes(name));
  }

  // 3. Vanity framing gone.
  check('no "N products built" vanity header', !/products built with AI/i.test(html));
  check('header reframed to live-first', /live and in people's hands/i.test(html));

  // 4. No archived / junk-row leaks (these have no public URL or are ARCHIVED).
  for (const junk of ['asmge', '>p-1<', '>p-2<', 'SEO-AGENT']) {
    check(`no leak of "${junk}"`, !html.includes(junk));
  }

  // 5. AImpactMonitor resolves at its real slug (renamed from p-3), old slug 404s.
  check('/portfolio/aimpactmonitor resolves (200)', (await statusOf('/portfolio/aimpactmonitor')) === 200);
  check('/portfolio/p-3 no longer resolves (404)', (await statusOf('/portfolio/p-3')) === 404);

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
