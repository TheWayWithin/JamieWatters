/**
 * Markdown Parser for project-plan.md
 *
 * Extracts tasks from markdown checkbox lists and categorizes them by status.
 * Used for generating daily updates and tracking project progress.
 *
 * Supported checkbox formats:
 * - [ ] Pending task
 * - [x] Completed task
 * - [X] Completed task (case-insensitive)
 */

export interface Task {
  content: string;     // Task description text
  completed: boolean;  // true if [x] or [X], false if [ ]
  section?: string;    // Parent section heading (e.g., "## Week 1")
  lineNumber?: number; // Line number in original file (for debugging)
}

export interface ParsedProjectPlan {
  tasks: Task[];             // All tasks
  completedTasks: Task[];    // Only completed tasks
  inProgressTasks: Task[];   // Tasks marked as in-progress (if applicable)
  pendingTasks: Task[];      // Only pending tasks
  sections: string[];        // All section headings found
}

/**
 * Parse project-plan.md markdown content to extract tasks
 *
 * @param markdown - Raw markdown content
 * @returns Parsed tasks categorized by status
 */
export function parseProjectPlan(markdown: string): ParsedProjectPlan {
  const tasks: Task[] = [];
  const sections: string[] = [];

  let currentSection: string | undefined = undefined;
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Check for section headers (# heading)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      currentSection = headerMatch[2].trim();
      sections.push(currentSection);
      continue;
    }

    // Check for checkbox tasks
    // Matches: - [ ] task or - [x] task or - [X] task
    // Also supports: * [ ] task and + [ ] task (alternative markdown list markers)
    const checkboxMatch = line.match(/^[\s]*[-*+]\s+\[([xX\s])\]\s+(.+)$/);
    if (checkboxMatch) {
      const status = checkboxMatch[1].trim().toLowerCase();
      const content = checkboxMatch[2].trim();
      const completed = status === 'x';

      tasks.push({
        content,
        completed,
        section: currentSection,
        lineNumber,
      });
    }
  }

  // Categorize tasks
  const completedTasks = tasks.filter(t => t.completed);
  const pendingTasks = tasks.filter(t => !t.completed);

  // In-progress tasks: Look for indicators like "⏳", "🚧", "in progress" in task content
  const inProgressTasks = pendingTasks.filter(t =>
    /⏳|🚧|in progress|ongoing|started/i.test(t.content)
  );

  return {
    tasks,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    sections,
  };
}

/**
 * Get recently completed tasks (based on simple heuristics)
 *
 * Since we don't have commit history, we use simple heuristics:
 * - All completed tasks are considered "recent" for daily updates
 * - In the future, we could enhance this with Git commit date filtering
 *
 * @param tasks - Completed tasks from parseProjectPlan
 * @param since - Optional: Filter tasks since this date (not implemented yet)
 * @returns Array of completed tasks
 */
export function getRecentlyCompletedTasks(
  tasks: Task[],
  since?: Date
): Task[] {
  // For now, return all completed tasks
  // Future enhancement: Filter based on Git commit dates
  return tasks.filter(t => t.completed);
}

/**
 * Extract task content without markdown formatting
 *
 * Removes common markdown formatting from task text:
 * - Bold (**text** or __text__)
 * - Italic (*text* or _text_)
 * - Code (`code`)
 * - Links ([text](url))
 *
 * @param taskContent - Raw task content with markdown
 * @returns Plain text content
 */
export function stripMarkdownFormatting(taskContent: string): string {
  let text = taskContent;

  // Remove bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/__(.+?)__/g, '$1');

  // Remove italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, '$1');
  text = text.replace(/_(.+?)_/g, '$1');

  // Remove code: `code`
  text = text.replace(/`(.+?)`/g, '$1');

  // Remove links: [text](url) -> text
  text = text.replace(/\[(.+?)\]\(.+?\)/g, '$1');

  return text.trim();
}

/**
 * Group tasks by section
 *
 * @param tasks - Array of tasks
 * @returns Map of section name to tasks
 */
export function groupTasksBySection(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>();

  for (const task of tasks) {
    const section = task.section || 'Uncategorized';

    if (!grouped.has(section)) {
      grouped.set(section, []);
    }

    grouped.get(section)!.push(task);
  }

  return grouped;
}

/**
 * Calculate completion percentage
 *
 * @param parsed - ParsedProjectPlan object
 * @returns Completion percentage (0-100)
 */
export function calculateCompletionPercentage(parsed: ParsedProjectPlan): number {
  if (parsed.tasks.length === 0) {
    return 0;
  }

  return Math.round((parsed.completedTasks.length / parsed.tasks.length) * 100);
}
