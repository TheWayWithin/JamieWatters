import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

interface Task {
  text: string;
  done: boolean;
}

interface TaskSection {
  title: string;
  tasks: Task[];
}

interface TaskListResponse {
  sections: TaskSection[];
  lastModified: string;
}

/**
 * GET /api/admin/tasks - Parse and return TASKS.md content
 *
 * Security: Authentication required
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Path to TASKS.md
    const tasksPath = join('/home/ubuntu/clawd', 'TASKS.md');

    try {
      // Read TASKS.md file
      const content = await fs.readFile(tasksPath, 'utf-8');
      const stats = await fs.stat(tasksPath);

      // Parse the markdown content
      const sections = parseTasksMarkdown(content);

      const response: TaskListResponse = {
        sections,
        lastModified: stats.mtime.toISOString(),
      };

      return NextResponse.json(response);

    } catch (fileError) {
      console.error('Error reading TASKS.md:', fileError);
      
      // Return mock data if file doesn't exist
      return NextResponse.json({
        sections: [
          {
            title: 'TASKS.md not found',
            tasks: [
              { text: 'Create TASKS.md file in workspace root', done: false },
              { text: 'Add task sections with ## headers', done: false },
              { text: 'Use - [ ] for incomplete tasks and - [x] for completed', done: false },
            ],
          },
        ],
        lastModified: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

function parseTasksMarkdown(content: string): TaskSection[] {
  const lines = content.split('\n');
  const sections: TaskSection[] = [];
  let currentSection: TaskSection | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for section headers (## or ###)
    if (trimmedLine.startsWith('## ') || trimmedLine.startsWith('### ')) {
      // Save previous section if it exists
      if (currentSection) {
        sections.push(currentSection);
      }
      
      // Start new section
      currentSection = {
        title: trimmedLine.replace(/^#+ /, ''),
        tasks: [],
      };
    }
    // Check for task items (- [ ] or - [x])
    else if (trimmedLine.match(/^- \[([ x])\]/)) {
      if (!currentSection) {
        // Create a default section if we encounter tasks without a header
        currentSection = {
          title: 'Tasks',
          tasks: [],
        };
      }

      const isDone = trimmedLine.includes('[x]');
      const taskText = trimmedLine.replace(/^- \[([ x])\] /, '');

      currentSection.tasks.push({
        text: taskText,
        done: isDone,
      });
    }
    // Check for alternative bullet formats (*, +, or numbered lists)
    else if (trimmedLine.match(/^[*+-] .+/) || trimmedLine.match(/^\d+\. .+/)) {
      if (!currentSection) {
        currentSection = {
          title: 'Tasks',
          tasks: [],
        };
      }

      const taskText = trimmedLine.replace(/^[*+-] /, '').replace(/^\d+\. /, '');
      currentSection.tasks.push({
        text: taskText,
        done: false, // Assume incomplete for non-checkbox items
      });
    }
  }

  // Add the last section if it exists
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}