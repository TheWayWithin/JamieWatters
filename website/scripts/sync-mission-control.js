#!/usr/bin/env node
/**
 * Sync Mission Control data from Clawdbot to jamiewatters.work database
 * Run via: node scripts/sync-mission-control.js
 * Or add to heartbeat for periodic sync
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const CLAWD_DIR = '/home/ubuntu/clawd';

async function syncScheduledTasks() {
  console.log('📅 Syncing scheduled tasks...');
  
  try {
    // Read cron jobs from Clawdbot via CLI
    const { execSync } = require('child_process');
    const cronOutput = execSync('clawdbot cron list --json 2>/dev/null || echo "[]"', { 
      encoding: 'utf8',
      timeout: 10000 
    });
    
    let jobs = [];
    try {
      const parsed = JSON.parse(cronOutput);
      jobs = parsed.jobs || parsed || [];
    } catch (e) {
      console.log('  ⚠️ Could not parse cron output, skipping');
      return 0;
    }

    let synced = 0;
    for (const job of jobs) {
      const schedule = job.schedule?.expr || job.schedule?.kind || 'unknown';
      const timezone = job.schedule?.tz || 'UTC';
      
      await prisma.agentSchedule.upsert({
        where: { jobId: job.id },
        update: {
          name: job.name,
          schedule: schedule,
          timezone: timezone,
          nextRunAt: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs) : null,
          lastRunAt: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs) : null,
          lastStatus: job.state?.lastStatus || null,
          enabled: job.enabled !== false,
          syncedAt: new Date(),
        },
        create: {
          jobId: job.id,
          name: job.name,
          schedule: schedule,
          timezone: timezone,
          nextRunAt: job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs) : null,
          lastRunAt: job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs) : null,
          lastStatus: job.state?.lastStatus || null,
          enabled: job.enabled !== false,
          syncedAt: new Date(),
        },
      });
      synced++;
    }
    
    console.log(`  ✅ Synced ${synced} scheduled tasks`);
    return synced;
  } catch (error) {
    console.error('  ❌ Error syncing scheduled tasks:', error.message);
    return 0;
  }
}

async function syncTasks() {
  console.log('📋 Syncing tasks...');
  
  try {
    const tasksPath = path.join(CLAWD_DIR, 'TASKS.md');
    if (!fs.existsSync(tasksPath)) {
      console.log('  ⚠️ TASKS.md not found, skipping');
      return 0;
    }

    const content = fs.readFileSync(tasksPath, 'utf8');
    const lines = content.split('\n');
    
    // Clear existing tasks and re-sync
    await prisma.agentTask.deleteMany({});
    
    let currentSection = 'Uncategorized';
    let sortOrder = 0;
    let synced = 0;

    for (const line of lines) {
      // Section headers (## or ###)
      const sectionMatch = line.match(/^#{2,3}\s+(.+)/);
      if (sectionMatch) {
        currentSection = sectionMatch[1].trim();
        continue;
      }

      // Task items (- [ ] or - [x])
      const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
      if (taskMatch) {
        const completed = taskMatch[1].toLowerCase() === 'x';
        const taskContent = taskMatch[2].trim();
        
        await prisma.agentTask.create({
          data: {
            section: currentSection,
            content: taskContent,
            completed: completed,
            sortOrder: sortOrder++,
            syncedAt: new Date(),
          },
        });
        synced++;
      }
    }
    
    console.log(`  ✅ Synced ${synced} tasks`);
    return synced;
  } catch (error) {
    console.error('  ❌ Error syncing tasks:', error.message);
    return 0;
  }
}

async function syncMemory() {
  console.log('🧠 Syncing memory files...');
  
  try {
    const memoryDir = path.join(CLAWD_DIR, 'memory');
    if (!fs.existsSync(memoryDir)) {
      console.log('  ⚠️ memory/ directory not found, skipping');
      return 0;
    }

    const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
    let synced = 0;

    for (const filename of files) {
      const filePath = path.join(memoryDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Extract date from filename (e.g., 2026-02-07.md)
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      const fileDate = dateMatch ? new Date(dateMatch[1]) : null;
      
      await prisma.agentMemory.upsert({
        where: { filename },
        update: {
          content: content.substring(0, 50000), // Limit content size
          fileDate: fileDate,
          syncedAt: new Date(),
        },
        create: {
          filename,
          content: content.substring(0, 50000),
          fileDate: fileDate,
          syncedAt: new Date(),
        },
      });
      synced++;
    }
    
    // Also sync MEMORY.md if it exists
    const memoryMdPath = path.join(CLAWD_DIR, 'MEMORY.md');
    if (fs.existsSync(memoryMdPath)) {
      const content = fs.readFileSync(memoryMdPath, 'utf8');
      await prisma.agentMemory.upsert({
        where: { filename: 'MEMORY.md' },
        update: {
          content: content.substring(0, 50000),
          fileDate: null,
          syncedAt: new Date(),
        },
        create: {
          filename: 'MEMORY.md',
          content: content.substring(0, 50000),
          fileDate: null,
          syncedAt: new Date(),
        },
      });
      synced++;
    }
    
    console.log(`  ✅ Synced ${synced} memory files`);
    return synced;
  } catch (error) {
    console.error('  ❌ Error syncing memory:', error.message);
    return 0;
  }
}

async function syncActivity() {
  console.log('⚡ Syncing activity...');
  
  try {
    // Extract recent activity from memory files
    const memoryDir = path.join(CLAWD_DIR, 'memory');
    if (!fs.existsSync(memoryDir)) {
      return 0;
    }

    // Get last 7 days of memory files
    const files = fs.readdirSync(memoryDir)
      .filter(f => f.match(/\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .slice(-7);

    // Clear old activity and re-sync
    await prisma.agentActivity.deleteMany({});
    
    let synced = 0;
    const activityItems = [];

    for (const filename of files) {
      const filePath = path.join(memoryDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      const fileDate = dateMatch ? new Date(dateMatch[1]) : new Date();

      // Extract bullet points as activity items
      const lines = content.split('\n');
      for (const line of lines) {
        const bulletMatch = line.match(/^[-*]\s+(.+)/);
        if (bulletMatch && bulletMatch[1].length > 10 && bulletMatch[1].length < 500) {
          activityItems.push({
            action: 'note',
            category: 'memory',
            details: bulletMatch[1].trim(),
            occurredAt: fileDate,
            syncedAt: new Date(),
          });
        }
      }
    }

    // Keep only most recent 50 items
    const recentItems = activityItems.slice(-50);
    
    for (const item of recentItems) {
      await prisma.agentActivity.create({ data: item });
      synced++;
    }
    
    console.log(`  ✅ Synced ${synced} activity items`);
    return synced;
  } catch (error) {
    console.error('  ❌ Error syncing activity:', error.message);
    return 0;
  }
}

async function main() {
  console.log('🎛️ Mission Control Sync Starting...');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('');

  const results = {
    scheduledTasks: await syncScheduledTasks(),
    tasks: await syncTasks(),
    memory: await syncMemory(),
    activity: await syncActivity(),
  };

  console.log('');
  console.log('📊 Sync Summary:');
  console.log(`   Scheduled Tasks: ${results.scheduledTasks}`);
  console.log(`   Tasks: ${results.tasks}`);
  console.log(`   Memory Files: ${results.memory}`);
  console.log(`   Activity Items: ${results.activity}`);
  console.log('');
  console.log('✅ Mission Control sync complete!');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
