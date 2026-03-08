import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  try {
    // First find all projects to see slugs
    const all = await prisma.project.findMany({
      select: { id: true, name: true, slug: true }
    });

    console.log('All project slugs:');
    all.forEach(p => console.log(`  ${p.slug} -> ${p.name}`));

    // Find JamieWatters project by name
    const project = await prisma.project.findFirst({
      where: { name: { contains: 'Jamie' } }
    });

    if (!project) {
      console.log('\nProject not found!');
      return;
    }

    console.log('\n=== JamieWatters.work ===');
    console.log('ID:', project.id);
    console.log('Slug:', project.slug);
    console.log('Name:', project.name);
    console.log('Status:', project.status);
    console.log('Type:', project.projectType);
    console.log('URL:', project.url);
    console.log('Tech Stack:', JSON.stringify(project.techStack));
    console.log('Launched:', project.launchedAt);
    console.log('');
    console.log('=== CURRENT CONTENT ===');
    console.log('Description:', project.description?.substring(0, 100) + '...');
    console.log('Long Desc:', project.longDescription ? 'YES (' + project.longDescription.length + ' chars)' : 'EMPTY');
    console.log('Problem:', project.problemStatement ? 'YES' : 'EMPTY');
    console.log('Solution:', project.solutionApproach ? 'YES' : 'EMPTY');
    console.log('Lessons:', project.lessonsLearned ? 'YES' : 'EMPTY');
    console.log('Screenshots:', project.screenshots?.length || 0);
    console.log('Timeline:', project.timelineEvents ? 'YES' : 'EMPTY');
    console.log('Phase:', project.currentPhase || 'NOT SET');
    console.log('');
    console.log('=== METRICS ===');
    console.log('MRR:', project.mrr);
    console.log('Users:', project.users);
    console.log('Custom:', JSON.stringify(project.customMetrics));

    // Show full case study content
    console.log('\n=== FULL CASE STUDY CONTENT ===');
    console.log('\n--- Long Description ---');
    console.log(project.longDescription || '(empty)');
    console.log('\n--- Problem Statement ---');
    console.log(project.problemStatement || '(empty)');
    console.log('\n--- Solution Approach ---');
    console.log(project.solutionApproach || '(empty)');
    console.log('\n--- Lessons Learned ---');
    console.log(project.lessonsLearned || '(empty)');

  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
