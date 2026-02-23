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
    const cronOutput = execSync('openclaw cron list --json 2>/dev/null || echo "[]"', {
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

/**
 * Parse SPRINT.md table format:
 * | # | Task | Owner | Product | Status |
 * Returns tasks with section "Active Sprint"
 */
function parseSprint(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tasks = [];

  for (const line of lines) {
    // Match table rows: | N | content | owner | product | status |
    const rowMatch = line.match(/^\|\s*\d+\s*\|\s*(.+?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/);
    if (!rowMatch) continue;

    const taskContent = rowMatch[1].trim();
    const status = rowMatch[4].trim().toLowerCase();

    // Skip header row (contains "Task" literally)
    if (taskContent.toLowerCase() === 'task') continue;

    const completed = status === 'done' || status === 'complete' || status === 'completed';
    tasks.push({ section: 'Active Sprint', content: taskContent, completed });
  }

  return tasks;
}

/**
 * Parse PORTFOLIO.md format:
 * ### N. PRODUCT-NAME headers with **Next actions:** numbered lists
 * Returns tasks with section "Portfolio: {ProductName}"
 */
function parsePortfolio(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tasks = [];

  let currentProduct = null;
  let inNextActions = false;

  for (const line of lines) {
    // Product header: ### N. PRODUCT-NAME
    const productMatch = line.match(/^###\s+\d+\.\s+(.+)/);
    if (productMatch) {
      currentProduct = productMatch[1].trim();
      inNextActions = false;
      continue;
    }

    // Next actions marker
    if (/\*\*Next actions:\*\*/i.test(line)) {
      inNextActions = true;
      continue;
    }

    // Another bold heading or section header ends the next-actions block
    if (inNextActions && (/^\*\*[^*]+\*\*/.test(line) || /^#{2,3}\s+/.test(line))) {
      inNextActions = false;
    }

    // Numbered list items under next actions
    if (inNextActions && currentProduct) {
      const itemMatch = line.match(/^\s*\d+\.\s+(.+)/);
      if (itemMatch) {
        tasks.push({
          section: `Portfolio: ${currentProduct}`,
          content: itemMatch[1].trim(),
          completed: false,
        });
      }
    }
  }

  return tasks;
}

/**
 * Parse standard markdown task files (TASKS.md or BACKLOG.md)
 * Handles - [ ] / - [x] checkbox format with ## section headers
 */
function parseMarkdownTasks(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const tasks = [];

  let currentSection = 'Uncategorized';

  for (const line of lines) {
    const sectionMatch = line.match(/^#{2,3}\s+(.+)/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
    if (taskMatch) {
      const completed = taskMatch[1].toLowerCase() === 'x';
      tasks.push({ section: currentSection, content: taskMatch[2].trim(), completed });
    }
  }

  return tasks;
}

async function syncTasks() {
  console.log('📋 Syncing tasks...');

  try {
    const sprintPath = path.join(CLAWD_DIR, 'plan', 'SPRINT.md');
    const portfolioPath = path.join(CLAWD_DIR, 'plan', 'PORTFOLIO.md');
    const backlogPath = path.join(CLAWD_DIR, 'plan', 'BACKLOG.md');
    const tasksPath = path.join(CLAWD_DIR, 'TASKS.md');

    const hasPlanFiles = fs.existsSync(sprintPath) || fs.existsSync(backlogPath) || fs.existsSync(portfolioPath);

    let allTasks = [];

    if (hasPlanFiles) {
      console.log('  📂 Using plan/ directory files');

      if (fs.existsSync(sprintPath)) {
        const sprintTasks = parseSprint(sprintPath);
        console.log(`    SPRINT.md: ${sprintTasks.length} tasks`);
        allTasks.push(...sprintTasks);
      }

      if (fs.existsSync(portfolioPath)) {
        const portfolioTasks = parsePortfolio(portfolioPath);
        console.log(`    PORTFOLIO.md: ${portfolioTasks.length} tasks`);
        allTasks.push(...portfolioTasks);
      }

      if (fs.existsSync(backlogPath)) {
        const backlogTasks = parseMarkdownTasks(backlogPath);
        console.log(`    BACKLOG.md: ${backlogTasks.length} tasks`);
        allTasks.push(...backlogTasks);
      }
    } else if (fs.existsSync(tasksPath)) {
      console.log('  📄 Using TASKS.md (legacy)');
      allTasks = parseMarkdownTasks(tasksPath);
    } else {
      console.log('  ⚠️ No task files found, skipping');
      return 0;
    }

    // Clear existing tasks and re-sync
    await prisma.agentTask.deleteMany({});

    let synced = 0;
    for (let i = 0; i < allTasks.length; i++) {
      const task = allTasks[i];
      await prisma.agentTask.create({
        data: {
          section: task.section,
          content: task.content,
          completed: task.completed,
          sortOrder: i,
          syncedAt: new Date(),
        },
      });
      synced++;
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

async function processPendingTriggers() {
  console.log('⚡ Processing pending triggers...');
  
  try {
    const { execSync } = require('child_process');
    
    // Get pending triggers
    const triggers = await prisma.agentCronTrigger.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    if (triggers.length === 0) {
      console.log('  ℹ️ No pending triggers');
      return 0;
    }

    let processed = 0;
    for (const trigger of triggers) {
      console.log(`  ▶️ Running job: ${trigger.jobName}`);
      
      // Mark as running
      await prisma.agentCronTrigger.update({
        where: { id: trigger.id },
        data: { status: 'running', startedAt: new Date() },
      });

      try {
        // Execute the cron job
        const output = execSync(`openclaw cron run ${trigger.jobId} 2>&1`, {
          encoding: 'utf8',
          timeout: 300000, // 5 minute timeout
        });

        // Mark as completed
        await prisma.agentCronTrigger.update({
          where: { id: trigger.id },
          data: { 
            status: 'completed', 
            completedAt: new Date(),
            result: output.substring(0, 1000),
          },
        });
        console.log(`  ✅ Completed: ${trigger.jobName}`);
        processed++;
      } catch (execError) {
        // Mark as failed
        await prisma.agentCronTrigger.update({
          where: { id: trigger.id },
          data: { 
            status: 'failed', 
            completedAt: new Date(),
            result: execError.message?.substring(0, 1000) || 'Unknown error',
          },
        });
        console.log(`  ❌ Failed: ${trigger.jobName} - ${execError.message}`);
      }
    }

    console.log(`  ✅ Processed ${processed}/${triggers.length} triggers`);
    return processed;
  } catch (error) {
    console.error('  ❌ Error processing triggers:', error.message);
    return 0;
  }
}

/**
 * Parse goals from workspace files.
 * Looks for structured goal definitions in goals.md, project-plan.md, or progress.md.
 * Format: lines matching "Goal: NAME | Metric: METRIC | Current: N | Target: N | Unit: UNIT | Category: CAT"
 * Or simpler: "- Goal: NAME (current/target unit) [category]"
 */
function parseGoals(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const goals = [];

  for (const line of lines) {
    // Full format: Goal: NAME | Metric: METRIC | Current: N | Target: N | Unit: UNIT | Category: CAT
    const fullMatch = line.match(
      /Goal:\s*(.+?)\s*\|\s*Metric:\s*(.+?)\s*\|\s*Current:\s*([\d.]+)\s*\|\s*Target:\s*([\d.]+)\s*\|\s*Unit:\s*(.+?)\s*\|\s*Category:\s*(.+)/i
    );
    if (fullMatch) {
      goals.push({
        name: fullMatch[1].trim(),
        metric: fullMatch[2].trim(),
        currentValue: parseFloat(fullMatch[3]),
        targetValue: parseFloat(fullMatch[4]),
        unit: fullMatch[5].trim(),
        category: fullMatch[6].trim(),
      });
      continue;
    }

    // Simple format: - Goal: NAME (current/target unit) [category]
    const simpleMatch = line.match(
      /[-*]\s+Goal:\s*(.+?)\s*\(([\d.]+)\s*\/\s*([\d.]+)\s*(\S+)\)\s*\[(.+?)]/i
    );
    if (simpleMatch) {
      goals.push({
        name: simpleMatch[1].trim(),
        metric: simpleMatch[1].trim(),
        currentValue: parseFloat(simpleMatch[2]),
        targetValue: parseFloat(simpleMatch[3]),
        unit: simpleMatch[4].trim(),
        category: simpleMatch[5].trim(),
      });
    }
  }

  return goals;
}

async function syncGoals() {
  console.log('🎯 Syncing goals...');

  try {
    const goalsPath = path.join(CLAWD_DIR, 'plan', 'GOALS.md');
    const planPath = path.join(CLAWD_DIR, 'plan', 'project-plan.md');
    const progressPath = path.join(CLAWD_DIR, 'plan', 'progress.md');

    let allGoals = [];

    // Try each potential source file
    for (const filePath of [goalsPath, planPath, progressPath]) {
      if (fs.existsSync(filePath)) {
        const parsed = parseGoals(filePath);
        if (parsed.length > 0) {
          console.log(`    ${path.basename(filePath)}: ${parsed.length} goals`);
          allGoals.push(...parsed);
        }
      }
    }

    if (allGoals.length === 0) {
      console.log('  ℹ️ No goal data found in workspace files, skipping');
      return 0;
    }

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const goal of allGoals) {
      try {
        // Upsert by name (unique enough for workspace goals)
        const existing = await prisma.goal.findFirst({
          where: { name: goal.name },
        });

        if (existing) {
          await prisma.goal.update({
            where: { id: existing.id },
            data: {
              currentValue: goal.currentValue,
              targetValue: goal.targetValue,
              status: goal.currentValue >= goal.targetValue ? 'achieved' : existing.status,
            },
          });
          updated++;
        } else {
          await prisma.goal.create({
            data: {
              name: goal.name,
              metric: goal.metric,
              currentValue: goal.currentValue,
              targetValue: goal.targetValue,
              unit: goal.unit,
              category: goal.category,
              status: goal.currentValue >= goal.targetValue ? 'achieved' : 'on_track',
            },
          });
          created++;
        }
      } catch (err) {
        console.error(`    ⚠️ Error syncing goal "${goal.name}":`, err.message);
        errors++;
      }
    }

    console.log(`  ✅ Goals synced (created: ${created}, updated: ${updated}, errors: ${errors})`);
    return created + updated;
  } catch (error) {
    console.error('  ❌ Error syncing goals:', error.message);
    return 0;
  }
}

/**
 * Auto-detect issues from workspace data and create Issue records.
 * Conservative detection: only flags clear problems to avoid noise.
 * Rules:
 *   1. Tasks stuck in Active Sprint (not completed) for > 48 hours -> warning
 *   2. ERROR/FAILED/BLOCKED keywords in progress.md -> error/blocker issue
 *   3. All auto-created issues have source='sync'
 *   4. Duplicate detection: skip if open issue with same title exists
 */
async function syncIssues() {
  console.log('\u26A0\uFE0F  Syncing issues...');

  let detected = 0;
  let created = 0;
  let skipped = 0;

  try {
    // Rule 1: Tasks stuck in Active Sprint > 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const stuckTasks = await prisma.agentTask.findMany({
      where: {
        section: 'Active Sprint',
        completed: false,
        syncedAt: { lt: fortyEightHoursAgo },
      },
      select: { id: true, content: true, syncedAt: true },
    });

    for (const task of stuckTasks) {
      detected++;
      const title = `Stuck task: ${task.content.substring(0, 80)}`;

      // Check for duplicate
      const existing = await prisma.issue.findFirst({
        where: { title, status: { in: ['open', 'in_progress'] } },
      });
      if (existing) {
        skipped++;
        continue;
      }

      await prisma.issue.create({
        data: {
          type: 'warning',
          title,
          description: `Task has been in Active Sprint for >48 hours without completion. Last synced: ${task.syncedAt.toISOString()}`,
          severity: 'medium',
          source: 'sync',
        },
      });
      created++;
    }

    // Rule 2: ERROR/FAILED/BLOCKED keywords in progress.md
    const progressPath = path.join(CLAWD_DIR, 'plan', 'progress.md');
    if (fs.existsSync(progressPath)) {
      const content = fs.readFileSync(progressPath, 'utf8');
      const lines = content.split('\n');

      for (const line of lines) {
        // Only match lines with strong error indicators (case-insensitive)
        const errorMatch = line.match(/\b(ERROR|FAILED|BLOCKED)\b/i);
        if (!errorMatch) continue;

        // Skip lines that are about resolved items
        if (/\b(resolved|fixed|completed|done)\b/i.test(line)) continue;

        detected++;
        const keyword = errorMatch[1].toUpperCase();
        const cleanLine = line.replace(/^[-*#\s]+/, '').trim().substring(0, 100);
        const title = `${keyword}: ${cleanLine}`;
        const issueType = keyword === 'BLOCKED' ? 'blocker' : 'error';
        const severity = keyword === 'BLOCKED' ? 'high' : 'medium';

        // Check for duplicate
        const existing = await prisma.issue.findFirst({
          where: { title, status: { in: ['open', 'in_progress'] } },
        });
        if (existing) {
          skipped++;
          continue;
        }

        await prisma.issue.create({
          data: {
            type: issueType,
            title,
            severity,
            source: 'sync',
          },
        });
        created++;
      }
    }

    console.log(`  \u2705 Issues synced (detected: ${detected}, created: ${created}, skipped duplicates: ${skipped})`);
    return created;
  } catch (error) {
    console.error('  \u274C Error syncing issues:', error.message);
    return 0;
  }
}

async function main() {
  console.log('🎛️ Mission Control Sync Starting...');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log('');

  // Process any pending triggers first
  const triggersProcessed = await processPendingTriggers();
  console.log('');

  const results = {
    triggersProcessed,
    scheduledTasks: await syncScheduledTasks(),
    tasks: await syncTasks(),
    goals: await syncGoals(),
    issues: await syncIssues(),
    memory: await syncMemory(),
    activity: await syncActivity(),
  };

  console.log('');
  console.log('📊 Sync Summary:');
  console.log(`   Triggers Processed: ${results.triggersProcessed}`);
  console.log(`   Scheduled Tasks: ${results.scheduledTasks}`);
  console.log(`   Tasks: ${results.tasks}`);
  console.log(`   Goals: ${results.goals}`);
  console.log(`   Issues: ${results.issues}`);
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
