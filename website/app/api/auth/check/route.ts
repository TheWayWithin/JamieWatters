import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

/**
 * GET /api/auth/check - Check if user is authenticated
 *
 * Returns 200 if authenticated, 401 if not
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookie
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Verify token
    const isValid = await verifyToken(token);

    if (!isValid) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }
}
