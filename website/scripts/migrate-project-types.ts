/**
 * Migration Script: Update Project Types
 *
 * This script migrates existing projects to their correct ProjectType values.
 * Run with: npx ts-node scripts/migrate-project-types.ts
 */

import { PrismaClient, ProjectType } from '@prisma/client';

const prisma = new PrismaClient();

// Project slug to ProjectType mapping
const PROJECT_TYPE_MAPPING: Record<string, ProjectType> = {
  // TRADING
  'crypto-trading-agent': ProjectType.TRADING,

  // SAAS
  'iso-tracker': ProjectType.SAAS,
  'aimpactscanner': ProjectType.SAAS,
  'aimpact-scanner': ProjectType.SAAS,
  'freecalchub': ProjectType.SAAS,
  'evolve-7': ProjectType.SAAS,
  'seo-agent': ProjectType.SAAS,

  // MARKETPLACE
  'solomarketwork': ProjectType.MARKETPLACE,
  'solomarket': ProjectType.MARKETPLACE,

  // CONTENT
  'ai-search-mastery': ProjectType.CONTENT,
  'asmge': ProjectType.CONTENT,
  'llmtxtmastery': ProjectType.CONTENT,
  'aisearchmastery': ProjectType.CONTENT,

  // PERSONAL
  'jamiewatterswork': ProjectType.PERSONAL,
  'jamiewatters-work': ProjectType.PERSONAL,
  'jamie-watters': ProjectType.PERSONAL,

  // OPEN_SOURCE
  'bos-ai': ProjectType.OPEN_SOURCE,
  'agent-11': ProjectType.OPEN_SOURCE,
  'master-ai': ProjectType.OPEN_SOURCE,
  'master-ai-framework': ProjectType.OPEN_SOURCE,
};

async function migrate() {
  console.log('Starting project type migration...\n');

  // Get all existing projects
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      projectType: true,
    },
  });

  console.log(`Found ${projects.length} projects to check:\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const project of projects) {
    // Check if we have a mapping for this project
    const newType = PROJECT_TYPE_MAPPING[project.slug];

    if (newType) {
      if (project.projectType !== newType) {
        // Update the project type
        await prisma.project.update({
          where: { id: project.id },
          data: { projectType: newType },
        });
        console.log(`✅ Updated: ${project.name}`);
        console.log(`   Slug: ${project.slug}`);
        console.log(`   ${project.projectType} → ${newType}\n`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped (already correct): ${project.name}`);
        console.log(`   Type: ${project.projectType}\n`);
        skippedCount++;
      }
    } else {
      console.log(`⚠️  No mapping found: ${project.name}`);
      console.log(`   Slug: ${project.slug}`);
      console.log(`   Current type: ${project.projectType}`);
      console.log(`   (Add to PROJECT_TYPE_MAPPING if needed)\n`);
    }
  }

  console.log('Migration complete!');
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${skippedCount}`);
  console.log(`  Total: ${projects.length}`);
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
