#!/usr/bin/env node
/**
 * Jamie's Field Report — weekly digest composer (PRJ-20, T-193).
 *
 * Reads the live RSS feed (jamiewatters.work/rss.xml), takes the /journey
 * posts published in the last 7 days, and composes the Sunday digest:
 * a short Jamie-voice intro, one card per post (title, one line, link,
 * newest first), plain sign-off. Creates it in Buttondown via the API.
 *
 * A quiet week (zero posts) sends nothing at all. Never filler.
 *
 * The intro is the standing one below unless newsletter/intro.md contains
 * text, in which case that text is used verbatim as this week's intro
 * (write it during the week, it gets picked up on Sunday; clear it after).
 *
 * Modes:
 *   --dry-run          compose and print, no API calls (no key needed)
 *   --draft            create a Buttondown draft, print its id
 *   --test <email>     create a draft AND send it to <email> only
 *   --send             create scheduled 10 minutes out (the real weekly send)
 *
 * Env: BUTTONDOWN_API_KEY (not needed for --dry-run). Never commit the key.
 * Run: node scripts/newsletter/field-report.mjs --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const FEED_URL = 'https://jamiewatters.work/rss.xml';
const API_BASE = 'https://api.buttondown.com/v1';
const WINDOW_DAYS = 7;

const STANDING_INTRO = `This week's field report: what I built, tested, and learned in public. The real numbers, duds included.`;

const SIGN_OFF = `That's the week. Hit reply if any of it lands; it comes straight to me.

Jamie`;

// Standard footer, every issue. One primary CTA per email (the reply ask above);
// everything here is identity, not competing asks. Support line matches the
// site's end-of-post card voice exactly.
const FOOTER = `**Follow the build:** [YouTube](https://www.youtube.com/@jamiewatterswork) · [X](https://x.com/Jamie_within) · [LinkedIn](https://www.linkedin.com/in/jamie-watters-solo/) · [jamiewatters.work](https://jamiewatters.work?utm_source=jamiewatters&utm_medium=email)

No paywall, no sponsors. If this saved you some time, you can [buy me a coffee](https://buymeacoffee.com/jamiewatters).`;

// ---------------------------------------------------------------- helpers

function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Parse our own feed. The format is fixed by app/rss.xml/route.ts in the
 * website repo (single-line escaped title/link/pubDate/description per item),
 * so a targeted parse is safe here and keeps this script dependency-free.
 */
function parseFeed(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const pick = (tag) => {
      const t = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
      return t ? unescapeXml(t[1].trim()) : '';
    };
    items.push({
      title: pick('title'),
      link: pick('link'),
      pubDate: new Date(pick('pubDate')),
      description: pick('description'),
    });
  }
  return items;
}

/**
 * The card's dek = the post's full excerpt. Cutting it to the first sentence
 * stripped the benefit the dek exists to carry (JW-ISS-10) — deks are authored
 * per the content standard (overt benefit + dramatic difference, <=~320 chars),
 * so pass them through whole; cap only runaway ones, at a sentence boundary.
 */
function cardDek(text, cap = 350) {
  const s = text.trim().replace(/\s+/g, ' ');
  if (s.length <= cap) return s;
  const head = s.slice(0, cap);
  const cut = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  return cut > 0 ? head.slice(0, cut + 1) : head.trimEnd() + '…';
}

/**
 * Subject hook = newest post's title, trailing full stop dropped. The title
 * keeps its own capitalisation — lowercasing the first letter broke proper
 * nouns ("garry Tan", JW-ISS-9).
 */
function subjectFor(newestTitle) {
  const hook = newestTitle.trim().replace(/\.$/, '');
  return `Jamie's Field Report: ${hook}`;
}

function weeklyIntro() {
  const here = dirname(fileURLToPath(import.meta.url));
  const overridePath = join(here, '..', '..', 'newsletter', 'intro.md');
  if (existsSync(overridePath)) {
    const text = readFileSync(overridePath, 'utf8')
      .replace(/<!--[\s\S]*?-->/g, '')
      .split('\n')
      .filter((l) => !l.startsWith('#'))
      .join('\n')
      .trim();
    if (text.length > 0) return text;
  }
  return STANDING_INTRO;
}

function composeBody(posts) {
  const cards = posts
    .map((p) => `### [${p.title}](${p.link})\n\n${cardDek(p.description)}`)
    .join('\n\n');
  return `${weeklyIntro()}\n\n---\n\n${cards}\n\n---\n\n${SIGN_OFF}\n\n${FOOTER}\n`;
}

async function api(path, body) {
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) {
    console.error('BUTTONDOWN_API_KEY is not set.');
    process.exit(1);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Buttondown ${path} failed: ${res.status} ${text}`);
    process.exit(1);
  }
  return text ? JSON.parse(text) : {};
}

// ---------------------------------------------------------------- main

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--dry-run')
    ? 'dry-run'
    : args.includes('--test')
      ? 'test'
      : args.includes('--send')
        ? 'send'
        : args.includes('--draft')
          ? 'draft'
          : 'dry-run';

  const res = await fetch(FEED_URL);
  if (!res.ok) {
    console.error(`Feed fetch failed: ${res.status}`);
    process.exit(1);
  }
  const all = parseFeed(await res.text());
  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const week = all
    .filter((p) => p.pubDate.getTime() >= cutoff)
    .sort((a, b) => b.pubDate - a.pubDate);

  console.log(`Feed items: ${all.length}; in the last ${WINDOW_DAYS} days: ${week.length}`);

  if (week.length === 0) {
    console.log('Quiet week: no posts, no email. (Honesty bar: never filler.)');
    return;
  }

  const subject = subjectFor(week[0].title);
  const body = composeBody(week);

  if (mode === 'dry-run') {
    console.log(`\n=== SUBJECT ===\n${subject}\n\n=== BODY (markdown) ===\n${body}`);
    return;
  }

  const email = await api('/emails', { subject, body, status: 'draft' });
  console.log(`Draft created: ${email.id} — "${subject}"`);

  if (mode === 'test') {
    const to = args[args.indexOf('--test') + 1];
    if (!to || to.startsWith('--')) {
      console.error('--test needs an email address');
      process.exit(1);
    }
    await api(`/emails/${email.id}/send-draft`, { recipients: [to] });
    console.log(`Test sent to ${to} (draft stays unsent to the list).`);
  }

  if (mode === 'send') {
    // Real weekly send: schedule 10 minutes out (documented API path; the
    // short gap is also a cancel window in the Buttondown UI).
    const publishDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const patch = await fetch(`${API_BASE}/emails/${email.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'scheduled', publish_date: publishDate }),
    });
    if (!patch.ok) {
      console.error(`Scheduling failed: ${patch.status} ${await patch.text()}`);
      process.exit(1);
    }
    console.log(`Scheduled for ${publishDate}.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
