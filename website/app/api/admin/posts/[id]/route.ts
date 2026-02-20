import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force Node.js runtime for auth
export const runtime = 'nodejs';

/**
 * GET /api/admin/posts/[id] - Get single post
 *
 * Security: Authentication required
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Fetch post
    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Post fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/posts/[id] - Update post
 *
 * Security: Authentication required
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();

    // Validate input
    const schema = z.object({
      title: z.string().min(1).max(200).optional(),
      content: z.string().min(1).optional(),
      excerpt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      readTime: z.number().optional(),
      published: z.boolean().optional(),
      projectId: z.string().nullable().optional(),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If title changed, regenerate slug
    let slug = existingPost.slug;
    if (data.title && data.title !== existingPost.title) {
      slug = generateSlug(data.title);

      // Check if new slug conflicts with another post
      const conflictingPost = await prisma.post.findUnique({
        where: { slug },
      });

      if (conflictingPost && conflictingPost.id !== id) {
        return NextResponse.json(
          { error: 'A post with this title already exists' },
          { status: 409 }
        );
      }
    }

    // If projectId changed, verify it exists
    if (data.projectId !== undefined && data.projectId !== null) {
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

    // Update publishedAt when publishing
    const publishedAt = data.published === true && !existingPost.published
      ? new Date()
      : existingPost.publishedAt;

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title, slug }),
        ...(data.content && { content: data.content }),
        ...(data.excerpt && { excerpt: data.excerpt }),
        ...(data.tags && { tags: data.tags }),
        ...(data.readTime && { readTime: data.readTime }),
        ...(data.published !== undefined && { published: data.published, publishedAt }),
        ...(data.projectId !== undefined && { projectId: data.projectId }),
      },
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

    // Revalidate relevant pages
    revalidatePath('/journey');
    revalidatePath(`/journey/${existingPost.slug}`);
    if (slug !== existingPost.slug) {
      revalidatePath(`/journey/${slug}`);
    }
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      success: true,
      post,
    });

  } catch (error) {
    console.error('Post update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/posts/[id] - Delete post
 *
 * Security: Authentication required
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Delete post
    await prisma.post.delete({
      where: { id },
    });

    // Revalidate relevant pages
    revalidatePath('/journey');
    revalidatePath(`/journey/${existingPost.slug}`);
    revalidatePath('/sitemap.xml');

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });

  } catch (error) {
    console.error('Post deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete post',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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
