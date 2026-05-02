# Blog Hero Images

Blog posts at `/journey/<slug>` support an optional hero image shown at the top of the post, as a thumbnail on the list page, and as the social preview card on LinkedIn/X/Facebook.

## Workflow

1. **Drop the image file** into `website/public/images/blog/` (one image per post). Name it after the slug, e.g. `contact-is-the-test.webp`.
2. **Set three fields** on the post when publishing via `jpub`:
   - `image` — path to the file, e.g. `/images/blog/contact-is-the-test.webp`
   - `imageAlt` — short description for accessibility and SEO
   - `imageCaption` — optional caption shown below the image (italic, centred)
3. **Commit the image file** to the repo. Netlify serves it from the `public/` folder.

## Specs

- **Aspect ratio**: 16:9
- **Dimensions**: 1600 × 900 (exactly)
- **Format**: WebP preferred (JPEG or PNG also work)
- **File size**: target ≤150 KB; hard cap 300 KB
- **Subject**: make sure the important content sits in the centre — the thumbnail and social card both crop from centre

## Backwards compatibility

Posts published without any of these fields render exactly as they did before — no hero image, no thumbnail, and the social preview falls back to the branded dynamic card at `/og?type=post&title=...`.

## Database

Three nullable columns on the `Post` table:

| Field | Type | Required |
|---|---|---|
| `image` | text | no |
| `imageAlt` | text | no |
| `imageCaption` | text | no |

Added via `prisma db push` on 2026-04-18. If you regenerate the Prisma client elsewhere, run `npx prisma generate` in `website/` to pick up the new types.

## Netlify deploy

No manual steps. Netlify's Next.js adapter handles `<Image>` optimisation automatically — images are served as WebP/AVIF with appropriate sizes for the viewport. The `/images/*` path already has immutable cache headers in `next.config.js`.

## Where it shows up

- **Post page** (`app/journey/[slug]/page.tsx`): between the tags and the post body, with caption below if set
- **List page** (`app/journey/page.tsx` via `components/blog/PostCard.tsx`): 16:9 thumbnail at the top of each card
- **Open Graph** (LinkedIn/Facebook): absolute URL of the image
- **Twitter card**: same absolute URL, `summary_large_image` format
- **JSON-LD BlogPosting schema**: `image` field set (required for Google rich results)
