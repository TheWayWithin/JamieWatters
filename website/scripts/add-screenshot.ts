import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addScreenshot() {
  try {
    // Find the Crypto Trading Agent project
    const project = await prisma.project.findFirst({
      where: {
        slug: 'crypto-trading-agent'
      }
    });

    if (!project) {
      console.error('❌ Project not found with slug: crypto-trading-agent');
      process.exit(1);
    }

    console.log(`Found project: ${project.name}`);
    console.log(`Current screenshots:`, project.screenshots);

    // Add the new screenshot
    const updatedScreenshots = [
      ...project.screenshots,
      '/images/projects/Trader-7.png'
    ];

    // Update the project
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        screenshots: updatedScreenshots
      }
    });

    console.log(`✅ Successfully added screenshot!`);
    console.log(`Updated screenshots:`, updated.screenshots);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addScreenshot();
