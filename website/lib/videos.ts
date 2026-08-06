/**
 * Video data layer for the site (T-395).
 *
 * Reads the YouTube channel Atom feed through the SHARED parser in
 * lib/youtube-feed.mjs — the same module scripts/newsletter/field-report.mjs
 * imports, so the newsletter and the site can never disagree about what a
 * video is or which channel it came from.
 *
 * Fetching happens on the server, at build and then on the ISR schedule below.
 * Nothing here runs in the browser: a visitor never hits YouTube on our behalf,
 * so there is no per-visitor rate limit to trip.
 */
import {
  YT_CHANNEL_URL,
  YT_FEED_URL,
  parseAtomFeed,
  assertParsed,
  FeedParseError,
} from '@/lib/youtube-feed.mjs';
import { FEATURED_VIDEO_IDS } from '@/lib/featured-videos';

export interface Video {
  videoId: string;
  title: string;
  link: string;
  pubDate: Date;
  thumbnail: string;
  description: string;
}

export const CHANNEL_URL: string = YT_CHANNEL_URL;

/** Revalidate hourly, matching /journey. Uploads are not more frequent than that. */
export const VIDEO_REVALIDATE_SECONDS = 3600;

/**
 * Fetch every video in the channel feed (YouTube returns the latest 15).
 *
 * A feed that is unreachable returns [] and logs, so a YouTube outage degrades
 * the page to "no videos" rather than taking the whole site build down with it.
 * A feed that is REACHABLE but unparseable is a different thing entirely and is
 * rethrown: assertParsed only fires when the XML holds <entry> elements that the
 * parser could not read, which is a broken parser, not an empty channel. Letting
 * that pass as [] is the silent-zero this codebase keeps getting caught by.
 */
export async function getAllVideos(): Promise<Video[]> {
  let xml: string;
  try {
    const res = await fetch(YT_FEED_URL, {
      next: { revalidate: VIDEO_REVALIDATE_SECONDS },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    xml = await res.text();
  } catch (e) {
    console.error(
      `[videos] YouTube feed unreachable (${(e as Error).message}) — rendering without videos.`
    );
    return [];
  }

  try {
    return assertParsed('Atom', xml, parseAtomFeed(xml), 'entry') as Video[];
  } catch (e) {
    if (e instanceof FeedParseError) {
      console.error(`[videos] ${e.message}`);
      throw e;
    }
    throw e;
  }
}

/** The newest `count` videos, newest first. */
export async function getLatestVideos(count = 6): Promise<Video[]> {
  const all = await getAllVideos();
  return [...all].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime()).slice(0, count);
}

/**
 * Resolve Jamie's hand-picked IDs against the feed, preserving HIS order.
 *
 * An ID not present in the feed is dropped rather than rendered as a broken
 * card, but it is logged: a silently vanishing entry would leave him editing
 * the file and wondering why nothing changed. Note the feed only carries the
 * latest 15 uploads, so featuring an older video will not work — that is a
 * YouTube limit, and the log line says so.
 */
export async function getFeaturedVideos(all?: Video[]): Promise<Video[]> {
  const videos = all ?? (await getAllVideos());
  const byId = new Map(videos.map((v) => [v.videoId, v]));
  const resolved: Video[] = [];
  for (const id of FEATURED_VIDEO_IDS) {
    const hit = byId.get(id);
    if (hit) resolved.push(hit);
    else
      console.warn(
        `[videos] featured id "${id}" is not in the channel feed — skipped. ` +
          `(Check for a typo; note the feed only carries the latest 15 uploads.)`
      );
  }
  return resolved;
}
