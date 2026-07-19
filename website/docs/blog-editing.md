# Editing and publishing journey posts

**Source of truth: Neon (the database).** Resolved under JW-ISS-6 (Option B),
2026-07-19.

The public site renders posts from Neon. `content/blog/*.md` files are an
authoring/input format, not the live record. This doc is the one place that
says how content actually flows, so the "I edited the file and nothing changed"
trap never comes back.

## The model

```
markdown draft  --(jpub / migrate script / admin UI)-->  Neon row  -->  /journey/[slug]
   (input)                                              (canonical)      (what visitors see)
```

- `lib/database.ts` reads Neon. The journey route uses it. It never reads files.
- `lib/blog.ts` (the old filesystem parser) is imported only by
  `scripts/migrate-blog-to-neon.ts`. No live route depends on it.
- `jpub` (`~/shared/tools/jamie-publish/jpub.js`) upserts a post into Neon by
  slug (`create` if new, `update` if the slug exists) and uploads the hero
  image to Cloudflare R2.

## Publish a NEW post

1. `jamie-content` produces the markdown draft (frontmatter + body).
2. `jpub <file>.md` publishes it to Neon and R2. Live in seconds (ISR
   revalidates). No site rebuild.

## Change a LIVE post — pick one

1. **Ask Claude** (default). "Update journey post `<slug>`: <change>." Claude
   edits the markdown and re-runs `jpub`, which updates the Neon row by slug.
   Nothing to remember.
2. **Admin UI**. `/admin` → Posts → edit → Save. Writes Neon directly. Best for
   a quick copy fix.
3. **Manual**. Edit the `.md`, then `jpub <file>.md`. The edit is not live until
   jpub runs. For the five pre-Wave-3 legacy files you can instead run
   `npx tsx scripts/migrate-blog-to-neon.ts --apply` (upsert by slug).

## Why Neon and not files (the JW-ISS-6 decision)

Keeping Neon canonical matches how the site already works and how `jpub` already
publishes: instant updates, no rebuild, and posts keep their relational link to
products (`Post.projectId`) plus view counts and the admin editor. The cost is
that content is edited through jpub/admin, not by hand-editing a repo file. That
trade is accepted; this doc + `content/blog/README.md` make the file's role
explicit so the two-sources confusion can't recur.
