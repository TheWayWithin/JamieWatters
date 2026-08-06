#!/usr/bin/env node
/**
 * Jamie's Field Report — weekly digest composer (PRJ-20, T-193).
 *
 * Reads two feeds — the blog RSS (jamiewatters.work/rss.xml) and the YouTube
 * channel Atom feed — takes everything published in the last 7 days, and
 * composes the Sunday digest: a short Jamie-voice intro, a card per video
 * (thumbnail, title, watch link) then a card per post (title, dek, link),
 * newest first within each block, plain sign-off. Creates it in Buttondown.
 *
 * A quiet week (zero posts AND zero videos) sends nothing at all. Never
 * filler. A week with only videos still sends — video is the north star,
 * so a video-only week is exactly when the newsletter must not be silent.
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
 *      FIELD_REPORT_FEED / FIELD_REPORT_YT_FEED — override either feed with a
 *      URL or a local file path. Test-only escape hatch: it lets --dry-run run
 *      against forged feeds so the send/skip decision can be proven for
 *      posts-only / videos-only / both / neither without waiting a week.
 * Run: node scripts/newsletter/field-report.mjs --dry-run
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const FEED_URL = 'https://jamiewatters.work/rss.xml';

// YouTube's per-channel Atom feed. It needs the channel_id, not the @handle:
// UCHSxwrlJi13UOUm_WKVlhCg was read on 2026-08-06 from the <link rel="canonical">
// of https://www.youtube.com/@jamiewatterswork (the handle in FOOTER below), and
// confirmed against the channel page's own rel="alternate" RSS link. Hardcoded
// deliberately — resolving the handle at run time would add a scrape of a page
// YouTube reshapes often, and the Data API would add a credential to rotate for
// information that never changes.
const YT_CHANNEL_ID = 'UCHSxwrlJi13UOUm_WKVlhCg';
const YT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

const API_BASE = 'https://api.buttondown.com/v1';
const WINDOW_DAYS = 7;

// Which block leads the email. Video-first: video is the north star of the
// current strategy, and the thumbnail is the strongest thing in the issue.
// Flip to false for blog-first — that is the whole change.
const VIDEO_FIRST = true;

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
 * Parse the YouTube channel feed. This is a SEPARATE parser on purpose:
 * YouTube publishes Atom, not RSS. Different container (<entry>, not <item>),
 * different date tag (<published>, not <pubDate>), and the link is an
 * attribute on <link rel="alternate">, not element text. Point parseFeed()
 * above at this XML and it matches nothing and returns [] — which is
 * indistinguishable from "no videos this week" and would pass a green test
 * run while silently never sending a video again. Hence assertParsed() below:
 * a zero is only trusted when the raw XML genuinely has no entries.
 */
function parseAtomFeed(xml) {
  const videos = [];
  // Attribute-tolerant on the container: this feed is YouTube's to reshape,
  // not ours, and an <entry> that grows an xmlns must not silently match zero.
  const entryRe = /<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/g;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const tag = (name) => {
      const t = block.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
      return t ? unescapeXml(t[1].trim()) : '';
    };
    const linkM = block.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/);
    const thumbM = block.match(/<media:thumbnail[^>]*url="([^"]+)"/);
    const videoId = tag('yt:videoId');
    videos.push({
      videoId,
      title: tag('title'),
      link: linkM ? unescapeXml(linkM[1]) : `https://www.youtube.com/watch?v=${videoId}`,
      pubDate: new Date(tag('published')),
      // hqdefault is the 480x360 thumbnail YouTube always generates; the feed
      // gives it to us directly, so no guessing at the filename.
      thumbnail: thumbM ? unescapeXml(thumbM[1]) : '',
    });
  }
  return videos;
}

/**
 * Guard against a parser that has quietly stopped matching. If the raw feed
 * contains the container element but we extracted nothing from it, that is a
 * broken parser, not a quiet week — and the two look identical downstream.
 * Fail loudly instead of sending an email that is missing half its content.
 */
function assertParsed(kind, xml, parsed, container) {
  const raw = (xml.match(new RegExp(`<${container}[\\s>]`, 'g')) || []).length;
  if (raw > 0 && parsed.length === 0) {
    console.error(
      `${kind} parser matched 0 of ${raw} <${container}> elements in the feed. ` +
        `That is a parser fault, not a quiet week — refusing to compose.`
    );
    process.exit(1);
  }
  return parsed;
}

/**
 * Fetch a feed, honouring the test override. An override that is not http(s)
 * is read off disk, which is how the forged-feed cases are run.
 */
async function loadFeed(url, override) {
  const src = override || url;
  if (override && !/^https?:/.test(src)) {
    console.log(`Feed override (file): ${src}`);
    return readFileSync(src, 'utf8');
  }
  if (override) console.log(`Feed override (url): ${src}`);
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${src} → ${res.status}`);
  return res.text();
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

/**
 * Pick the subject's source deliberately. A post title beats a video title
 * because posts carry the sharper written hook, but on a video-only week
 * there is no week[0] to read — the old code would have thrown. Titles come
 * from the same author either way, so a video title is a fine hook.
 */
function subjectSource(posts, videos) {
  if (posts.length > 0) return posts[0].title;
  if (videos.length > 0) return videos[0].title;
  throw new Error('subjectSource called with nothing to send');
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

/**
 * Video card: clickable thumbnail, title, explicit watch link. The thumbnail
 * is wrapped in the link because most mail clients will not make a bare image
 * clickable, and the explicit text link is the fallback for anyone with
 * images turned off.
 */
function videoCard(v) {
  const thumb = v.thumbnail ? `[![${v.title}](${v.thumbnail})](${v.link})\n\n` : '';
  return `${thumb}### [${v.title}](${v.link})\n\n[Watch on YouTube →](${v.link})`;
}

function postCard(p) {
  return `### [${p.title}](${p.link})\n\n${cardDek(p.description)}`;
}

function composeBody(posts, videos) {
  const videoBlock = videos.map(videoCard).join('\n\n');
  const postBlock = posts.map(postCard).join('\n\n');
  const blocks = (VIDEO_FIRST ? [videoBlock, postBlock] : [postBlock, videoBlock]).filter(
    (b) => b.length > 0
  );
  const cards = blocks.join('\n\n---\n\n');
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

  const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const thisWeek = (list) =>
    list.filter((x) => x.pubDate.getTime() >= cutoff).sort((a, b) => b.pubDate - a.pubDate);

  let blogXml;
  try {
    blogXml = await loadFeed(FEED_URL, process.env.FIELD_REPORT_FEED);
  } catch (e) {
    console.error(`Blog feed fetch failed: ${e.message}`);
    process.exit(1);
  }
  const allPosts = assertParsed('RSS', blogXml, parseFeed(blogXml), 'item');
  const week = thisWeek(allPosts);

  // A YouTube outage should not silence a week that has a blog post in it, so
  // this failure is survivable where the blog feed's is not. It is still shouted
  // about: a swallowed video fetch is exactly how this feature would rot.
  let videos = [];
  try {
    const ytXml = await loadFeed(YT_FEED_URL, process.env.FIELD_REPORT_YT_FEED);
    const allVideos = assertParsed('Atom', ytXml, parseAtomFeed(ytXml), 'entry');
    console.log(`YouTube entries: ${allVideos.length}`);
    videos = thisWeek(allVideos);
  } catch (e) {
    console.error(`WARNING: YouTube feed unavailable (${e.message}) — composing without videos.`);
  }

  console.log(
    `Feed items: ${allPosts.length}; in the last ${WINDOW_DAYS} days: ` +
      `${week.length} post(s), ${videos.length} video(s)`
  );

  if (week.length === 0 && videos.length === 0) {
    console.log('Quiet week: no posts, no videos, no email. (Honesty bar: never filler.)');
    return;
  }

  const subject = subjectFor(subjectSource(week, videos));
  const body = composeBody(week, videos);

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
