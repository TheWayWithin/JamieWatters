import { NextRequest, NextResponse } from 'next/server';
import { loginSchema, verifyPassword, generateToken } from '@/lib/auth';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { z } from 'zod';

// Force Node.js runtime for bcrypt compatibility
export const runtime = 'nodejs';

/**
 * POST /api/auth - Secure Admin Authentication
 * 
 * Security Features:
 * - bcrypt password verification against hashed environment variable
 * - Input validation with Zod schemas
 * - Secure session token generation with HMAC signing
 * - Rate limiting protection to prevent brute force attacks
 * - Secure error handling without information leakage
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const clientId = getClientIdentifier(req);
    const rateCheck = checkRateLimit(clientId, 'auth');
    
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for auth attempt from: ${clientId}`);
      
      const response = NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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

    // Validate input using Zod schema
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Verify password against bcrypt hash
    const isValidPassword = await verifyPassword(password);
    
    if (!isValidPassword) {
      // Log failed attempt for security monitoring
      const clientIp = getClientIdentifier(req);
      console.warn('Failed admin login attempt from:', clientIp);
      
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token for session
    const token = await generateToken();

    // Create response with secure cookie
    const response = NextResponse.json({ success: true });
    
    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true, // Prevents XSS access to token
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/', // Available site-wide
    });

    // Log successful authentication for security monitoring
    console.log('Successful admin authentication at:', new Date().toISOString());

    return response;

  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error('Authentication system error:', error);
    
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 500 }
    );
  }
}
