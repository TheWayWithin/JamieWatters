import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function analyzeProjects() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      url: true,
      status: true,
      projectType: true,
      mrr: true,
      users: true,
      customMetrics: true,
      problemStatement: true,
      solutionApproach: true,
      lessonsLearned: true,
      screenshots: true,
      timelineEvents: true,
      currentPhase: true,
      techStack: true,
      launchedAt: true,
      _count: { select: { posts: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('=== PROJECT ANALYSIS ===\n');

  for (const p of projects) {
    const missing: string[] = [];
    const has: string[] = [];

    // Check each field
    if (p.longDescription) has.push('longDescription');
    else missing.push('longDescription');

    if (p.problemStatement) has.push('problemStatement');
    else missing.push('problemStatement');

    if (p.solutionApproach) has.push('solutionApproach');
    else missing.push('solutionApproach');

    if (p.lessonsLearned) has.push('lessonsLearned');
    else missing.push('lessonsLearned');

    if (p.screenshots && p.screenshots.length > 0) has.push(`screenshots(${p.screenshots.length})`);
    else missing.push('screenshots');

    if (p.timelineEvents && Array.isArray(p.timelineEvents) && p.timelineEvents.length > 0) has.push('timelineEvents');
    else missing.push('timelineEvents');

    if (p.currentPhase) has.push('currentPhase');
    else missing.push('currentPhase');

    if (p.launchedAt) has.push('launchedAt');
    else missing.push('launchedAt');

    // Check metrics based on project type
    const customMetrics = p.customMetrics as Record<string, number> | null;
    const hasCustomMetrics = customMetrics && Object.keys(customMetrics).length > 0;
    const hasLegacyMetrics = Number(p.mrr) > 0 || p.users > 0;
    if (hasCustomMetrics || hasLegacyMetrics) {
      has.push('metrics');
    } else {
      missing.push('metrics');
    }

    const completeness = Math.round((has.length / (has.length + missing.length)) * 100);
    const statusEmoji = completeness >= 80 ? '✅' : completeness >= 50 ? '🟡' : '🔴';

    console.log(`${statusEmoji} ${p.name}`);
    console.log(`   Status: ${p.status} | Type: ${p.projectType || 'SAAS'} | Posts: ${p._count.posts}`);
    console.log(`   Completeness: ${completeness}%`);
    if (has.length > 0) console.log(`   ✓ Has: ${has.join(', ')}`);
    if (missing.length > 0) console.log(`   ✗ Missing: ${missing.join(', ')}`);
    console.log('');
  }

  await prisma.$disconnect();
}

analyzeProjects();
