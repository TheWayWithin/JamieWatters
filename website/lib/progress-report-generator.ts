/**
 * Progress Report Generator
 *
 * Transforms parsed progress reports into blog-ready content
 * that maintains the same interface as DailyUpdateOutput for
 * compatibility with the ContentPreviewModal.
 */

import { ParsedProgressReport, ProgressIssue } from './progress-parser';
import { calculateReadTime } from './read-time-calculator';

export interface ProgressReportOutput {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  readTime: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    githubUrl: string;
    completedTasks: string[];
    error?: string;
  }>;
}

/**
 * Format a date string for display in blog titles
 */
function formatDateForTitle(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00'); // Add time to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Generate the completed tasks section of the blog post
 */
function generateCompletedSection(tasks: string[]): string {
  if (tasks.length === 0) {
    return '';
  }

  const taskList = tasks.map(task => `- ${task}`).join('\n');

  return `## What Got Done\n\n${taskList}\n`;
}

/**
 * Generate the issues and learnings section of the blog post
 * This is the authentic "build in public" content that shows real struggles
 */
function generateIssuesSection(issues: ProgressIssue[]): string {
  if (issues.length === 0) {
    return '';
  }

  let section = `## Challenges & Learnings\n\n`;
  section += `*Real problems encountered and how they were solved - because building isn't always smooth sailing.*\n\n`;

  for (const issue of issues) {
    section += `### ${issue.title}\n\n`;

    if (issue.symptom) {
      section += `**The Problem:** ${issue.symptom}\n\n`;
    }

    if (issue.rootCause) {
      section += `**Root Cause:** ${issue.rootCause}\n\n`;
    }

    if (issue.fix) {
      section += `**Solution:** ${issue.fix}\n\n`;
    }

    if (issue.learning) {
      section += `> **Key Takeaway:** ${issue.learning}\n\n`;
    }
  }

  return section;
}

/**
 * Generate the impact summary section
 */
function generateImpactSection(summary: string | null): string {
  if (!summary) {
    return '';
  }

  return `## Impact\n\n${summary}\n`;
}

/**
 * Generate the next steps section
 */
function generateNextStepsSection(steps: string[]): string {
  if (steps.length === 0) {
    return '';
  }

  const stepList = steps.map(step => `- ${step}`).join('\n');

  return `## Coming Up Next\n\n${stepList}\n`;
}

/**
 * Generate an excerpt from the progress report
 */
function generateExcerpt(report: ParsedProgressReport): string {
  const taskCount = report.completedTasks.length;
  const issueCount = report.issues.length;

  let excerpt = '';

  if (taskCount > 0) {
    excerpt += `Shipped ${taskCount} ${taskCount === 1 ? 'update' : 'updates'}`;
  }

  if (issueCount > 0) {
    if (excerpt) excerpt += ' and ';
    excerpt += `tackled ${issueCount} ${issueCount === 1 ? 'challenge' : 'challenges'}`;
  }

  if (report.impactSummary) {
    if (excerpt) excerpt += '. ';
    // Take first sentence of impact summary
    const firstSentence = report.impactSummary.split(/[.!?]/)[0];
    excerpt += firstSentence;
  }

  if (!excerpt) {
    excerpt = `Progress update for ${report.projectName}`;
  }

  // Truncate if too long
  if (excerpt.length > 160) {
    excerpt = excerpt.substring(0, 157) + '...';
  }

  return excerpt;
}

/**
 * Generate tags for the blog post
 */
function generateTags(report: ParsedProgressReport): string[] {
  const tags = ['progress-report', 'build-in-public'];

  // Add project name as tag (kebab-case)
  const projectTag = report.projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (projectTag && !tags.includes(projectTag)) {
    tags.push(projectTag);
  }

  // Add issue-related tags if there were challenges
  if (report.issues.length > 0) {
    tags.push('lessons-learned');
  }

  return tags;
}

/**
 * Generate a blog-ready post from a parsed progress report
 * Returns format compatible with ContentPreviewModal
 */
export function generateProgressBlogPost(report: ParsedProgressReport): ProgressReportOutput {
  const formattedDate = formatDateForTitle(report.date);
  const title = `${report.projectName}: Progress Update - ${formattedDate}`;

  // Build the content sections
  const sections: string[] = [];

  // Opening paragraph
  sections.push(`*A transparent look at what got built, what broke, and what was learned while working on ${report.projectName}.*\n`);

  // Add each section if it has content
  const completedSection = generateCompletedSection(report.completedTasks);
  if (completedSection) sections.push(completedSection);

  const issuesSection = generateIssuesSection(report.issues);
  if (issuesSection) sections.push(issuesSection);

  const impactSection = generateImpactSection(report.impactSummary);
  if (impactSection) sections.push(impactSection);

  const nextStepsSection = generateNextStepsSection(report.nextSteps);
  if (nextStepsSection) sections.push(nextStepsSection);

  // Closing
  sections.push(`---\n\n*Building in public means sharing the real journey - wins, losses, and everything in between. Follow along for more updates.*`);

  const content = sections.join('\n');

  // Return in format compatible with ContentPreviewModal
  return {
    title,
    content,
    excerpt: generateExcerpt(report),
    tags: generateTags(report),
    readTime: calculateReadTime(content),
    projects: [{
      projectId: 'progress-report',
      projectName: report.projectName,
      githubUrl: '',
      completedTasks: report.completedTasks
    }]
  };
}

/**
 * Generate a summary-only version (shorter, for quick updates)
 */
export function generateProgressSummary(report: ParsedProgressReport): ProgressReportOutput {
  const formattedDate = formatDateForTitle(report.date);
  const title = `Quick Update: ${report.projectName} - ${formattedDate}`;

  let content = `*Quick progress snapshot for ${report.projectName}.*\n\n`;

  // Bullet summary of completed tasks
  if (report.completedTasks.length > 0) {
    content += `**Completed:** ${report.completedTasks.join(', ')}\n\n`;
  }

  // One-liner for each issue
  if (report.issues.length > 0) {
    const issuesSummary = report.issues
      .map(i => i.learning || i.fix || i.title)
      .join('; ');
    content += `**Learned:** ${issuesSummary}\n\n`;
  }

  // Impact if available
  if (report.impactSummary) {
    content += `**Impact:** ${report.impactSummary}\n`;
  }

  return {
    title,
    content,
    excerpt: generateExcerpt(report),
    tags: [...generateTags(report), 'quick-update'],
    readTime: calculateReadTime(content),
    projects: [{
      projectId: 'progress-report',
      projectName: report.projectName,
      githubUrl: '',
      completedTasks: report.completedTasks
    }]
  };
}
