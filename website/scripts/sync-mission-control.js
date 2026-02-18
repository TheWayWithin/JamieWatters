#!/usr/bin/env node
/**
 * Sync Mission Control data from plan/ files to jamiewatters.work database
 * Source of truth: /home/ubuntu/clawd/plan/ (PORTFOLIO.md, SPRINT.md, BACKLOG.md)
 * Run: node scripts/sync-mission-control.js
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const fs = require('fs');
const uuid = () => crypto.randomUUID();
const path = require('path');

const prisma = new PrismaClient();
const CLAWD_DIR = process.env.CLAWD_DIR || '/home/ubuntu/clawd';
const PLAN_DIR = path.join(CLAWD_DIR, 'plan');

// ─── Portfolio Sync ───────────────────────────────────────────────────────────
// Reads plan/PORTFOLIO.md and syncs to Project table

const PORTFOLIO_MAP = {
  'LLM-TXT-MASTERY': {
    slug: 'llmtxtmastery',
    url: 'https://llmtxtmastery.com',
    category: 'AI_TOOLS',
    projectType: 'SAAS',
  },
  'AImpactScanner': {
    slug: 'aimpactscanner',
    url: 'https://aimpactscanner.com',
    category: 'AI_TOOLS',
    projectType: 'SAAS',
  },
  'PlebTest': {
    slug: 'plebtest',
    url: 'https://plebtest.com',
    category: 'AI_TOOLS',
    projectType: 'SAAS',
  },
  'ModelOptix': {
    slug: 'modeloptix',
    url: 'https://modeloptix.com',
    category: 'AI_TOOLS',
    projectType: 'SAAS',
  },
  'FreeCalcHub': {
    slug: 'freecalchub',
    url: 'https://freecalchub.com',
    category: 'PRODUCTIVITY',
    projectType: 'CONTENT',
  },
  'SoloMarket': {
    slug: 'solomarket',
    url: 'https://solomarket.work',
    category: 'MARKETPLACE',
    projectType: 'MARKETPLACE',
  },
  'Evolve-7': {
    slug: 'evolve-7',
    url: 'https://evolve-7.com',
    category: 'AI_TOOLS',
    projectType: 'SAAS',
  },
  'ISO Tracker': {
    slug: 'iso-tracker',
    url: 'https://isotracker.com',
    category: 'OTHER',
    projectType: 'SAAS',
  },
  'JamieWatters.work': {
    slug: 'jamiewatters-work',
    url: 'https://jamiewatters.work',
    category: 'OTHER',
    projectType: 'PERSONAL',
  },
};

const STATUS_MAP = {
  'MVP Live': 'LIVE',
  'Live': 'LIVE',
  'Building': 'BUILD',
  'Building (75%)': 'BUILD',
  'Pre-launch': 'BUILD',
  'Paused': 'ARCHIVED',
  'Concept': 'PLANNING',
};

const PHASE_MAP = {
  'MVP Live': 'MVP',
  'Live': 'MAINTENANCE',
  'Building': 'MVP',
  'Building (75%)': 'MVP',
  'Pre-launch': 'LAUNCH',
  'Paused': 'PAUSED',
  'Concept': 'IDEATION',
};

function parsePortfolio() {
  const filePath = path.join(PLAN_DIR, 'PORTFOLIO.md');
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ PORTFOLIO.md not found');
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const products = [];

  // Parse the overview table
  const tableRegex = /\|\s*\d+\s*\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    products.push({
      name: match[1].trim(),
      statusText: match[2].trim(),
      revenue: match[3].trim(),
      users: match[4].trim(),
      priority: match[5].trim(),
      owner: match[6].trim(),
    });
  }

  // Parse product details sections for descriptions
  const sections = content.split(/### \d+\.\s+/);
  const details = {};
  for (const section of sections) {
    const nameMatch = section.match(/^(.+?)[\s🔴🟡🟢]/);
    if (nameMatch) {
      const name = nameMatch[1].trim();
      const descMatch = section.match(/\*\*One-liner:\*\*\s*(.+)/);
      const repoMatch = section.match(/\*\*Repo:\*\*\s*`(.+?)`/);
      const pricingMatch = section.match(/\*\*Pricing:\*\*\s*(.+)/);
      const targetMatch = section.match(/\*\*Target:\*\*\s*(.+)/);
      const nextActions = [];
      const actionRegex = /^\d+\.\s+(.+)/gm;
      let actionMatch;
      while ((actionMatch = actionRegex.exec(section)) !== null) {
        nextActions.push(actionMatch[1].trim());
      }
      details[name] = {
        description: descMatch ? descMatch[1].trim() : '',
        repo: repoMatch ? repoMatch[1].trim() : '',
        pricing: pricingMatch ? pricingMatch[1].trim() : '',
        target: targetMatch ? targetMatch[1].trim() : '',
        nextActions,
      };
    }
  }

  return products.map(p => ({ ...p, details: details[p.name] || {} }));
}

async function syncPortfolio() {
  console.log('📦 Syncing portfolio...');

  const products = parsePortfolio();
  if (products.length === 0) {
    console.log('  ⚠️ No products parsed');
    return 0;
  }

  // Get valid slugs from our portfolio
  const validSlugs = new Set();

  let synced = 0;
  for (const product of products) {
    const mapping = PORTFOLIO_MAP[product.name];
    if (!mapping) {
      console.log(`  ⚠️ No mapping for "${product.name}", skipping`);
      continue;
    }

    validSlugs.add(mapping.slug);
    const status = STATUS_MAP[product.statusText] || 'LIVE';
    const phase = PHASE_MAP[product.statusText] || 'MAINTENANCE';
    const mrrMatch = product.revenue.match(/\$(\d+)/);
    const mrr = mrrMatch ? parseInt(mrrMatch[1]) : 0;

    const description = product.details.description || `${product.name} — ${product.statusText}`;
    const longDesc = [
      product.details.target ? `**Target:** ${product.details.target}` : '',
      product.details.pricing ? `**Pricing:** ${product.details.pricing}` : '',
      product.details.nextActions?.length ? `**Next:**\n${product.details.nextActions.map(a => `- ${a}`).join('\n')}` : '',
    ].filter(Boolean).join('\n\n');

    await prisma.project.upsert({
      where: { slug: mapping.slug },
      update: {
        name: product.name,
        description,
        longDescription: longDesc || null,
        url: mapping.url,
        status,
        currentPhase: phase,
        mrr,
        updatedAt: new Date(),
        lastSynced: new Date(),
      },
      create: {
        id: mapping.slug,
        slug: mapping.slug,
        name: product.name,
        description,
        longDescription: longDesc || null,
        url: mapping.url,
        techStack: [],
        category: mapping.category,
        projectType: mapping.projectType,
        status,
        currentPhase: phase,
        mrr,
        screenshots: [],
        updatedAt: new Date(),
        lastSynced: new Date(),
      },
    });
    synced++;
  }

  // Archive projects not in our portfolio
  const allProjects = await prisma.project.findMany({ select: { slug: true } });
  const staleProjects = allProjects.filter(p => !validSlugs.has(p.slug));
  if (staleProjects.length > 0) {
    for (const stale of staleProjects) {
      await prisma.project.update({
        where: { slug: stale.slug },
        data: { status: 'ARCHIVED', updatedAt: new Date() },
      });
    }
    console.log(`  🗄️ Archived ${staleProjects.length} stale projects`);
  }

  console.log(`  ✅ Synced ${synced} products`);
  return synced;
}

// ─── Sprint Sync ──────────────────────────────────────────────────────────────
// Reads plan/SPRINT.md and syncs to AgentTask table with section="Sprint"

function parseSprint() {
  const filePath = path.join(PLAN_DIR, 'SPRINT.md');
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ SPRINT.md not found');
    return { tasks: [], sprintName: 'Unknown' };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Get sprint date range
  const sprintMatch = content.match(/\*Sprint:\s*(.+?)\*/);
  const sprintName = sprintMatch ? sprintMatch[1].trim() : 'Current Sprint';

  // Parse task table
  const tasks = [];
  const tableRegex = /\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/g;
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const status = match[5].trim();
    if (status === 'Status') continue; // Skip header
    tasks.push({
      number: parseInt(match[1]),
      task: match[2].trim(),
      owner: match[3].trim(),
      product: match[4].trim(),
      status: status,
      completed: status.includes('DONE') || status.includes('✅'),
    });
  }

  // Parse "Done This Sprint" section
  const doneSection = content.split('## Done This Sprint')[1];
  if (doneSection) {
    const doneRegex = /^[-*]\s+(.+)/gm;
    let doneMatch;
    while ((doneMatch = doneRegex.exec(doneSection)) !== null) {
      tasks.push({
        number: tasks.length + 1,
        task: doneMatch[1].trim(),
        owner: '',
        product: '',
        status: '✅ DONE',
        completed: true,
      });
    }
  }

  return { tasks, sprintName };
}

async function syncSprint() {
  console.log('🎯 Syncing sprint...');

  const { tasks, sprintName } = parseSprint();

  // Clear old sprint tasks
  await prisma.agentTask.deleteMany({ where: { section: { startsWith: 'Sprint' } } });

  let synced = 0;
  for (const task of tasks) {
    const label = `[${task.owner}] [${task.product}] ${task.task}`;
    await prisma.agentTask.create({
      data: {
        id: uuid(),
        section: `Sprint: ${sprintName}`,
        content: label,
        completed: task.completed,
        sortOrder: task.number,
        syncedAt: new Date(),
      },
    });
    synced++;
  }

  console.log(`  ✅ Synced ${synced} sprint tasks (${sprintName})`);
  return synced;
}

// ─── Backlog Sync ─────────────────────────────────────────────────────────────

async function syncBacklog() {
  console.log('📋 Syncing backlog...');

  const filePath = path.join(PLAN_DIR, 'BACKLOG.md');
  if (!fs.existsSync(filePath)) {
    console.log('  ⚠️ BACKLOG.md not found');
    return 0;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Clear old backlog tasks
  await prisma.agentTask.deleteMany({ where: { section: { startsWith: 'Backlog' } } });

  let currentSection = 'Backlog';
  let sortOrder = 100; // Start after sprint tasks
  let synced = 0;

  for (const line of content.split('\n')) {
    const sectionMatch = line.match(/^#{2,3}\s+(.+)/);
    if (sectionMatch) {
      currentSection = `Backlog: ${sectionMatch[1].trim()}`;
      continue;
    }

    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
    if (taskMatch) {
      await prisma.agentTask.create({
        data: {
          id: uuid(),
          section: currentSection,
          content: taskMatch[2].trim(),
          completed: taskMatch[1].toLowerCase() === 'x',
          sortOrder: sortOrder++,
          syncedAt: new Date(),
        },
      });
      synced++;
    }
  }

  console.log(`  ✅ Synced ${synced} backlog tasks`);
  return synced;
}

// ─── Scheduled Tasks (OpenClaw cron) ──────────────────────────────────────────

async function syncScheduledTasks() {
  console.log('📅 Syncing scheduled tasks...');

  try {
    const { execSync } = require('child_process');
    const cronOutput = execSync('openclaw cron list --json 2>/dev/null || echo "[]"', {
      encoding: 'utf8',
      timeout: 10000,
    });

    let jobs = [];
    try {
      const parsed = JSON.parse(cronOutput);
      jobs = parsed.jobs || parsed || [];
    } catch (e) {
      console.log('  ⚠️ Could not parse cron output, skipping');
      return 0;
    }

    // Clear and re-sync
    await prisma.agentSchedule.deleteMany({});

    let synced = 0;
    for (const job of jobs) {
      const schedule = job.schedule?.expr || job.schedule?.kind || 'unknown';
      const timezone = job.schedule?.tz || 'UTC';

      await prisma.agentSchedule.create({
        data: {
          id: uuid(),
          jobId: job.id,
          name: job.name || 'unnamed',
          schedule,
          timezone,
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

// ─── Memory ───────────────────────────────────────────────────────────────────

async function syncMemory() {
  console.log('🧠 Syncing memory files...');

  try {
    const memoryDir = path.join(CLAWD_DIR, 'memory');
    if (!fs.existsSync(memoryDir)) {
      console.log('  ⚠️ memory/ directory not found');
      return 0;
    }

    const files = fs.readdirSync(memoryDir).filter(f => f.endsWith('.md'));
    let synced = 0;

    for (const filename of files) {
      const filePath = path.join(memoryDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      const fileDate = dateMatch ? new Date(dateMatch[1]) : null;

      await prisma.agentMemory.upsert({
        where: { filename },
        update: {
          content: content.substring(0, 50000),
          fileDate,
          syncedAt: new Date(),
        },
        create: {
          id: uuid(),
          filename,
          content: content.substring(0, 50000),
          fileDate,
          syncedAt: new Date(),
        },
      });
      synced++;
    }

    // Also sync MEMORY.md
    const memoryMdPath = path.join(CLAWD_DIR, 'MEMORY.md');
    if (fs.existsSync(memoryMdPath)) {
      const content = fs.readFileSync(memoryMdPath, 'utf8');
      await prisma.agentMemory.upsert({
        where: { filename: 'MEMORY.md' },
        update: { content: content.substring(0, 50000), fileDate: null, syncedAt: new Date() },
        create: { id: uuid(), filename: 'MEMORY.md', content: content.substring(0, 50000), fileDate: null, syncedAt: new Date() },
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

// ─── Activity ─────────────────────────────────────────────────────────────────

async function syncActivity() {
  console.log('⚡ Syncing activity...');

  try {
    const memoryDir = path.join(CLAWD_DIR, 'memory');
    if (!fs.existsSync(memoryDir)) return 0;

    const files = fs.readdirSync(memoryDir)
      .filter(f => f.match(/\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .slice(-7);

    await prisma.agentActivity.deleteMany({});

    const items = [];
    for (const filename of files) {
      const content = fs.readFileSync(path.join(memoryDir, filename), 'utf8');
      const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
      const fileDate = dateMatch ? new Date(dateMatch[1]) : new Date();

      // Extract headings with timestamps as activity
      const headingRegex = /^###?\s+(.+)/gm;
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        const heading = match[1].trim();
        if (heading.length > 5 && heading.length < 200) {
          items.push({
            action: 'update',
            category: 'memory',
            details: heading,
            occurredAt: fileDate,
            syncedAt: new Date(),
          });
        }
      }
    }

    const recent = items.slice(-50);
    for (const item of recent) {
      await prisma.agentActivity.create({ data: { id: uuid(), ...item } });
    }

    console.log(`  ✅ Synced ${recent.length} activity items`);
    return recent.length;
  } catch (error) {
    console.error('  ❌ Error syncing activity:', error.message);
    return 0;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎛️ Mission Control Sync');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Plan dir: ${PLAN_DIR}`);
  console.log('');

  const results = {
    portfolio: await syncPortfolio(),
    sprint: await syncSprint(),
    backlog: await syncBacklog(),
    scheduledTasks: await syncScheduledTasks(),
    memory: await syncMemory(),
    activity: await syncActivity(),
  };

  console.log('');
  console.log('📊 Summary:');
  console.log(`   Portfolio: ${results.portfolio} products`);
  console.log(`   Sprint: ${results.sprint} tasks`);
  console.log(`   Backlog: ${results.backlog} tasks`);
  console.log(`   Cron Jobs: ${results.scheduledTasks}`);
  console.log(`   Memory: ${results.memory} files`);
  console.log(`   Activity: ${results.activity} items`);
  console.log('');
  console.log('✅ Sync complete!');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
