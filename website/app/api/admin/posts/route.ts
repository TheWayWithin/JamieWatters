import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force Node.js runtime for auth
export const runtime = 'nodejs';

/**
 * POST /api/admin/posts - Create new post
 *
 * Security:
 * - Authentication required
 * - Input validation with Zod
 * - Auto-generates slug from title
 *
 * Request body:
 * {
 *   title: string;
 *   content: string; // Markdown content
 *   excerpt?: string;
 *   tags?: string[];
 *   postType: "manual" | "daily-update" | "weekly-plan";
 *   published: boolean;
 *   projectId?: string; // Optional link to project
 * }
 */
export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();

    // Validate input
    const schema = z.object({
      title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
      content: z.string().min(1, 'Content is required'),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      readTime: z.number().optional(),
      postType: z.enum(['manual', 'daily-update', 'weekly-plan']).default('manual'),
      published: z.boolean().default(false),
      projectId: z.string().nullable().optional().transform(val => val === '' || val === null ? null : val),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Generate slug from title
    const slug = generateSlug(data.title);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists' },
        { status: 409 }
      );
    }

    // If projectId provided, verify it exists
    if (data.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: data.projectId },
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }

    // Generate excerpt if not provided
    const excerpt = data.excerpt || generateExcerpt(data.content);

    // Calculate read time if not provided
    const readTime = data.readTime || calculateReadTime(data.content);

    // Create post
    const post = await prisma.post.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        slug,
        content: data.content,
        excerpt,
        tags: data.tags || [],
        readTime,
        postType: data.postType,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        projectId: data.projectId || null,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant pages
    revalidatePath('/journey');
    revalidatePath(`/journey/${slug}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Post creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/posts - List all posts
 *
 * Security: Authentication required
 * Query params: postType, published, projectId, limit
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

    // Parse query params
    const { searchParams } = new URL(req.url);
    const postType = searchParams.get('postType') || undefined;
    const published = searchParams.get('published') === 'true' ? true :
                      searchParams.get('published') === 'false' ? false : undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: any = {};
    if (postType) where.postType = postType;
    if (published !== undefined) where.published = published;
    if (projectId) where.projectId = projectId;

    // Fetch posts
    const posts = await prisma.post.findMany({
      where,
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: posts,
      count: posts.length,
    });

  } catch (error) {
    console.error('Posts list error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 100);
}

/**
 * Generate excerpt from content (first 160 characters)
 */
function generateExcerpt(content: string): string {
  // Remove markdown formatting for excerpt
  let text = content;
  text = text.replace(/^#+\s+/gm, ''); // Remove headers
  text = text.replace(/[*_`]/g, ''); // Remove bold/italic/code
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links
  text = text.replace(/\n+/g, ' '); // Replace newlines with spaces

  // Trim to 160 characters
  if (text.length > 160) {
    text = text.substring(0, 157) + '...';
  }

  return text.trim();
}

/**
 * Calculate read time (approximate)
 */
function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
