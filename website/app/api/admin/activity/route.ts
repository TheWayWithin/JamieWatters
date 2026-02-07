import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

interface ActivityItem {
  timestamp: string;
  action: string;
  type: 'content' | 'social' | 'outreach' | 'development' | 'document' | 'other';
  source?: string;
}

interface ActivityFeedResponse {
  activities: ActivityItem[];
}

/**
 * GET /api/admin/activity - Parse recent memory files for activity
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

    const workspaceRoot = '/home/ubuntu/clawd';
    const memoryDir = join(workspaceRoot, 'memory');
    
    const activities: ActivityItem[] = [];

    try {
      // Get memory files from the last 7 days
      const files = await getRecentMemoryFiles(memoryDir, 7);
      
      // Parse each file for activities
      for (const file of files) {
        try {
          const filePath = join(memoryDir, file.name);
          const content = await fs.readFile(filePath, 'utf-8');
          const fileActivities = parseActivitiesFromContent(content, file.name);
          activities.push(...fileActivities);
        } catch (fileError) {
          console.error(`Error reading ${file.name}:`, fileError);
        }
      }

    } catch (dirError) {
      console.log('Memory directory not found or empty');
      // Return empty activities if directory doesn't exist
    }

    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to last 50 activities
    const limitedActivities = activities.slice(0, 50);

    const response: ActivityFeedResponse = {
      activities: limitedActivities,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Activity API error:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
  }
}

async function getRecentMemoryFiles(memoryDir: string, days: number) {
  const files = [];
  const now = new Date();
  const cutoffTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

  try {
    const dirContents = await fs.readdir(memoryDir);
    
    for (const filename of dirContents) {
      if (filename.endsWith('.md')) {
        try {
          const filePath = join(memoryDir, filename);
          const stats = await fs.stat(filePath);
          
          if (stats.mtime > cutoffTime) {
            files.push({
              name: filename,
              modified: stats.mtime,
            });
          }
        } catch (statError) {
          console.error(`Error stating ${filename}:`, statError);
        }
      }
    }
  } catch (readError) {
    console.error('Error reading memory directory:', readError);
  }

  return files.sort((a, b) => b.modified.getTime() - a.modified.getTime());
}

function parseActivitiesFromContent(content: string, filename: string): ActivityItem[] {
  const activities: ActivityItem[] = [];
  const lines = content.split('\n');
  
  // Extract date from filename (format: YYYY-MM-DD.md)
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  const fileDate = dateMatch ? dateMatch[1] : null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for timestamp patterns and action verbs
    const activityPatterns = [
      // Time-stamped actions: "14:30 Published blog post"
      /^(\d{1,2}:\d{2})\s+(.+)/,
      // Bullet points with action verbs
      /^[-*]\s*(.+)/,
      // Headers with action verbs
      /^#+\s*(.+)/,
    ];

    for (const pattern of activityPatterns) {
      const match = line.match(pattern);
      if (match) {
        const actionText = match[2] || match[1];
        const timeMatch = match[1]?.match(/\d{1,2}:\d{2}/);
        
        // Skip if it's just a header or doesn't contain action words
        if (!containsActionWords(actionText)) {
          continue;
        }

        // Construct timestamp
        let timestamp: string;
        if (timeMatch && fileDate) {
          // Parse time and combine with file date
          const [hours, minutes] = timeMatch[0].split(':').map(Number);
          const date = new Date(fileDate + 'T00:00:00-05:00'); // ET timezone
          date.setHours(hours, minutes, 0, 0);
          timestamp = date.toISOString();
        } else if (fileDate) {
          // Use file date with estimated time
          timestamp = new Date(fileDate + 'T12:00:00-05:00').toISOString();
        } else {
          // Fallback to now
          timestamp = new Date().toISOString();
        }

        const type = categorizeAction(actionText);
        
        activities.push({
          timestamp,
          action: actionText,
          type,
          source: filename,
        });

        break; // Only match first pattern for this line
      }
    }
  }

  return activities;
}

function containsActionWords(text: string): boolean {
  const actionWords = [
    'published', 'posted', 'sent', 'created', 'built', 'fixed', 'deployed', 
    'updated', 'edited', 'completed', 'finished', 'started', 'launched',
    'responded', 'replied', 'messaged', 'called', 'met', 'scheduled',
    'wrote', 'drafted', 'reviewed', 'analyzed', 'tested', 'pushed',
    'committed', 'merged', 'deleted', 'added', 'removed', 'installed'
  ];
  
  const lowerText = text.toLowerCase();
  return actionWords.some(word => lowerText.includes(word));
}

function categorizeAction(action: string): ActivityItem['type'] {
  const lowerAction = action.toLowerCase();
  
  if (lowerAction.includes('published') || lowerAction.includes('blog') || lowerAction.includes('article')) {
    return 'content';
  }
  if (lowerAction.includes('posted') || lowerAction.includes('tweet') || lowerAction.includes('linkedin') || lowerAction.includes('x.com')) {
    return 'social';
  }
  if (lowerAction.includes('sent') || lowerAction.includes('email') || lowerAction.includes('dm') || lowerAction.includes('messaged')) {
    return 'outreach';
  }
  if (lowerAction.includes('built') || lowerAction.includes('fixed') || lowerAction.includes('deployed') || lowerAction.includes('committed') || lowerAction.includes('pushed')) {
    return 'development';
  }
  if (lowerAction.includes('created') || lowerAction.includes('wrote') || lowerAction.includes('drafted') || lowerAction.includes('updated')) {
    return 'document';
  }
  
  return 'other';
}