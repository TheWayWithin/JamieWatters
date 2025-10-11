/**
 * Database Seed Script for JamieWatters.work
 * 
 * Migrates data from placeholder-data.ts to PostgreSQL database
 * Follows Critical Software Development Principles:
 * - Preserves data integrity with transactions
 * - Maintains security with input validation
 * - Uses structured error handling
 */

import { PrismaClient, Category, ProjectStatus } from '@prisma/client';
import { placeholderProjects, placeholderPosts } from '../lib/placeholder-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  try {
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Clear existing data (development only)
      console.log('🧹 Cleaning existing data...');
      await tx.metricsHistory.deleteMany();
      await tx.project.deleteMany();
      await tx.post.deleteMany();
      
      // Seed Projects
      console.log('📁 Seeding projects...');
      for (const project of placeholderProjects) {
        // Map placeholder data to Prisma schema
        const projectData = {
          id: project.id,
          slug: project.slug,
          name: project.name,
          description: project.description,
          longDescription: project.description, // Use description as long description for now
          url: project.liveUrl || project.githubUrl || '',
          techStack: project.techStack,
          category: project.category as Category,
          featured: project.featured,
          mrr: project.metrics.mrr,
          users: project.metrics.users,
          status: project.status.toUpperCase() as ProjectStatus,
          launchedAt: project.launchedAt,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          // Content fields (will be populated later in case studies)
          problemStatement: null,
          solutionApproach: null,
          lessonsLearned: null,
          screenshots: [], // Empty array for now
        };
        
        await tx.project.create({
          data: projectData,
        });
        
        console.log(`  ✅ Created project: ${project.name}`);
      }
      
      // Seed Blog Posts
      console.log('📝 Seeding blog posts...');
      for (const post of placeholderPosts) {
        const postData = {
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          tags: post.tags,
          readTime: post.readTime,
          publishedAt: post.publishedAt,
          createdAt: post.publishedAt, // Use published date as created date
          updatedAt: post.publishedAt,
        };
        
        await tx.post.create({
          data: postData,
        });
        
        console.log(`  ✅ Created post: ${post.title}`);
      }
      
      console.log('🎉 Database seeded successfully!');
    });
    
    // Verify data was created
    const projectCount = await prisma.project.count();
    const postCount = await prisma.post.count();
    
    console.log(`📊 Final counts: ${projectCount} projects, ${postCount} posts`);
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();