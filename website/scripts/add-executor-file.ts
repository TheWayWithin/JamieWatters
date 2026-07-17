/**
 * One-off, idempotent: add the Executor File product row (T-154).
 *
 * Upserts on slug "executor-file" — safe to re-run, never touches other rows.
 * Run from website/: npx tsx scripts/add-executor-file.ts
 * Never run prisma/seed.ts for this — the seed deleteMany()s the whole table.
 */

import { PrismaClient, Category, ProjectStatus, ProjectType, ProjectPhase } from '@prisma/client';
import { randomUUID } from 'crypto';
import { loadEnv } from './env';

loadEnv();

const prisma = new PrismaClient();

const row = {
  name: 'Executor File',
  description:
    'Everything your executor will need, in one encrypted file. A self-hosted register of accounts, assets and liabilities, with no credentials stored and no service to die.',
  longDescription: `Executor File is a file, not an app. One encrypted register that lets an executor find every account, asset and liability a person owns, and know what they wanted done with each one.

Credentials are never stored. The file is encrypted with age and split into 2-of-3 Shamir shares, so no single copy is a risk and no single loss is fatal. Recovery needs only two standard open-source tools, forever: no accounts, no subscription, no company that can disappear with your estate plan.

v0.3, the Executor Release, adds schema v3, an executor triage report, a generated two-page printed guide, fire-drill and rotation tooling, and Windows recovery via WSL. 115 scripted tests run green on macOS and Ubuntu CI. Five independent LLM reviews scored it between 8.5 and 9.1 out of 10.`,
  url: 'https://github.com/TheWayWithin/executor-file',
  githubUrl: 'https://github.com/TheWayWithin/executor-file',
  techStack: [
    'Bash/POSIX sh',
    'awk',
    'age (encryption)',
    'ssss (Shamir)',
    'Python (optional strict tier)',
    'GitHub Actions',
  ],
  category: Category.FINANCE,
  featured: false,
  mrr: 0,
  users: 0,
  status: ProjectStatus.BETA,
  projectType: ProjectType.OPEN_SOURCE,
  currentPhase: ProjectPhase.MVP,
  launchedAt: new Date('2026-07-16T00:00:00Z'),
  nextProofPoint:
    'v0.3.0 tag: Windows dry run by a non-author, plus a physical fire drill',
  problemStatement: `When someone dies, their executor typically spends months discovering what they owned. Old pensions go unclaimed, crypto is lost forever, and the people left behind do detective work while grieving. The information existed; it lived in one person's head.`,
  solutionApproach: `One encrypted register plus printed instructions. The register holds every account, asset and liability with the owner's wishes for each; credentials are never stored, so it is safe to keep and to hand over. Encryption is age with 2-of-3 Shamir shares, and recovery needs only two standard open-source tools, so there is no service dependency and nothing to outlive its owner.`,
  lessonsLearned: `Born on 16 July 2026 as the winning arm of a build experiment: the same product built twice from the same spec, once goal-first from a single prompt, once agent-led from a full PRD. The goal-first build won on effort, maintainability and speed, with correctness tied, and shipped v0.2 the same day. v0.3, the Executor Release, followed a day later. The release gate is deliberately human: a Windows dry run by a non-author and a physical fire drill, because a recovery tool nobody has rehearsed is a promise, not a plan.`,
  customMetrics: {
    githubStars: 0,
    forks: 0,
    contributors: 1,
    weeklyDownloads: 0,
  },
  timelineEvents: [
    {
      date: '2026-07-16',
      event: 'First commit, and v0.2 shipped the same day',
      description:
        'Won a goal-first vs agent-led A/B build of the same spec; the goal-first arm became the product.',
      phase: 'MVP',
    },
    {
      date: '2026-07-17',
      event: 'v0.3 "Executor Release" built',
      description:
        'Schema v3, executor triage report, two-page printed guide, fire-drill and rotation tooling, Windows recovery via WSL. 115 scripted tests green on macOS and Ubuntu CI.',
      phase: 'MVP',
    },
  ],
  updatedAt: new Date(),
};

async function main() {
  const before = await prisma.project.count();

  const result = await prisma.project.upsert({
    where: { slug: 'executor-file' },
    update: row,
    create: { id: randomUUID(), slug: 'executor-file', ...row },
  });

  const after = await prisma.project.count();
  console.log(`Projects before: ${before}, after: ${after} (delta ${after - before})`);
  console.log(`Row id: ${result.id}`);
  console.log(`  ${result.name} · ${result.status} · ${result.category} · ${result.projectType}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
