/**
 * Featured videos — Jamie's hand-picked set (T-395).
 *
 * ================== THIS IS THE FILE YOU EDIT ==================
 * Paste up to three YouTube video IDs below and save. Nothing else to do:
 * no CMS, no admin screen, no database, no deploy step beyond the usual push.
 *
 * The ID is the bit after `v=` in a watch URL:
 *   https://www.youtube.com/watch?v=1abfHGdU56w
 *                                   ^^^^^^^^^^^ this
 *
 * Order here is the order shown. An empty list is fine and expected early on:
 * /videos simply drops the Featured section and leads with Latest.
 * ===============================================================
 *
 * Why hand-picked rather than newest-first: the most recent upload is rarely
 * the best introduction to a channel, and a latest-only page sells the back
 * catalogue short. Latest answers "is this alive", featured answers "is this
 * for me".
 *
 * IDs that are not in the channel feed are ignored rather than rendered as a
 * broken card — see resolveFeatured() in lib/videos.ts, which also logs them
 * so a typo does not just vanish silently.
 */
export const FEATURED_VIDEO_IDS: string[] = [
  // '1abfHGdU56w',   // Six AIs Said Graphify Uploads Your Code. I Checked.
];
