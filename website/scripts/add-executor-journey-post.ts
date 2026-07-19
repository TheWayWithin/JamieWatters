/**
 * Upsert the /journey post
 *   "A friend said it was a business. I decided it was not, and built it anyway."
 * linked to the Executor File project.
 *
 * Default: writes an UNPUBLISHED DRAFT (published: false, publishedAt: null).
 * The public feeds, sitemap, RSS and static params filter `published: true`
 * (lib/database.ts) and the /journey/[slug] page 404s unpublished posts in
 * production, so a draft row is invisible on the live site. Preview it locally
 * with `npm run dev` at /journey/a-friend-said-it-was-a-business.
 *
 * To publish: run with --publish (sets published: true and stamps publishedAt),
 * or flip the toggle in /admin/content/posts. Publishing requires the deployed
 * site to be on a build that includes the published filter.
 *
 * Upserts on slug — safe to re-run, never touches other rows.
 * Run from website/: npx tsx scripts/add-executor-journey-post.ts [--publish]
 */

import { PrismaClient, ContentPillar, PostTypeEnum, TargetPersona } from '@prisma/client';
import { randomUUID } from 'crypto';
import { loadEnv } from './env';

loadEnv();

const prisma = new PrismaClient();

const PUBLISH = process.argv.includes('--publish');

const SLUG = 'a-friend-said-it-was-a-business';
const EXECUTOR_FILE_PROJECT_ID = '7db8f4aa-24d4-447a-97eb-53e1bffc3bf9';

// Verbatim approved copy (T-129). Paragraphs only; the page renders the title
// as its own H1, so the body must not repeat it. The two executorfile.com
// links are preserved as markdown links whose visible text is the URL.
const content = `A friend gave me an idea over a conversation: someone should build a proper way to sort out your affairs before you die, so your family is not left doing detective work. He thought it could be a business.

I have spent close to forty years around operations and resilience, so I did the unglamorous thing and assessed it properly before getting excited. The honest answer was: not a business, at least not a solo one.

Here is why, because the reasoning is more useful than the verdict.

The part everyone imagines charging for, telling the banks and utilities that someone has died, is already free. The UK government's Tell Us Once covers the public sector, and services like Settld and Life Ledger notify hundreds of companies at no cost to the family. The "keep all your accounts in one place" vault has a long graveyard behind it: dozens of digital-legacy startups have already shut down, taking their users' plans with them. And the genuinely hard part, chasing every provider to closure, is exactly what well-funded companies are building through insurers, at a scale a solo founder cannot match.

So as a venture, the evidence said park it. I did.

But one version of the idea survives all of that, and it is the version that does not need to be a business at all.

Everyone who dies leaves their family a map problem: what did they have, and what did they want done with it. No company needs to own that map. In fact a company owning it is the weakness, because the company can be sold, retired, or shut down while your family still needs it. The map just needs to be a file: encrypted, in open formats, with the key shared across people you trust, and one printed page that says how to open it.

That is a thing I could build in a way that is genuinely independent of me. So I did, and I made it free.

It is called Executor File. It is a plain, encrypted file listing every account, asset and liability with your instructions, plus one printed page for your executor. No account, no subscription, no server, no company that can fold. It opens with two standard, free tools, so it still works years from now even if I and the whole project have vanished.

The wider problem, and the honest landscape of what already exists, is written up here: [https://executorfile.com/learn/your-digital-estate](https://executorfile.com/learn/your-digital-estate)

And if you want to set one up for yourself, it takes about an hour: [https://executorfile.com/get-started](https://executorfile.com/get-started)

Not every good idea is a business. Some are just worth making.`;

const post = {
  title: 'A friend said it was a business. I decided it was not, and built it anyway.',
  excerpt:
    'A friend said it should be a business. I spent forty years around operations and resilience, so I assessed it honestly, decided it was not, and built it anyway, for free. Here is the reasoning, and why the map of your estate should be a file no company owns.',
  content,
  tags: ['open-source', 'digital-estate', 'building-in-public'],
  topics: ['open-source', 'business'],
  editorialType: 'essay',
  contentPillar: ContentPillar.JOURNEY,
  postTypeEnum: PostTypeEnum.GENERAL,
  targetPersona: TargetPersona.ALL,
  readTime: 3,
  postType: 'manual',
  projectId: EXECUTOR_FILE_PROJECT_ID,
  published: PUBLISH,
  publishedAt: PUBLISH ? new Date() : null,
  image: '/images/blog/2026-07-19-a-friend-said-it-was-a-business.png',
  imageAlt:
    'On a Deep Space navy background, a gold-edged card labelled ENCRYPTED REGISTER lists accounts, assets, liabilities and instructions, standing solid in front of three faint dashed cards labelled a service, a vault app and a startup that are fading away. Kicker: DIGITAL ESTATE. Headline: The map is a file. It outlasts every company that might have owned it.',
  imageCaption: null as string | null,
  updatedAt: new Date(),
};

async function main() {
  const before = await prisma.post.count();

  const result = await prisma.post.upsert({
    where: { slug: SLUG },
    update: post,
    create: { id: randomUUID(), slug: SLUG, ...post },
  });

  const after = await prisma.post.count();
  console.log(`Mode: ${PUBLISH ? 'PUBLISH' : 'DRAFT'}`);
  console.log(`Posts before: ${before}, after: ${after} (delta ${after - before})`);
  console.log(`Row id: ${result.id}`);
  console.log(`  slug: ${result.slug}`);
  console.log(`  published: ${result.published}  publishedAt: ${result.publishedAt?.toISOString() ?? 'null'}`);
  console.log(`  projectId: ${result.projectId}`);
  console.log(`  image: ${result.image}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
