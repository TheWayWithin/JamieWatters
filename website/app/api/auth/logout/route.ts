import { NextRequest, NextResponse } from 'next/server';

// Force Node.js runtime for consistency
export const runtime = 'nodejs';

/**
 * POST /api/auth/logout - Secure Admin Logout
 * 
 * Security Features:
 * - Clears HTTP-only authentication cookie
 * - Invalidates client-side session
 * - Logs logout events for security monitoring
 */
export async function POST(req: NextRequest) {
  try {
    // Log logout event for security monitoring
    console.log('Admin logout at:', new Date().toISOString());

    // Create response
    const response = NextResponse.json({ success: true });
    
    // Clear the authentication cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}