/**
 * Progress Report Parser
 *
 * Parses structured markdown progress reports created by /dailyreport command
 * into a typed interface for the progress report generator.
 */

export interface ProgressIssue {
  title: string;
  symptom: string | null;
  rootCause: string | null;
  fix: string | null;
  learning: string | null;
}

export interface ParsedProgressReport {
  projectName: string;
  date: string;
  completedTasks: string[];
  issues: ProgressIssue[];
  impactSummary: string | null;
  nextSteps: string[];
  rawContent: string;
}

/**
 * Extract the project name and date from the title line
 * Expected format: "# Project Name - YYYY-MM-DD Progress Report"
 */
function parseTitle(content: string): { projectName: string; date: string } {
  const titleMatch = content.match(/^#\s+(.+?)\s+-\s+(\d{4}-\d{2}-\d{2})\s+Progress Report/m);

  if (titleMatch) {
    return {
      projectName: titleMatch[1].trim(),
      date: titleMatch[2]
    };
  }

  // Fallback: try to extract date from filename pattern or content
  const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
  const projectMatch = content.match(/^#\s+(.+?)(?:\s+-|$)/m);

  return {
    projectName: projectMatch ? projectMatch[1].trim() : 'Unknown Project',
    date: dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]
  };
}

/**
 * Extract completed tasks from the "## Completed Today" section
 * Tasks are marked with [x] checkbox
 */
function parseCompletedTasks(content: string): string[] {
  const tasks: string[] = [];

  // Find the Completed Today section
  const sectionMatch = content.match(/##\s+Completed\s+Today[\s\S]*?(?=##|$)/i);
  if (!sectionMatch) return tasks;

  const section = sectionMatch[0];

  // Match completed task items: - [x] Task description
  const taskRegex = /^\s*-\s*\[x\]\s*(.+)$/gim;
  let match;

  while ((match = taskRegex.exec(section)) !== null) {
    const task = match[1].trim();
    if (task) {
      tasks.push(task);
    }
  }

  return tasks;
}

/**
 * Extract issues and learnings from the "## Issues & Learnings" section
 * Each issue has: title, symptom, root cause, fix, learning
 */
function parseIssues(content: string): ProgressIssue[] {
  const issues: ProgressIssue[] = [];

  // Find the Issues & Learnings section
  const sectionMatch = content.match(/##\s+Issues\s*&\s*Learnings[\s\S]*?(?=##(?!#)|$)/i);
  if (!sectionMatch) return issues;

  const section = sectionMatch[0];

  // Split by ### Issue: headers
  const issueBlocks = section.split(/###\s+Issue:\s*/i).slice(1);

  for (const block of issueBlocks) {
    const lines = block.split('\n');
    const title = lines[0]?.trim() || 'Untitled Issue';

    const issue: ProgressIssue = {
      title,
      symptom: extractField(block, 'Symptom'),
      rootCause: extractField(block, 'Root Cause'),
      fix: extractField(block, 'Fix'),
      learning: extractField(block, 'Learning')
    };

    issues.push(issue);
  }

  return issues;
}

/**
 * Extract a field value from an issue block
 * Expected format: - **Field**: Value
 */
function extractField(block: string, fieldName: string): string | null {
  const regex = new RegExp(`-\\s*\\*\\*${fieldName}\\*\\*:\\s*(.+)`, 'i');
  const match = block.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Extract impact summary from the "## Impact Summary" section
 */
function parseImpactSummary(content: string): string | null {
  const sectionMatch = content.match(/##\s+Impact\s+Summary[\s\S]*?(?=##|$)/i);
  if (!sectionMatch) return null;

  // Remove the header and trim
  const summary = sectionMatch[0]
    .replace(/##\s+Impact\s+Summary/i, '')
    .trim();

  return summary || null;
}

/**
 * Extract next steps from the "## Next Steps" section
 * Tasks are marked with [ ] checkbox (incomplete)
 */
function parseNextSteps(content: string): string[] {
  const steps: string[] = [];

  // Find the Next Steps section
  const sectionMatch = content.match(/##\s+Next\s+Steps[\s\S]*?(?=##|$)/i);
  if (!sectionMatch) return steps;

  const section = sectionMatch[0];

  // Match incomplete task items: - [ ] Task description
  const taskRegex = /^\s*-\s*\[\s*\]\s*(.+)$/gim;
  let match;

  while ((match = taskRegex.exec(section)) !== null) {
    const step = match[1].trim();
    if (step) {
      steps.push(step);
    }
  }

  // Also match regular list items without checkboxes
  if (steps.length === 0) {
    const listRegex = /^\s*-\s+(?!\[)(.+)$/gim;
    while ((match = listRegex.exec(section)) !== null) {
      const step = match[1].trim();
      if (step) {
        steps.push(step);
      }
    }
  }

  return steps;
}

/**
 * Parse a progress report markdown file into a structured object
 */
export function parseProgressReport(content: string): ParsedProgressReport {
  const { projectName, date } = parseTitle(content);

  return {
    projectName,
    date,
    completedTasks: parseCompletedTasks(content),
    issues: parseIssues(content),
    impactSummary: parseImpactSummary(content),
    nextSteps: parseNextSteps(content),
    rawContent: content
  };
}

/**
 * Extract date from a progress report filename
 * Expected format: YYYY-MM-DD.md or project-YYYY-MM-DD.md
 */
export function extractDateFromFilename(filename: string): string | null {
  const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

/**
 * Extract project name from progress report content or filename
 */
export function extractProjectName(content: string, filename: string): string {
  const { projectName } = parseTitle(content);

  if (projectName !== 'Unknown Project') {
    return projectName;
  }

  // Try to extract from filename (e.g., "projectname-2024-01-15.md")
  const filenameMatch = filename.match(/^(.+?)-\d{4}-\d{2}-\d{2}\.md$/i);
  if (filenameMatch) {
    return filenameMatch[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return 'Unknown Project';
}
