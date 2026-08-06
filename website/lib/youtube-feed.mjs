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
