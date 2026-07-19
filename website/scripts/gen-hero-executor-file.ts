/**
 * One-off, deterministic hero image for the /journey post
 * "A friend said it was a business. I decided it was not, and built it anyway."
 *
 * Renders an on-brand (Deep Space navy + Proof Gold) 1600x900 SVG to PNG via
 * sharp. Theme: the digital-estate map as an encrypted FILE that outlasts the
 * companies that might have owned it. Committed as a static asset; no runtime
 * font or service dependency.
 *
 * Run from website/: npx tsx scripts/gen-hero-executor-file.ts
 */

import sharp from 'sharp';
import path from 'path';

// Brand tokens (tailwind.config.ts)
const NAVY = '#0F172A';
const SURFACE = '#1E293B';
const SURFACE2 = '#243044';
const GOLD = '#F59E0B';
const TEXT = '#F8FAFC';
const TEXT2 = '#CBD5E1';
const TEXT3 = '#64748B';

const W = 1600;
const H = 900;

const SANS = 'Helvetica, Arial, sans-serif';
const MONO = "'JetBrains Mono', 'SF Mono', Menlo, monospace";

// A faint "company" card that comes and goes: dashed, low opacity, rotated.
function ghostCard(x: number, y: number, rot: number, opacity: number, label: string) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rot})" opacity="${opacity}">
      <rect width="300" height="150" rx="14" fill="none" stroke="${TEXT3}" stroke-width="2" stroke-dasharray="7 8"/>
      <text x="24" y="42" font-family="${MONO}" font-size="17" fill="${TEXT3}" letter-spacing="1">${label}</text>
      <line x1="24" y1="62" x2="150" y2="62" stroke="${TEXT3}" stroke-width="6" stroke-linecap="round"/>
      <text x="255" y="132" font-family="${SANS}" font-size="34" fill="${TEXT3}">&#215;</text>
    </g>`;
}

// A register row inside the enduring file card.
function row(y: number, glyph: string, label: string, valueW: number, gold = false) {
  return `
    <text x="40" y="${y + 6}" font-family="${MONO}" font-size="20" fill="${gold ? GOLD : TEXT2}">${glyph}</text>
    <text x="70" y="${y + 6}" font-family="${SANS}" font-size="21" fill="${gold ? TEXT : TEXT2}">${label}</text>
    <rect x="330" y="${y - 9}" width="${valueW}" height="10" rx="5" fill="${gold ? GOLD : TEXT3}" opacity="${gold ? 0.85 : 0.4}"/>`;
}

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="80%" cy="18%" r="65%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.16"/>
      <stop offset="55%" stop-color="${GOLD}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${SURFACE2}"/>
      <stop offset="100%" stop-color="${SURFACE}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${NAVY}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- ===== Left column: the idea ===== -->
  <g transform="translate(96 250)">
    <text font-family="${MONO}" font-size="22" fill="${GOLD}" letter-spacing="6">DIGITAL ESTATE</text>
    <rect x="2" y="34" width="70" height="5" rx="2.5" fill="${GOLD}"/>
    <text y="150" font-family="${SANS}" font-size="76" font-weight="700" fill="${TEXT}">The map is</text>
    <text y="238" font-family="${SANS}" font-size="76" font-weight="700" fill="${TEXT}">a file.</text>
    <text y="316" font-family="${SANS}" font-size="27" fill="${TEXT2}">It outlasts every company</text>
    <text y="356" font-family="${SANS}" font-size="27" fill="${TEXT2}">that might have owned it.</text>
    <g transform="translate(2 430)">
      <circle cx="6" cy="-6" r="6" fill="#22C55E"/>
      <text x="26" y="0" font-family="${SANS}" font-size="19" fill="${TEXT3}" letter-spacing="1">jamiewatters.work</text>
    </g>
  </g>

  <!-- ===== Right: companies fade, the file endures ===== -->
  ${ghostCard(1120, 150, -7, 0.28, 'a service')}
  ${ghostCard(1245, 250, 6, 0.20, 'a vault app')}
  ${ghostCard(1055, 470, 8, 0.16, 'a startup')}

  <!-- The enduring encrypted file -->
  <g transform="translate(940 300)">
    <rect x="10" y="12" width="520" height="330" rx="20" fill="#000000" opacity="0.35"/>
    <rect width="520" height="330" rx="20" fill="url(#cardBg)" stroke="rgba(226,232,240,0.12)" stroke-width="1.5"/>
    <rect width="7" height="330" rx="3.5" fill="${GOLD}"/>

    <!-- lock + title -->
    <g transform="translate(40 52)">
      <rect x="0" y="10" width="30" height="22" rx="4" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <path d="M6 10 v-6 a9 9 0 0 1 18 0 v6" fill="none" stroke="${GOLD}" stroke-width="3"/>
      <circle cx="15" cy="20" r="3" fill="${GOLD}"/>
    </g>
    <text x="92" y="76" font-family="${MONO}" font-size="20" fill="${TEXT}" letter-spacing="2">ENCRYPTED REGISTER</text>
    <line x1="40" y1="98" x2="480" y2="98" stroke="rgba(226,232,240,0.10)" stroke-width="1.5"/>

    ${row(146, '&#9642;', 'accounts', 150)}
    ${row(190, '&#9642;', 'assets', 190)}
    ${row(234, '&#9642;', 'liabilities', 120)}
    ${row(278, '&#9670;', 'instructions', 110, true)}
  </g>
</svg>`;

const out = path.join(
  __dirname,
  '..',
  'public',
  'images',
  'blog',
  '2026-07-19-a-friend-said-it-was-a-business.png'
);

sharp(Buffer.from(svg))
  .png()
  .toFile(out)
  .then((info) => console.log(`Wrote ${out} (${info.width}x${info.height}, ${info.size} bytes)`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
