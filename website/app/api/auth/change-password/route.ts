import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, hashPassword, extractTokenFromRequest, verifyToken } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Force Node.js runtime for bcrypt compatibility
export const runtime = 'nodejs';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(200, 'Password too long'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * POST /api/auth/change-password - Change admin password
 *
 * Security Features:
 * - Requires valid session token (must be logged in)
 * - Verifies current password before allowing change
 * - Rate limited to prevent brute force
 * - Stores new hash in database (works in production read-only filesystems)
 * - New password validated with minimum length
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication - must be logged in
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const session = verifyToken(token);
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateCheck = checkRateLimit(clientId, 'auth');

    if (!rateCheck.allowed) {
      const response = NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
      response.headers.set('Retry-After', rateCheck.retryAfter?.toString() || '900');
      return response;
    }

    // Parse and validate request body
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Verify current password
    const isCurrentValid = await verifyPassword(currentPassword);
    if (!isCurrentValid) {
      console.warn('Failed password change attempt - wrong current password from:', clientId);
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash the new password
    const newHash = await hashPassword(newPassword);

    // Store new hash in database (upsert so it works on first change too)
    await prisma.adminSettings.upsert({
      where: { id: 'admin' },
      update: { passwordHash: newHash, updatedAt: new Date() },
      create: { id: 'admin', passwordHash: newHash, updatedAt: new Date() },
    });

    console.log('Admin password changed successfully at:', new Date().toISOString());

    return NextResponse.json({ success: true, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
