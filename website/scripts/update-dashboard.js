#!/usr/bin/env node
/**
 * update-dashboard.js
 * Updates dashboard.json from TASKS.md
 * Run: node scripts/update-dashboard.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const TASKS_MD = path.join(__dirname, '../../../TASKS.md');
const DASHBOARD_JSON = path.join(__dirname, '../public/data/dashboard.json');

function parseTasksMd(content) {
  const lines = content.split('\n');
  const sections = [];
  let currentSection = null;
  let currentTask = null;
  
  const sectionRegex = /^## (.+)$/;
  const taskRegex = /^- \[([ x])\] (.+)$/;
  const subtaskRegex = /^  - \[([ x])\] (.+)$/;
  const deepSubtaskRegex = /^    - \[([ x])\] (.+)$/;
  
  const emojiMap = {
    '🔥 Today / This Week': { title: 'Today / This Week', emoji: '🔥' },
    '🌐 JamieWatters.work': { title: 'JamieWatters.work', emoji: '🌐' },
    '📝 Content Pipeline': { title: 'Content Pipeline', emoji: '📝' },
    '🛠️ Infrastructure': { title: 'Infrastructure', emoji: '🛠️' },
    '🚀 Growth / Revenue': { title: 'Growth / Revenue', emoji: '🚀' },
    '🤖 Agent-11': { title: 'Agent-11', emoji: '🤖' },
    '🏪 SoloMarket': { title: 'SoloMarket', emoji: '🏪' },
    '🔭 ISO Tracker': { title: 'ISO Tracker', emoji: '🔭' },
    '💹 Trader-7': { title: 'Trader-7', emoji: '💹' },
    '💰 Costs & Financial Tracking': { title: 'Costs & Financial Tracking', emoji: '💰' },
    '📋 Strategic': { title: 'Strategic', emoji: '📋' },
    '🧊 Backlog': { title: 'Backlog', emoji: '🧊' },
    '✅ Done': null, // Skip done section
  };
  
  for (const line of lines) {
    // Check for section header
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      const sectionTitle = sectionMatch[1].trim();
      const sectionInfo = emojiMap[sectionTitle];
      
      if (sectionInfo === null) {
        currentSection = null; // Skip this section
        continue;
      }
      
      if (sectionInfo) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: sectionInfo.title,
          emoji: sectionInfo.emoji,
          tasks: [],
          completed: 0,
          total: 0
        };
        currentTask = null;
      }
      continue;
    }
    
    if (!currentSection) continue;
    
    // Check for task
    const taskMatch = line.match(taskRegex);
    if (taskMatch) {
      const done = taskMatch[1] === 'x';
      let text = taskMatch[2].trim();
      
      // Clean up text (remove strikethrough, priority markers, etc.)
      text = text.replace(/~~(.+)~~/, '$1').replace(/🔴|🟡|🟢|← TOP PRIORITY/g, '').trim();
      
      currentTask = {
        text,
        done,
        priority: line.includes('🔴') || line.includes('TOP PRIORITY'),
        subtasks: []
      };
      currentSection.tasks.push(currentTask);
      currentSection.total++;
      if (done) currentSection.completed++;
      continue;
    }
    
    // Check for subtask
    const subtaskMatch = line.match(subtaskRegex);
    if (subtaskMatch && currentTask) {
      const done = subtaskMatch[1] === 'x';
      let text = subtaskMatch[2].trim();
      text = text.replace(/~~(.+)~~/, '$1').trim();
      
      const subtask = {
        text,
        done,
        priority: false,
        subtasks: []
      };
      currentTask.subtasks.push(subtask);
      continue;
    }
    
    // Check for deep subtask
    const deepMatch = line.match(deepSubtaskRegex);
    if (deepMatch && currentTask && currentTask.subtasks.length > 0) {
      const lastSubtask = currentTask.subtasks[currentTask.subtasks.length - 1];
      const done = deepMatch[1] === 'x';
      let text = deepMatch[2].trim();
      text = text.replace(/~~(.+)~~/, '$1').trim();
      
      lastSubtask.subtasks.push({
        text,
        done,
        priority: false,
        subtasks: []
      });
    }
  }
  
  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }
  
  return sections;
}

function main() {
  // Read existing dashboard.json
  const dashboardData = JSON.parse(fs.readFileSync(DASHBOARD_JSON, 'utf-8'));
  
  // Read and parse TASKS.md
  const tasksMd = fs.readFileSync(TASKS_MD, 'utf-8');
  const taskSections = parseTasksMd(tasksMd);
  
  // Calculate totals
  let totalCompleted = 0;
  let totalTasks = 0;
  for (const section of taskSections) {
    totalCompleted += section.completed;
    totalTasks += section.total;
  }
  
  // Update dashboard data
  dashboardData.generatedAt = new Date().toISOString();
  dashboardData.taskSections = taskSections;
  dashboardData.taskStats = {
    total: totalTasks,
    completed: totalCompleted,
    percentage: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0
  };
  
  // Write updated dashboard.json
  fs.writeFileSync(DASHBOARD_JSON, JSON.stringify(dashboardData, null, 2));
  
  console.log(`✅ Dashboard updated at ${dashboardData.generatedAt}`);
  console.log(`   Tasks: ${totalCompleted}/${totalTasks} (${dashboardData.taskStats.percentage}%)`);
  console.log(`   Sections: ${taskSections.length}`);
}

main();
