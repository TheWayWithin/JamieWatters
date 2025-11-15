/**
 * Daily Update Generator
 *
 * Generates daily progress updates by:
 * 1. Fetching project-plan.md from GitHub for tracked projects
 * 2. Parsing completed tasks
 * 3. Generating formatted markdown content
 * 4. Calculating read time and creating post metadata
 *
 * Security: Handles token decryption safely, never logs tokens
 */

import { parseGitHubUrl, fetchProjectPlan, GitHubConfig, GitHubError } from './github';
import { parseProjectPlan, Task } from './markdown-parser';
import { calculateReadTime } from './read-time-calculator';
import { decryptToken } from './encryption';

export interface DailyUpdateInput {
  projectIds: string[];     // Which projects to include
  date?: Date;              // Date for the update (default: today)
}

export interface ProjectUpdate {
  projectId: string;
  projectName: string;
  githubUrl: string;
  completedTasks: string[];
  inProgressTasks?: string[];
  error?: string;           // If fetching failed
}

export interface DailyUpdateOutput {
  title: string;            // e.g., "Daily Update: November 10, 2025"
  content: string;          // Markdown content
  excerpt: string;          // Short summary
  tags: string[];           // e.g., ["daily-update", "build-in-public"]
  readTime: number;         // Estimated minutes
  projects: ProjectUpdate[];
}

export interface ProjectData {
  id: string;
  name: string;
  githubUrl: string | null;
  githubToken: string | null;
  trackProgress: boolean;
}

/**
 * Generate daily update from multiple projects
 *
 * @param input - Configuration for daily update generation
 * @param projects - Project data from database
 * @returns Daily update content ready for publishing
 */
export async function generateDailyUpdate(
  input: DailyUpdateInput,
  projects: ProjectData[]
): Promise<DailyUpdateOutput> {
  const date = input.date || new Date();
  const dateString = formatDate(date);

  // Filter to only requested projects
  const selectedProjects = projects.filter(p => input.projectIds.includes(p.id));

  // Fetch and parse project-plan.md for each project
  const projectUpdates: ProjectUpdate[] = await Promise.all(
    selectedProjects.map(project => fetchProjectUpdate(project))
  );

  // Filter out projects with no completed tasks and no errors
  const relevantUpdates = projectUpdates.filter(
    update => update.completedTasks.length > 0 || update.error
  );

  // Generate markdown content
  const content = generateMarkdownContent(dateString, relevantUpdates);

  // Generate excerpt
  const excerpt = generateExcerpt(relevantUpdates);

  // Calculate read time
  const readTime = calculateReadTime(content);

  // Generate tags
  const tags = ['daily-update', 'build-in-public'];

  // Add project-specific tags if only one project
  if (relevantUpdates.length === 1) {
    const projectName = relevantUpdates[0].projectName;
    tags.push(projectName.toLowerCase().replace(/\s+/g, '-'));
  }

  return {
    title: `Daily Update: ${dateString}`,
    content,
    excerpt,
    tags,
    readTime,
    projects: projectUpdates,
  };
}

/**
 * Fetch project update for a single project
 *
 * @param project - Project data from database
 * @returns Project update with completed tasks or error
 */
async function fetchProjectUpdate(project: ProjectData): Promise<ProjectUpdate> {
  try {
    // Validate GitHub URL
    if (!project.githubUrl) {
      return {
        projectId: project.id,
        projectName: project.name,
        githubUrl: project.githubUrl || '',
        completedTasks: [],
        error: 'No GitHub URL configured',
      };
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(project.githubUrl);
    if (!parsed) {
      return {
        projectId: project.id,
        projectName: project.name,
        githubUrl: project.githubUrl,
        completedTasks: [],
        error: 'Invalid GitHub URL format',
      };
    }

    // Build GitHub config
    const config: GitHubConfig = {
      owner: parsed.owner,
      repo: parsed.repo,
    };

    // Decrypt token if exists (for private repos)
    if (project.githubToken) {
      try {
        config.token = decryptToken(project.githubToken);
      } catch (error) {
        console.error(`Failed to decrypt token for project ${project.id}`);
        return {
          projectId: project.id,
          projectName: project.name,
          githubUrl: project.githubUrl,
          completedTasks: [],
          error: 'Failed to decrypt GitHub token',
        };
      }
    }

    // Fetch project-plan.md
    const markdown = await fetchProjectPlan(config);

    // Parse tasks
    const parsed_plan = parseProjectPlan(markdown);

    // Extract completed task content
    const completedTasks = parsed_plan.completedTasks.map(t => t.content);
    const inProgressTasks = parsed_plan.inProgressTasks.map(t => t.content);

    return {
      projectId: project.id,
      projectName: project.name,
      githubUrl: project.githubUrl,
      completedTasks,
      inProgressTasks: inProgressTasks.length > 0 ? inProgressTasks : undefined,
    };

  } catch (error) {
    // Handle GitHub-specific errors
    if (error && typeof error === 'object' && 'status' in error) {
      const githubError = error as GitHubError;

      let errorMessage = 'Failed to fetch from GitHub';
      if (githubError.status === 404) {
        errorMessage = 'project-plan.md not found';
      } else if (githubError.status === 403) {
        errorMessage = 'Access forbidden (check token)';
      } else if (githubError.status === 401) {
        errorMessage = 'Invalid GitHub token';
      }

      return {
        projectId: project.id,
        projectName: project.name,
        githubUrl: project.githubUrl || '',
        completedTasks: [],
        error: errorMessage,
      };
    }

    // Generic error
    console.error(`Error fetching project update for ${project.id}:`, error);
    return {
      projectId: project.id,
      projectName: project.name,
      githubUrl: project.githubUrl || '',
      completedTasks: [],
      error: 'Unknown error',
    };
  }
}

/**
 * Generate markdown content for daily update
 *
 * @param date - Formatted date string
 * @param projects - Project updates with tasks
 * @returns Formatted markdown content
 */
function generateMarkdownContent(date: string, projects: ProjectUpdate[]): string {
  const lines: string[] = [];

  // Title
  lines.push(`# Daily Update: ${date}\n`);

  // Count projects with updates
  const projectsWithUpdates = projects.filter(p => p.completedTasks.length > 0 && !p.error);

  if (projectsWithUpdates.length === 0) {
    lines.push('No completed tasks today across tracked projects.\n');
    lines.push('_Focus on execution tomorrow!_\n');
  } else {
    const count = projectsWithUpdates.length;
    lines.push(`Progress across ${count} active ${count === 1 ? 'project' : 'projects'}:\n`);

    // Add each project section
    for (const project of projects) {
      // Skip projects with no tasks and no errors
      if (project.completedTasks.length === 0 && !project.error) {
        continue;
      }

      lines.push(`## ${project.projectName}`);
      lines.push(`[View on GitHub](${project.githubUrl})\n`);

      // Handle errors
      if (project.error) {
        lines.push(`⚠️ _Error: ${project.error}_\n`);
        lines.push('---\n');
        continue;
      }

      // Completed tasks
      if (project.completedTasks.length > 0) {
        lines.push('✅ **Completed**:');
        for (const task of project.completedTasks) {
          lines.push(`- ${task}`);
        }
        lines.push('');
      }

      // In-progress tasks (optional)
      if (project.inProgressTasks && project.inProgressTasks.length > 0) {
        lines.push('⏳ **In Progress**:');
        for (const task of project.inProgressTasks) {
          lines.push(`- ${task}`);
        }
        lines.push('');
      }

      lines.push('---\n');
    }
  }

  // Footer
  lines.push('_This update was automatically generated from project-plan.md files. [Learn more about my build-in-public process →](/about)_');

  return lines.join('\n');
}

/**
 * Generate excerpt for daily update
 *
 * @param projects - Project updates
 * @returns Short summary text
 */
function generateExcerpt(projects: ProjectUpdate[]): string {
  const projectsWithTasks = projects.filter(p => p.completedTasks.length > 0 && !p.error);

  if (projectsWithTasks.length === 0) {
    return 'Daily progress update for my build-in-public projects.';
  }

  const totalTasks = projectsWithTasks.reduce((sum, p) => sum + p.completedTasks.length, 0);
  const count = projectsWithTasks.length;

  const projectText = count === 1 ? 'project' : 'projects';
  const taskText = totalTasks === 1 ? 'task' : 'tasks';

  return `Completed ${totalTasks} ${taskText} across ${count} ${projectText}. Building in public, one commit at a time.`;
}

/**
 * Format date for display
 *
 * @param date - Date object
 * @returns Formatted string like "November 10, 2025"
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
