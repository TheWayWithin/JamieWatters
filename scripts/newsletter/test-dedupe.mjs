#!/usr/bin/env node
/**
 * Regression test for the newsletter's video dedupe (T-401).
 *
 * WHY THIS FILE EXISTS: since videos became /journey entries they appear in
 * /rss.xml as well as in the YouTube feed, and field-report.mjs reads both. The
 * filter that stops each video being announced twice is invisible when it works
 * and produces a merely slightly-odd email when it breaks, which is exactly the
 * kind of fault nobody notices for months. It gets a test.
 *
 * Run: node scripts/newsletter/test-dedupe.mjs      (exit 0 pass, 1 fail)
 * No network, no database, no API keys — pure feed fixtures through the real
 * script in --dry-run mode.
 */

import { execFileSync } from 'child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { videoSlug, isVideoPostLink, videoIdFromSlug } from '../../website/lib/youtube-feed.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(here, 'field-report.mjs');
const VID = '1abfHGdU56w';
const OTHER = 'ZZtestZZ999';

const dir = mkdtempSync(join(tmpdir(), 'fr-dedupe-'));
let failures = 0;

function check(name, cond, detail = '') {
  if (cond) console.log(`  PASS  ${name}`);
  else {
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
    failures++;
  }
}

/** An RSS feed whose items are given as {title, slug, when}. */
function rss(items) {
  const body = items
    .map(
      (i) => `<item><title>${i.title}</title>` +
        `<link>https://jamiewatters.work/journey/${i.slug}</link>` +
        `<pubDate>${i.when.toUTCString()}</pubDate>` +
        `<description>${i.desc || 'x'}</description></item>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>${body}</channel></rss>`;
}

/** A YouTube Atom feed from {id, title, when}. */
function atom(entries) {
  const body = entries
    .map(
      (e) => `<entry><id>yt:video:${e.id}</id><yt:videoId>${e.id}</yt:videoId>` +
        `<title>${e.title}</title>` +
        `<link rel="alternate" href="https://www.youtube.com/watch?v=${e.id}"/>` +
        `<published>${e.when.toISOString()}</published>` +
        `<media:group><media:thumbnail url="https://i2.ytimg.com/vi/${e.id}/hqdefault.jpg"/>` +
        `</media:group></entry>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015" xmlns:media="http://search.yahoo.com/mrss/" xmlns="http://www.w3.org/2005/Atom">${body}</feed>`;
}

function run(rssXml, atomXml) {
  const r = join(dir, 'rss.xml');
  const a = join(dir, 'atom.xml');
  writeFileSync(r, rssXml);
  writeFileSync(a, atomXml);
  return execFileSync('node', [SCRIPT, '--dry-run'], {
    encoding: 'utf8',
    env: { ...process.env, FIELD_REPORT_FEED: r, FIELD_REPORT_YT_FEED: a },
  });
}

const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const videoPost = { title: 'Six AIs Said Graphify Uploads Your Code', slug: videoSlug(VID), when: recent };
const writtenPost = { title: 'A Written Post', slug: 'a-written-post', when: recent };

console.log('slug helpers');
check('videoSlug shape', videoSlug(VID) === `video-${VID}`);
check('round-trips through videoIdFromSlug', videoIdFromSlug(videoSlug(VID)) === VID);
check('recognises a video journey link', isVideoPostLink(`https://x/journey/${videoSlug(VID)}`));
check('ignores a written journey link', !isVideoPostLink('https://x/journey/a-written-post'));

// A written post can legitimately slugify to something starting with "video-".
// The id must look like a real YouTube id (11 chars of [A-Za-z0-9_-]) or the
// dedupe would be resting on a coincidence rather than on a rule.
check(
  'a "Video Games..." post is not mistaken for a video',
  !isVideoPostLink('https://x/journey/video-games-and-why-they-teach-focus')
);
check('videoIdFromSlug rejects a non-id tail', videoIdFromSlug('video-games-and-why') === null);
check('videoIdFromSlug accepts ids with - and _', videoIdFromSlug('video-a_b-c1D2e3F') === 'a_b-c1D2e3F');
check('videoIdFromSlug rejects a 10-char tail', videoIdFromSlug('video-abcdefghij') === null);

console.log('\nthe double-count itself');
{
  // The whole point: the video is in BOTH feeds. It must be announced once.
  const out = run(rss([videoPost, writtenPost]), atom([{ id: VID, title: 'Six AIs Said Graphify Uploads Your Code', when: recent }]));
  const watchLinks = (out.match(/watch\?v=1abfHGdU56w/g) || []).length;
  const journeyLinks = (out.match(new RegExp(`/journey/video-${VID}`, 'g')) || []).length;
  check('one post survives (the written one)', /1 post\(s\), 1 video\(s\)/.test(out), out.match(/in the last.*/)?.[0]);
  check('the video post was deduped', /Deduped 1 video post/.test(out));
  check('video appears exactly once, as a video card', watchLinks >= 1 && journeyLinks === 0,
    `watch=${watchLinks} journey=${journeyLinks}`);
  check('the written post is untouched', out.includes('/journey/a-written-post'));
}

console.log('\nthe outage case — the reason this is not a blanket filter');
{
  // YouTube unreachable: the video block is empty, so the POST is the only
  // remaining mention and must NOT be dropped. A naive "filter anything that
  // looks like a video" loses the video entirely here.
  const out = run(rss([videoPost]), atom([]));
  check('video post survives when no video covers it', /1 post\(s\), 0 video\(s\)/.test(out),
    out.match(/in the last.*/)?.[0]);
  check('it still sends rather than skipping', !/Quiet week/.test(out));
}

console.log('\na different video in the feed must not dedupe this post');
{
  const out = run(rss([videoPost]), atom([{ id: OTHER, title: 'Unrelated', when: recent }]));
  check('non-matching id leaves the post alone', /1 post\(s\), 1 video\(s\)/.test(out),
    out.match(/in the last.*/)?.[0]);
}

console.log('\na renamed video must still dedupe (id, not title)');
{
  const out = run(
    rss([{ ...videoPost, title: 'The Old Title Jamie Has Since Changed' }]),
    atom([{ id: VID, title: 'A Completely Different Title Now', when: recent }])
  );
  check('dedupes on id despite the title mismatch', /0 post\(s\), 1 video\(s\)/.test(out),
    out.match(/in the last.*/)?.[0]);
}

rmSync(dir, { recursive: true, force: true });
console.log(failures === 0 ? '\nAll dedupe checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
