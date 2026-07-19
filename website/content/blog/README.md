# These markdown files are NOT the live posts

**Neon (the database) is the single source of truth for journey posts.**
The live site at `/journey/[slug]` renders from Neon via `lib/database.ts`.
It does **not** read these `.md` files.

So: **editing a file in this folder changes nothing on the site by itself.**
That surprise is exactly what issue JW-ISS-6 was about.

## What these files are

The `.md` files here are the **authoring source** for the posts that were
published before / during the Wave 3 migration. They are the thing `jpub`
reads to *push* a post into Neon. They are an input, not the record.

## How to change a live post (pick one)

1. **Ask Claude** — "update the journey post `same-tool-two-ways`, change X".
   Claude edits the markdown and re-runs `jpub` on it, which upserts the Neon
   row by slug. This is the default: you never have to remember a command.
2. **Edit in the admin UI** — `/admin` → Posts → edit → Save. Writes Neon
   directly. Good for a quick copy fix.
3. **Manually** (if you must): edit the `.md`, then run
   `jpub <path-to-file>.md` (or `npx tsx scripts/migrate-blog-to-neon.ts --apply`
   for these five legacy files). Nothing goes live until that runs.

## New posts

`jamie-content` writes a fresh markdown draft → `jpub` publishes it to Neon
(and uploads the hero image to R2). See `docs/blog-editing.md`.
