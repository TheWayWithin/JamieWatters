/**
 * Jamie's YouTube channel feed — the ONE parser (T-395).
 *
 * Written as plain ESM, not TypeScript, on purpose. Two consumers need it and
 * they live either side of a build boundary:
 *
 *   - website/           the Next app (imports this directly; tsconfig has
 *                        allowJs, so the JSDoc types below are what it sees)
 *   - scripts/newsletter/field-report.mjs
 *                        a standalone Node script run by cron, with no
 *                        TypeScript toolchain of its own
 *
 * A .ts module could not be imported by the script without adding a build step
 * to a cron job, and a second copy of the parser is exactly the failure this
 * change exists to prevent — the newsletter's video support (T-394) and the
 * site's would drift apart and break differently. Plain .mjs is the only form
 * both sides can read as-is, so it lives here and the script reaches up to it.
 *
 * YouTube publishes ATOM, not RSS: <entry> not <item>, <published> not
 * <pubDate>, and the link is an attribute on <link rel="alternate"> rather
 * than element text. Do not point an RSS parser at it.
 */

// Resolved 2026-08-06 from the <link rel="canonical"> of
// https://www.youtube.com/@jamiewatterswork, and confirmed against that page's
// own rel="alternate" RSS link. Hardcoded deliberately: resolving the handle at
// run time would mean scraping a page YouTube reshapes often, and the Data API
// would add a credential to rotate for information that never changes.
export const YT_CHANNEL_ID = 'UCHSxwrlJi13UOUm_WKVlhCg';
export const YT_CHANNEL_URL = 'https://www.youtube.com/@jamiewatterswork';
export const YT_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`;

/** Thrown when a feed holds container elements but none of them parse. */
export class FeedParseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FeedParseError';
  }
}

export function unescapeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * @typedef {Object} Video
 * @property {string} videoId
 * @property {string} title
 * @property {string} link       canonical watch URL
 * @property {Date}   pubDate
 * @property {string} thumbnail  YouTube CDN URL, hotlinked — never mirrored
 * @property {string} description
 */

/**
 * Parse a YouTube channel Atom feed.
 * @param {string} xml
 * @returns {Video[]} newest first, as YouTube orders them
 */
export function parseAtomFeed(xml) {
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
      // hqdefault is the 480x360 still YouTube always generates, and the feed
      // hands us the URL directly, so no guessing at the filename.
      thumbnail: thumbM ? unescapeXml(thumbM[1]) : '',
      description: tag('media:description'),
    });
  }
  return videos;
}

/**
 * Guard against a parser that has quietly stopped matching. If the raw feed
 * contains the container element but nothing was extracted, that is a broken
 * parser, not an empty channel — and downstream the two are indistinguishable.
 *
 * THROWS rather than exiting, so each caller decides what loud means: the
 * newsletter script exits non-zero, and the site fails the build (or, during
 * revalidation, keeps serving the last good page). A module that called
 * process.exit() would take the web server down with it.
 *
 * @throws {FeedParseError}
 */
export function assertParsed(kind, xml, parsed, container) {
  const raw = (xml.match(new RegExp(`<${container}[\\s>]`, 'g')) || []).length;
  if (raw > 0 && parsed.length === 0) {
    throw new FeedParseError(
      `${kind} parser matched 0 of ${raw} <${container}> elements in the feed. ` +
        `That is a parser fault, not an empty channel — refusing to continue.`
    );
  }
  return parsed;
}

/**
 * The slug a video's /journey entry gets: `video-<videoId>` (T-401).
 *
 * Derived from the video ID rather than the title, on purpose. The title is
 * Jamie's to change on YouTube whenever he likes, and a title-derived slug
 * would either break the permanent URL or silently fork into a second entry on
 * the next publish run. The ID never changes, so re-running the publisher after
 * a rename updates the existing row instead of creating a duplicate.
 *
 * It also makes a video entry recognisable ANYWHERE the slug travels, including
 * the RSS feed, which is what stops the newsletter double-counting: /rss.xml
 * only carries title, link, pubDate and description, so the slug in the link is
 * the one durable marker available to a consumer that never touches the
 * database. Change this shape and isVideoPostLink below must change with it.
 */
export function videoSlug(videoId) {
  return `video-${videoId}`;
}

/**
 * A YouTube video id: exactly 11 characters of [A-Za-z0-9_-].
 *
 * Matching the real shape rather than "anything after video-" matters, because
 * a written post could legitimately slugify to something with that prefix. A
 * post titled "Video Games And Why They Teach Focus" becomes
 * `video-games-and-why-they-teach-focus`, and a loose pattern would read that
 * as a video with the id "games-and-why-they-teach-focus". Nothing downstream
 * would have matched it against a real video, so it was inert, but the dedupe's
 * correctness should not rest on a coincidence.
 */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/** Recover the YouTube video ID from a slug this module produced, else null. */
export function videoIdFromSlug(slug) {
  const m = /^video-(.+)$/.exec(slug || '');
  return m && VIDEO_ID.test(m[1]) ? m[1] : null;
}

/** The canonical watch URL for a video ID. */
export function watchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * True if an RSS <link> points at a video's /journey entry.
 *
 * This is the newsletter's dedupe predicate. It is intentionally structural
 * (a slug shape) rather than heuristic (matching titles), because Jamie editing
 * a YouTube title must not resurrect the double-count.
 */
export function isVideoPostLink(link) {
  const m = /\/journey\/(video-[^/]+)\/?$/.exec(link || '');
  return Boolean(m && videoIdFromSlug(m[1]));
}

/**
 * Fetch and parse the channel feed.
 * @param {{fetchOptions?: RequestInit, feedUrl?: string}} [opts]
 * @returns {Promise<Video[]>}
 */
export async function fetchVideos(opts = {}) {
  const url = opts.feedUrl || YT_FEED_URL;
  const res = await fetch(url, opts.fetchOptions);
  if (!res.ok) throw new Error(`YouTube feed ${url} → ${res.status}`);
  const xml = await res.text();
  return assertParsed('Atom', xml, parseAtomFeed(xml), 'entry');
}
