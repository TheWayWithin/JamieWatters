#!/usr/bin/env node
/**
 * Publish YouTube videos as /journey entries (T-401).
 *
 * Reads the channel Atom feed through the SHARED parser in
 * website/lib/youtube-feed.mjs and upserts one Post row per video, so a video
 * gets a permanent URL Jamie owns, an excerpt, topics, and a place in the RSS
 * feed alongside the written posts.
 *
 * A COMMAND, not a build-time writer. That was the open decision and this is
 * the answer, for three reasons:
 *   - a build that writes to the production database has a side effect nobody
 *     reading `next build` would expect, and every redeploy would rewrite rows
 *   - Vercel builds run on push; a YouTube outage mid-build would then be a
 *     deploy problem rather than a "run it again" problem
 *   - Jamie edits excerpts and topics after the fact, and a build-time writer
 *     would silently stamp on those edits on the next deploy
 *
 * WHAT HAPPENS WHEN HE RENAMES A VIDEO ON YOUTUBE: re-run this. The slug is
 * derived from the video ID, never the title, so the upsert finds the existing
 * row and refreshes the title. The URL does not move and no duplicate appears.
 * Topics and any hand-edited excerpt are preserved unless --refresh-excerpt is
 * passed, because clobbering Jamie's edit is worse than a stale first line.
 *
 * Usage:
 *   node scripts/videos/publish-videos.mjs --dry-run     show what would change
 *   node scripts/videos/publish-videos.mjs               upsert missing entries
 *   node scripts/videos/publish-videos.mjs --refresh-excerpt
 *                                                       also overwrite excerpts
 *
 * Env: DATABASE_URL (read from website/.env, same as the site). Never commit it.
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { randomUUID } from 'crypto';

import {
  fetchVideos,
  videoSlug,
  watchUrl,
  YT_CHANNEL_URL,
} from '../../website/lib/youtube-feed.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const websiteDir = join(here, '..', '..', 'website');

// The site's .env is the single source for DATABASE_URL; duplicating it into a
// second file is how the two drift and how a secret ends up somewhere it should
// not be. Parsed rather than sourced so this script needs no shell wrapper.
function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const p = join(websiteDir, name);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!m) continue;
      const key = m[1];
      let val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key] && val) process.env[key] = val;
    }
  }
}

/**
 * Strip the standing footer Jamie puts on every description. Those lines are
 * navigation for YouTube viewers and are noise on a /journey page, which has
 * its own header and footer doing the same job.
 */
function descriptionBody(description) {
  const paras = (description || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 0 &&
        !/^(Full write-up|More from me|Follow along)/i.test(s) &&
        !/^(X|LinkedIn|GitHub|Instagram|Threads|TikTok):\s*http/i.test(s)
    );
  return paras.join('\n\n');
}

/**
 * The body of the video's /journey page.
 *
 * This page exists because the RSS feed links here, so an RSS subscriber must
 * land on something real rather than a stub. It is a thumbnail, the
 * description, and a prominent way out to YouTube. Deliberately NO embedded
 * player: the decision that a video links out rather than plays in place holds
 * on this page too, not just on the cards.
 */
function pageBody(video) {
  const url = watchUrl(video.videoId);
  const body = descriptionBody(video.description);
  // NO thumbnail here. The post's `image` field carries it, and the detail page
  // already renders that as an optimised next/image hero above the body, so
  // embedding it again put the same picture on the page twice.
  return `**[Watch on YouTube →](${url})**\n\n${body ? `${body}\n` : ''}`;
}

/** First real paragraph of the description, as the card's dek. */
function excerptFrom(description, cap = 320) {
  const firstPara = (description || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .find((s) => s.length > 0 && !/^(Full write-up|More from me|Follow along|X:|LinkedIn:|GitHub:)/i.test(s));
  const s = (firstPara || '').replace(/\s+/g, ' ').trim();
  if (!s) return 'A new video from the channel.';
  if (s.length <= cap) return s;
  const head = s.slice(0, cap);
  const cut = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  return cut > 0 ? head.slice(0, cut + 1) : head.trimEnd() + '…';
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const refreshExcerpt = args.includes('--refresh-excerpt');

  loadEnv();
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set (looked in website/.env.local and website/.env).');
    process.exit(1);
  }

  const videos = await fetchVideos();
  console.log(`Channel ${YT_CHANNEL_URL}: ${videos.length} video(s) in the feed.`);
  // A zero here is only ever legitimate when the channel really is empty:
  // fetchVideos runs assertParsed, which throws instead of returning [] when
  // the feed holds entries the parser could not read.
  if (videos.length === 0) {
    console.log('Nothing to publish.');
    return;
  }

  const require = createRequire(join(websiteDir, 'package.json'));
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  try {
    for (const v of videos) {
      const slug = videoSlug(v.videoId);
      const existing = await prisma.post.findUnique({ where: { slug } });
      const excerpt = excerptFrom(v.description);

      if (!existing) {
        if (dryRun) {
          console.log(`CREATE ${slug} — "${v.title}"`);
        } else {
          // Upsert, not create. Two overlapping runs can both see "no existing
          // row" before either writes, and a bare create() would then crash the
          // second one on the unique slug constraint. `where: { slug }` makes
          // the write itself the arbiter, so a re-run is genuinely safe rather
          // than merely usually safe. The update branch is empty on purpose:
          // losing the race means the row is already correct.
          await prisma.post.upsert({
            where: { slug },
            update: {},
            create: {
              // randomUUID, matching every other Post-creating path in this
              // repo (the migration scripts and the admin API). The slug is the
              // stable key this script upserts on; making `id` a second copy of
              // it would break that convention for no gain.
              id: randomUUID(),
              slug,
              title: v.title,
              excerpt,
              content: pageBody(v),
              image: v.thumbnail || null,
              imageAlt: v.title,
              // readTime is a required Int and a video has no reading time.
              // 0 is the honest value; PostCard shows "Watch" instead of it.
              readTime: 0,
              published: true,
              publishedAt: v.pubDate,
              updatedAt: new Date(),
              postType: 'video',
              editorialType: 'video',
              // Topics stay empty rather than guessed. A wrong topic is worse
              // than none: it pollutes the topic pages, which are SEO surfaces.
              // Jamie sets them in the admin UI if he wants them.
              topics: [],
            },
          });
          console.log(`created ${slug} — "${v.title}"`);
        }
        created++;
        continue;
      }

      // Title and thumbnail always track YouTube: they are Jamie's to change
      // there and there is no competing edit on this side. Excerpt and body are
      // only refreshed on request, because those are the two fields he is
      // likely to have improved by hand and a routine re-run must not stamp on
      // that.
      const patch = {};
      if (existing.title !== v.title) patch.title = v.title;
      if (v.thumbnail && existing.image !== v.thumbnail) patch.image = v.thumbnail;
      if (refreshExcerpt) {
        if (existing.excerpt !== excerpt) patch.excerpt = excerpt;
        const body = pageBody(v);
        if (existing.content !== body) patch.content = body;
      }

      if (Object.keys(patch).length === 0) {
        unchanged++;
        continue;
      }
      if (dryRun) {
        console.log(`UPDATE ${slug} — ${Object.keys(patch).join(', ')}`);
      } else {
        patch.updatedAt = new Date();
        await prisma.post.update({ where: { slug }, data: patch });
        console.log(`updated ${slug} — ${Object.keys(patch).join(', ')}`);
      }
      updated++;
    }
  } finally {
    await prisma.$disconnect();
  }

  const verb = dryRun ? 'would be' : '';
  console.log(
    `\n${created} created ${verb}, ${updated} updated ${verb}, ${unchanged} already current.`
  );
  if (dryRun) console.log('Dry run: nothing was written.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
