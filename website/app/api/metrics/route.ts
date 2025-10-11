import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';
import { updateProjectMetrics } from '@/lib/database';
import { ProjectStatus } from '@prisma/client';
import { z } from 'zod';

// Force Node.js runtime for consistency with auth system
export const runtime = 'nodejs';

/**
 * POST /api/metrics - Secure Admin Metrics Update
 * 
 * Security Features:
 * - Authentication enforced by middleware
 * - Comprehensive input validation with Zod
 * - CSRF protection via same-site cookies
 * - Audit logging for all changes
 * - Sanitized error responses
 */

// Input validation schema
const metricsUpdateSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required').max(50, 'Project ID too long'),
  metrics: z.object({
    mrr: z.number().min(0, 'MRR must be non-negative').max(1000000, 'MRR value too large'),
    users: z.number().int().min(0, 'Users must be non-negative').max(10000000, 'Users value too large'),
    status: z.enum(['ACTIVE', 'BETA', 'PLANNING', 'ARCHIVED', 'active', 'beta', 'planning', 'archived']).transform(val => val.toUpperCase() as 'ACTIVE' | 'BETA' | 'PLANNING' | 'ARCHIVED'),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication token
    const token = extractTokenFromRequest(req) || req.headers.get('x-auth-token');
    
    if (!token) {
      console.warn('Unauthorized metrics update attempt - no token');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      console.warn('Unauthorized metrics update attempt - invalid token');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);
    
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate input using Zod schema
    const validationResult = metricsUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      console.warn('Invalid metrics update data:', validationResult.error.issues);
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { projectId, metrics } = validationResult.data;

    // Additional business logic validation
    if (metrics.mrr > 100000 && metrics.status === 'PLANNING') {
      return NextResponse.json(
        { error: 'Planning projects cannot have MRR greater than $100k' },
        { status: 422 }
      );
    }

    // Audit log for security monitoring
    console.log('Metrics update authorized:', {
      timestamp: new Date().toISOString(),
      projectId,
      metrics,
      userAgent: req.headers.get('user-agent'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
    });

    // Update database with Prisma
    const updatedProject = await updateProjectMetrics(projectId, {
      mrr: metrics.mrr,
      users: metrics.users,
      status: metrics.status as ProjectStatus,
    });

    console.log('Metrics update processed successfully:', { projectId, metrics });

    // Revalidate affected pages (ISR)
    revalidatePath('/');
    revalidatePath('/portfolio');
    revalidatePath(`/portfolio/${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully',
      data: {
        projectId,
        updatedAt: updatedProject.updatedAt.toISOString(),
        project: {
          name: updatedProject.name,
          mrr: Number(updatedProject.mrr),
          users: updatedProject.users,
          status: updatedProject.status,
        },
      },
    });

  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error('Metrics update system error:', error);
    
    return NextResponse.json(
      { error: 'Update service temporarily unavailable' },
      { status: 500 }
    );
  }
}
