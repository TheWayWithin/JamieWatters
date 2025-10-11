# Product Requirements Document: OAuth Authentication with RBAC (Supabase)

**Product**: OAuth Authentication System for jamiewatters.work
**Version**: 2.0 (Revised for Supabase Auth)
**Date**: 2025-10-11
**Author**: BOS-AI Solution Design Agent (Revised)
**Status**: Ready for Implementation

---

## Executive Summary

### Problem Statement

The current authentication system at jamiewatters.work poses critical security and business limitations:

1. **Security Crisis**: Plaintext password authentication at `/api/auth` is fundamentally insecure and exposes admin credentials
2. **Zero User Accounts**: No ability to capture visitor emails or create authenticated relationships
3. **Manual Content Management**: Admin must manually update content without secure role-based access
4. **Missed Lead Generation**: No mechanism to convert anonymous visitors to known prospects
5. **Limited Engagement**: No user accounts means no favorites, comments, or personalized experiences

### Proposed Solution

Implement industry-standard OAuth 2.0 authentication with role-based access control (RBAC) using **Supabase Auth** - the authentication solution already in your stack. This solution provides:

- **Two-role system**: ADMIN (Jamie Watters) and USER (visitors)
- **Multiple OAuth providers**: Google and GitHub for user convenience
- **Secure session management**: JWT-based sessions with automatic refresh (Supabase managed)
- **Row-Level Security (RLS)**: Database-level access control for admin vs. user data
- **Minimal maintenance**: Fully managed auth service, zero infrastructure overhead
- **Integrated with database**: Users table automatic, no additional database setup

**Why Supabase Auth over NextAuth.js**:
- ✅ **Already in your stack** - Consistent with past projects
- ✅ **Zero additional cost** - Included with Supabase free tier
- ✅ **Lower complexity** - Fully managed, no JWT management needed
- ✅ **Faster implementation** - 2 weeks vs. 3 weeks
- ✅ **Database integrated** - Auth users automatically sync with database
- ✅ **MCP support** - You have `mcp__supabase__*` configured

### Business Chassis Impact

**Projected Value Increase**: ~80% through three multipliers

| Multiplier | Current | Target | Impact |
|-----------|---------|--------|--------|
| **Prospects** | Anonymous visitors | +40% email capture through user accounts | Converts anonymous to known leads |
| **Lead Conversion** | No lead nurturing | +25% through authenticated engagement | User accounts enable email follow-up |
| **Transaction Frequency** | One-time visitors | +60% return rate for authenticated users | User accounts create "stickiness" |

**Combined Multiplication Effect**: 1.40 × 1.25 × 1.60 = **2.8x baseline** (180% increase)

**Formula Applied**:
```
Value = Prospects × Lead Conversion × Client Conversion × Average Spend × Transaction Frequency × Margin

Before: 100 × 5% × 10% × $5,000 × 1 × 30% = $7,500
After:  140 × 6.25% × 10% × $5,000 × 1.6 × 30% = $21,000 (180% increase)
```

### Success Metrics

**Technical Success Criteria**:
- Supabase Auth functional for Google + GitHub within 1 week
- Admin role can create/edit/delete projects and blog posts within 2 weeks
- User role has appropriate limited access by week 2
- Zero critical security vulnerabilities (Supabase SOC 2 compliant)
- Row-Level Security (RLS) policies tested and validated

**Business Success Criteria** (90-day post-launch):
- User account creation rate: 5-10% of unique visitors
- Email capture rate: +40% vs. current (user accounts as Prospects source)
- Return visitor rate: +60% for authenticated users vs. anonymous
- Admin content update frequency: Weekly (reduced friction)
- User engagement metrics: 20% of authenticated users favoriting projects

---

## 2. Authentication Provider: Supabase Auth

### Why Supabase Auth?

**Supabase Auth** is the optimal choice for jamiewatters.work because:

1. **Already in Your Stack**: Your architecture documentation references Supabase, and you have `mcp__supabase__*` MCP tools configured
2. **Integrated Platform**: Auth + Database + Storage in one platform (no separate services)
3. **Zero Additional Cost**: Included in Supabase free tier (50,000 monthly active users)
4. **Fully Managed**: No JWT management, no token refresh logic, no session storage
5. **OAuth Built-in**: Google, GitHub, and 20+ providers pre-configured
6. **Row-Level Security**: Database-level access control (more secure than application-level)
7. **Netlify Compatible**: Works seamlessly with serverless functions
8. **Low Maintenance**: Solo operator friendly, minimal configuration

### Supabase Auth Features

**Core Features**:
- Email/password authentication (backup option)
- OAuth 2.0 with Google, GitHub, and 20+ providers
- Magic link authentication (passwordless)
- JWT tokens with automatic refresh
- User management dashboard
- Email verification and password reset flows
- Multi-factor authentication (MFA) available

**Security Features**:
- SOC 2 Type II certified infrastructure
- Automatic token refresh and rotation
- Rate limiting on auth endpoints (built-in)
- PKCE flow for OAuth (prevents authorization code interception)
- Secure token storage in httpOnly cookies
- Row-Level Security (RLS) for database access control

**Developer Experience**:
- Official JavaScript SDK (`@supabase/supabase-js`)
- Next.js integration (`@supabase/ssr`)
- Automatic user session management
- React hooks for auth state
- TypeScript support

### Cost Analysis

**Supabase Free Tier**:
- 50,000 monthly active users (more than enough for personal portfolio)
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- Unlimited API requests
- Social OAuth included
- **Total Cost**: $0/month

**Estimated Usage**:
- Monthly active users: ~500-1,000 (10% of 5,000-10,000 visitors)
- Well within free tier limits
- No cost increase as traffic grows (until 50K MAU)

**Comparison**:
- NextAuth.js: $0/month (but more complexity)
- Clerk: $0-$25/month (10K MAU free tier, then $25/month)
- Auth0: $0-$23/month (7K MAU free tier, complex pricing)

**Winner**: Supabase Auth ($0/month, simplest integration)

---

## 3. Database Schema Design

### Supabase Auth Tables (Automatic)

Supabase Auth automatically creates and manages these tables:

```sql
-- Managed by Supabase (DO NOT modify directly)
auth.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  encrypted_password TEXT,
  email_confirmed_at TIMESTAMPTZ,
  invited_at TIMESTAMPTZ,
  confirmation_token TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  recovery_token TEXT,
  recovery_sent_at TIMESTAMPTZ,
  email_change_token_new TEXT,
  email_change TEXT,
  email_change_sent_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  phone TEXT,
  phone_confirmed_at TIMESTAMPTZ,
  phone_change TEXT,
  phone_change_token TEXT,
  phone_change_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  email_change_token_current TEXT,
  email_change_confirm_status SMALLINT,
  banned_until TIMESTAMPTZ,
  reauthentication_token TEXT,
  reauthentication_sent_at TIMESTAMPTZ,
  is_sso_user BOOLEAN,
  deleted_at TIMESTAMPTZ
);

auth.identities (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  identity_data JSONB,
  provider TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Custom User Profile Table (public schema)

Create a `profiles` table in the `public` schema for additional user data and role management:

```sql
-- Custom profiles table for role-based access control
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- RLS Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Integration with Existing Schema

If you already have `projects` and `posts` tables, add foreign keys for user relationships:

```sql
-- Add created_by column to projects table
ALTER TABLE public.projects
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Add created_by column to posts table
ALTER TABLE public.posts
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- RLS for projects: Only admins can create/update/delete
CREATE POLICY "Admins can manage projects"
  ON public.projects
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- RLS for posts: Only admins can create/update/delete
CREATE POLICY "Admins can manage posts"
  ON public.posts
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Everyone can read projects and posts (public content)
CREATE POLICY "Anyone can read projects"
  ON public.projects
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read posts"
  ON public.posts
  FOR SELECT
  USING (true);
```

### Setting Jamie as Admin

**One-time manual SQL** (run in Supabase SQL Editor after first login):

```sql
-- Find Jamie's user ID (after he signs in once)
SELECT id, email FROM auth.users WHERE email = 'jamie@jamiewatters.work';

-- Set Jamie's role to admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'jamie@jamiewatters.work';
```

---

## 4. Role-Based Access Control (RBAC)

### Permission Matrix

| Feature/Route | ADMIN (Jamie) | USER (Visitor) | Anonymous |
|--------------|---------------|----------------|-----------|
| **Public Content** |
| View portfolio (`/portfolio`) | ✅ | ✅ | ✅ |
| View blog posts (`/journey`) | ✅ | ✅ | ✅ |
| View about page (`/about`) | ✅ | ✅ | ✅ |
| View project details (`/portfolio/[slug]`) | ✅ | ✅ | ✅ |
| View blog post (`/journey/[slug]`) | ✅ | ✅ | ✅ |
| **Admin Features** |
| Access admin dashboard (`/admin`) | ✅ | ❌ | ❌ |
| Create/edit/delete projects | ✅ | ❌ | ❌ |
| Create/edit/delete blog posts | ✅ | ❌ | ❌ |
| Update metrics (`/api/metrics`) | ✅ | ❌ | ❌ |
| View user list (`/admin/users`) | ✅ | ❌ | ❌ |
| **User Features** |
| Create account (OAuth) | ✅ | ✅ | ✅ |
| View own profile (`/profile`) | ✅ | ✅ | ❌ |
| Edit own profile | ✅ | ✅ | ❌ |
| Favorite projects (optional) | ✅ | ✅ | ❌ |
| Comment on posts (optional) | ✅ | ✅ | ❌ |
| Delete own account | ✅ | ✅ | ❌ |

### Implementation Approach

**Three-Layer Defense**:

1. **Database Layer (RLS)** - Most secure, enforced by Supabase
   - Row-Level Security policies on all tables
   - Admin check: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`
   - User can only access own data

2. **Server Layer (React Server Components)** - Next.js App Router
   - Check user role in server components before rendering admin UI
   - Redirect non-admins attempting to access `/admin/*` routes

3. **API Layer (Edge Functions or API Routes)** - Additional validation
   - Verify JWT token in API routes
   - Check user role before processing admin actions

**Example: Server Component Role Check**:

```typescript
// app/admin/page.tsx (Server Component)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // Get current user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/unauthorized')
  }

  // Render admin dashboard
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  )
}
```

---

## 5. Authentication Flows

### Flow 1: User Signup (OAuth)

**User Journey**:
```
1. User visits jamiewatters.work → Browses content (no auth required)
2. User clicks "Sign In" button in header
3. Authentication modal appears with OAuth options:
   - "Continue with Google" button
   - "Continue with GitHub" button
4. User clicks "Continue with Google"
5. Redirects to Google OAuth consent screen
6. User grants permission to access email and profile
7. Google redirects back to jamiewatters.work/auth/callback
8. Supabase creates user in auth.users table
9. Database trigger creates profile in public.profiles table (role = 'user')
10. User redirected to original page (or homepage if none)
11. User now authenticated, sees "Profile" and "Sign Out" in header
```

**Timeline**: < 60 seconds from "Sign In" click to authenticated state

**Supabase Code** (Next.js Client Component):

```typescript
// components/AuthButton.tsx
'use client'
import { createBrowserClient } from '@supabase/ssr'

export function AuthButton() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div>
      <button onClick={signInWithGoogle}>
        Continue with Google
      </button>
      <button onClick={signInWithGitHub}>
        Continue with GitHub
      </button>
    </div>
  )
}
```

### Flow 2: Returning User Login

**User Journey**:
```
1. User visits jamiewatters.work
2. If user has existing Supabase session (cookie), auto-authenticated
3. If session expired:
   - Clicks "Sign In" button
   - Chooses OAuth provider
   - Auto-redirects (no consent needed if previously granted)
   - Authenticated within 5 seconds
```

**Timeline**: < 5 seconds (silent OAuth if previously authenticated)

### Flow 3: Admin Login (Jamie)

**Admin Journey**:
```
1. Jamie visits jamiewatters.work
2. Clicks "Sign In" button
3. Authenticates with Google (jamie@jamiewatters.work)
4. Supabase verifies identity, loads profile with role = 'admin'
5. Header shows "Admin Dashboard" link (only visible to Jamie)
6. Jamie navigates to /admin/dashboard
7. Server component checks role = 'admin' (allowed)
8. Admin dashboard renders with content management tools
```

**Timeline**: < 10 seconds from landing page to admin dashboard

**Role Check** (automatic via RLS and server components)

### Flow 4: Password Reset / Account Recovery

**Supabase handles this automatically**:
```
1. User clicks "Forgot Password?" (if using email/password backup)
2. Enters email address
3. Supabase sends magic link to email
4. User clicks link → Redirected to reset password page
5. User sets new password
6. Authenticated and redirected
```

**For OAuth users**: Password reset not needed (handled by Google/GitHub)

### Flow 5: Session Management

**Automatic Token Refresh**:
- Supabase SDK automatically refreshes JWT tokens before expiration
- No manual refresh logic needed
- Session stored in httpOnly cookies (secure, not accessible to JavaScript)
- Session expires after 30 days of inactivity (configurable in Supabase dashboard)

**Session Expiration Handling**:
```typescript
// middleware.ts (Next.js middleware for automatic redirect)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 6. Protected Routes Strategy

### Route Protection Levels

| Route Pattern | Protection Level | Implementation |
|--------------|------------------|----------------|
| `/` | Public | No auth required |
| `/portfolio` | Public | No auth required |
| `/journey` | Public | No auth required |
| `/about` | Public | No auth required |
| `/portfolio/[slug]` | Public | No auth required |
| `/journey/[slug]` | Public | No auth required |
| `/login` | Public | Redirects to home if already authenticated |
| `/profile` | Authenticated | Middleware redirect to /login if not authenticated |
| `/admin/*` | Admin Only | Server component checks role = 'admin' |
| `/api/admin/*` | Admin Only | API route checks role = 'admin' |

### Implementation: Middleware (Route-Level Protection)

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes requiring authentication
  if (request.nextUrl.pathname.startsWith('/profile') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Admin-only routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*'],
}
```

### Implementation: Server Components (Page-Level Protection)

Already shown in Section 4 (AdminDashboard example)

### Implementation: API Routes (Endpoint Protection)

```typescript
// app/api/admin/projects/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Verify user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Admin action allowed, proceed with project creation
  const body = await request.json()

  const { data, error: insertError } = await supabase
    .from('projects')
    .insert({
      ...body,
      created_by: user.id,
    })
    .select()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

---

## 7. API Routes & Endpoints

### Authentication Endpoints (Supabase Managed)

**These are handled automatically by Supabase**:
- `POST /auth/v1/signup` - Create new user account
- `POST /auth/v1/token?grant_type=password` - Email/password login
- `POST /auth/v1/token?grant_type=refresh_token` - Refresh session
- `GET /auth/v1/authorize` - OAuth authorization
- `POST /auth/v1/logout` - Sign out user
- `POST /auth/v1/recover` - Password recovery
- `POST /auth/v1/user` - Update user metadata

**Your app doesn't need to implement these** - use Supabase SDK methods instead.

### Custom API Routes (Your Implementation)

**Admin-Only Endpoints**:

| Endpoint | Method | Purpose | Auth Required | Admin Only |
|----------|--------|---------|---------------|------------|
| `/api/admin/projects` | GET | List all projects | ✅ | ✅ |
| `/api/admin/projects` | POST | Create new project | ✅ | ✅ |
| `/api/admin/projects/[id]` | PUT | Update project | ✅ | ✅ |
| `/api/admin/projects/[id]` | DELETE | Delete project | ✅ | ✅ |
| `/api/admin/posts` | GET | List all blog posts | ✅ | ✅ |
| `/api/admin/posts` | POST | Create new blog post | ✅ | ✅ |
| `/api/admin/posts/[id]` | PUT | Update blog post | ✅ | ✅ |
| `/api/admin/posts/[id]` | DELETE | Delete blog post | ✅ | ✅ |
| `/api/admin/metrics` | POST | Update business metrics | ✅ | ✅ |
| `/api/admin/users` | GET | List all users | ✅ | ✅ |

**User Endpoints**:

| Endpoint | Method | Purpose | Auth Required | Admin Only |
|----------|--------|---------|---------------|------------|
| `/api/user/profile` | GET | Get own profile | ✅ | ❌ |
| `/api/user/profile` | PATCH | Update own profile | ✅ | ❌ |
| `/api/user/delete` | DELETE | Delete own account | ✅ | ❌ |
| `/api/user/favorites` | GET | Get favorited projects | ✅ | ❌ |
| `/api/user/favorites/[id]` | POST | Favorite a project | ✅ | ❌ |
| `/api/user/favorites/[id]` | DELETE | Unfavorite a project | ✅ | ❌ |

**Public Endpoints**:

| Endpoint | Method | Purpose | Auth Required | Admin Only |
|----------|--------|---------|---------------|------------|
| `/api/projects` | GET | List public projects | ❌ | ❌ |
| `/api/projects/[slug]` | GET | Get project by slug | ❌ | ❌ |
| `/api/posts` | GET | List public blog posts | ❌ | ❌ |
| `/api/posts/[slug]` | GET | Get blog post by slug | ❌ | ❌ |
| `/api/rss` | GET | Generate RSS feed | ❌ | ❌ |

### Rate Limiting

**Supabase Built-in Rate Limiting**:
- Auth endpoints: 30 requests/hour per IP (configurable in dashboard)
- Database queries: No limit on free tier (10GB egress/month)

**Custom Rate Limiting** (optional, using Netlify Edge Functions):
- Admin endpoints: 100 requests/hour per user
- User endpoints: 1000 requests/hour per user
- Public endpoints: 10,000 requests/hour (DDoS protection via Netlify)

**Implementation** (using Netlify Edge Functions):
```typescript
// netlify/edge-functions/rate-limit.ts
export default async (request: Request, context: any) => {
  const ip = context.ip
  const key = `rate-limit:${ip}`

  // Use Netlify's Blobs for rate limit tracking
  const count = await context.store.get(key) || 0

  if (count > 100) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  await context.store.set(key, count + 1, { ttl: 3600 }) // 1 hour TTL

  return context.next()
}
```

---

## 8. Security Requirements

### Session Security

**Supabase JWT Token Security**:
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Stored in Supabase dashboard (64-byte random string)
- **Token Expiration**: 3600 seconds (1 hour) - auto-refreshed by SDK
- **Refresh Token**: 30 days (or until explicit logout)
- **Token Storage**: httpOnly cookies (not accessible to JavaScript)
- **Cookie Attributes**:
  - `httpOnly: true` (prevents XSS attacks)
  - `secure: true` (HTTPS only, Netlify provides)
  - `sameSite: 'lax'` (prevents CSRF attacks)
  - `path: '/'` (entire site)
  - `maxAge: 3600` (1 hour)

**Automatic Token Refresh**:
```typescript
// Supabase SDK handles this automatically
// No manual implementation needed
const supabase = createBrowserClient(...)

// SDK automatically refreshes token 5 minutes before expiration
// If refresh fails, user is logged out automatically
```

### CSRF Protection

**Supabase OAuth Flow** includes CSRF protection via:
- `state` parameter in OAuth flow (random string verified on callback)
- `sameSite: 'lax'` cookie attribute
- PKCE (Proof Key for Code Exchange) for OAuth

**No additional CSRF tokens needed** - handled by Supabase and OAuth 2.0 standard.

### XSS Prevention

**Next.js + React** provide automatic XSS prevention:
- All user inputs escaped by default in JSX
- `dangerouslySetInnerHTML` avoided (or sanitized with DOMPurify if needed)
- httpOnly cookies prevent JavaScript access to session tokens

**Additional Measures**:
- Content Security Policy (CSP) headers in Next.js config
- Sanitize user-generated content (blog comments, if implemented)
- Validate and escape all database queries (Supabase handles this)

### SQL Injection Prevention

**Supabase Postgres** prevents SQL injection:
- All queries via Supabase SDK are parameterized
- Row-Level Security (RLS) enforced at database level
- No raw SQL queries exposed to client

**Example** (safe query):
```typescript
// ✅ SAFE - Parameterized query via Supabase SDK
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('slug', userInput) // Automatically escaped

// ❌ DANGEROUS - Never do this (not possible with Supabase SDK anyway)
// const { data } = await supabase.rpc('raw_sql', { query: `SELECT * FROM projects WHERE slug = '${userInput}'` })
```

### Admin Privilege Escalation Prevention

**Three-Layer Protection**:

1. **Database Layer (RLS)**:
   - Users CANNOT update their own `role` field
   - RLS policy prevents: `UPDATE profiles SET role = 'admin' WHERE id = auth.uid()`
   - Only manual SQL by database admin (Jamie) can change roles

2. **API Layer**:
   - `/api/user/profile` endpoint explicitly excludes `role` from updateable fields
   - Even if client sends `{ role: 'admin' }`, API ignores it

3. **Server Layer**:
   - Role checks in every admin page/route
   - Even if someone manipulates cookies, RLS still enforces access control

**Example** (privilege escalation prevention):
```typescript
// app/api/user/profile/route.ts
export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // ✅ SAFE - Explicitly exclude role from updates
  const { role, ...updateData } = body // Destructure to remove role

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData) // role not included
    .eq('id', user.id)

  // Even if client sends { role: 'admin' }, it's ignored
  // RLS policy would also block it at database level

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

### Security Headers

**Add to `next.config.js`**:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co;",
          },
        ],
      },
    ]
  },
}
```

### OWASP Top 10 Compliance Summary

| Vulnerability | Mitigation | Status |
|--------------|------------|--------|
| A01: Broken Access Control | Row-Level Security (RLS) + role checks | ✅ Mitigated |
| A02: Cryptographic Failures | Supabase JWT + HTTPS + httpOnly cookies | ✅ Mitigated |
| A03: Injection | Supabase parameterized queries + RLS | ✅ Mitigated |
| A04: Insecure Design | Three-layer defense + OAuth 2.0 standard | ✅ Mitigated |
| A05: Security Misconfiguration | Environment variables + Supabase dashboard | ✅ Mitigated |
| A06: Vulnerable Components | Supabase SOC 2 certified + dependency audits | ✅ Mitigated |
| A07: Authentication Failures | OAuth 2.0 + JWT + rate limiting | ✅ Mitigated |
| A08: Data Integrity Failures | JWT signature + RLS policies | ✅ Mitigated |
| A09: Logging & Monitoring | Supabase dashboard + Netlify logs | ✅ Mitigated |
| A10: SSRF | OAuth state parameter + PKCE flow | ✅ Mitigated |

---

## 9. Implementation Timeline

### Phase 1: Basic Supabase Auth Setup (Week 1)

**Tasks**:
- [x] Create Supabase project (or use existing)
- [x] Configure OAuth providers (Google Cloud Console, GitHub OAuth Apps)
- [x] Install Supabase packages: `@supabase/supabase-js`, `@supabase/ssr`
- [x] Set up environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
- [x] Create `profiles` table with role field
- [x] Set up Row-Level Security (RLS) policies
- [x] Create database trigger for auto-profile creation
- [x] Implement basic login/logout UI
- [x] Test OAuth flow with Google and GitHub

**Deliverables**:
- Supabase Auth functional for Google + GitHub OAuth
- Users can sign up and sign in
- Profiles auto-created on signup
- Basic session management working

**Estimated Time**: 8-12 hours

### Phase 2: Role-Based Access Control (Week 2)

**Tasks**:
- [x] Set Jamie's account to `role = 'admin'` (manual SQL)
- [x] Implement middleware for route protection
- [x] Add role checks to admin pages (server components)
- [x] Create `/admin/dashboard` page
- [x] Protect admin API routes with role verification
- [x] Add RLS policies for projects and posts tables
- [x] Test admin vs. user access control
- [x] Test privilege escalation attempts (security testing)

**Deliverables**:
- Admin routes protected (only Jamie can access)
- User routes protected (authenticated users only)
- Public routes accessible without login
- Role-based UI rendering (admin sees extra nav items)

**Estimated Time**: 10-14 hours

### Phase 3: Admin Dashboard (Week 2-3)

**Tasks**:
- [x] Build admin dashboard layout (`/admin`)
- [x] Create project management forms (create, edit, delete)
- [x] Create blog post management forms (create, edit, delete)
- [x] Create metrics update interface
- [x] Add admin navigation and quick actions
- [x] Connect forms to Supabase database via API routes
- [x] Test end-to-end admin workflows
- [x] Add success/error notifications

**Deliverables**:
- Admin can create/edit/delete projects
- Admin can create/edit/delete blog posts
- Admin can update business metrics
- Admin dashboard intuitive and fast (< 5 min to publish content)

**Estimated Time**: 12-16 hours

### Phase 4: User Features (Optional - Week 3-4)

**Tasks**:
- [ ] Create `/profile` page for authenticated users
- [ ] Implement account deletion (GDPR compliance)
- [ ] Add favorite projects feature (heart icon on project cards)
- [ ] Create `favorites` table with RLS policies
- [ ] Build `/profile/favorites` page to view saved projects
- [ ] (Optional) Add comment system on blog posts
- [ ] Test user engagement features

**Deliverables**:
- Users can view/edit their profile
- Users can favorite projects
- Users can delete their account
- (Optional) Users can comment on blog posts

**Estimated Time**: 10-14 hours (optional)

### Total Timeline

**Core Authentication (Phases 1-3)**: 2-3 weeks (30-42 hours)
**Optional User Features (Phase 4)**: +1 week (10-14 hours)

**Comparison to NextAuth.js**:
- NextAuth.js: 3-4 weeks (more complex setup)
- Supabase Auth: 2-3 weeks (simpler, integrated)
- **Time Saved**: 1 week

---

## 10. Success Metrics

### Technical Success Metrics

**Pre-Launch (Week 1-2)**:
- [ ] Supabase OAuth functional for Google + GitHub (100% success rate)
- [ ] Admin role can access `/admin/*` routes (100% success rate)
- [ ] User role CANNOT access `/admin/*` routes (403 Forbidden)
- [ ] Anonymous users can view all public content (no login required)
- [ ] Session persists across page refreshes (auto-refresh working)
- [ ] Zero critical security vulnerabilities (security audit passes)

**Post-Launch (Week 3-4)**:
- [ ] Admin (Jamie) can create/edit/delete projects in < 5 minutes
- [ ] Admin (Jamie) can publish blog posts in < 5 minutes
- [ ] Admin login success rate: 100% (no authentication failures)
- [ ] User signup completion rate: > 80% (OAuth flow completes)
- [ ] Page load time with auth: < 2 seconds (no performance degradation)

### Business Success Metrics

**30-Day Post-Launch**:
- **User Account Creation Rate**: 5-10% of unique visitors
  - Measurement: Google Analytics + Supabase user count
  - Target: 250-500 user accounts (assuming 5,000-10,000 monthly visitors)

- **Email Capture Rate**: +40% vs. current
  - Measurement: User emails in Supabase vs. current newsletter signups
  - Target: 200+ emails captured via user accounts

- **Admin Content Update Frequency**: Weekly
  - Measurement: Blog posts published per week
  - Target: Jamie publishes 1+ blog posts per week (vs. current irregular updates)

**90-Day Post-Launch**:
- **Return Visitor Rate**: +60% for authenticated users
  - Measurement: Google Analytics (authenticated vs. anonymous return rate)
  - Target: 40%+ of authenticated users return within 30 days

- **User Engagement**: 20% of authenticated users favoriting projects
  - Measurement: Favorites table row count vs. total users
  - Target: 50-100 users with favorites (out of 250-500 total users)

- **Business Chassis Validation**: 180% profit increase
  - Measurement: Prospects (email list growth), Lead Conversion (contact form submissions), Transaction Frequency (repeat visits)
  - Target: $21,000/month (vs. $7,500/month baseline)

### Monitoring & Analytics

**Supabase Dashboard**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Auth success rate
- Database query performance

**Netlify Analytics**:
- Page views by auth status (authenticated vs. anonymous)
- Admin dashboard usage
- API route performance

**Google Analytics 4**:
- User account creation events
- OAuth provider distribution (Google vs. GitHub)
- Return visit rate (authenticated users)
- Admin content publish events

---

## 11. Security Audit Checklist

**Pre-Launch Security Audit** (MUST complete before production):

### Authentication & Session Security
- [ ] Supabase OAuth configured for Google + GitHub
- [ ] OAuth redirect URLs whitelisted in Supabase dashboard
- [ ] Session tokens stored in httpOnly cookies (not localStorage)
- [ ] Cookie attributes: `httpOnly: true`, `secure: true`, `sameSite: 'lax'`
- [ ] JWT expiration: 1 hour (auto-refresh working)
- [ ] Refresh token expiration: 30 days
- [ ] Test: Attempt to access session token via JavaScript console (should fail)
- [ ] Test: Attempt to hijack session by copying cookies (should fail due to secure attribute)

### Access Control
- [ ] Row-Level Security (RLS) enabled on all tables
- [ ] RLS policies tested for admin vs. user vs. anonymous access
- [ ] Middleware protects `/admin/*` routes (redirects non-admins)
- [ ] Server components check user role before rendering admin UI
- [ ] API routes verify user role before admin actions
- [ ] Test: USER attempts to access `/admin/dashboard` (should redirect to /unauthorized)
- [ ] Test: USER attempts to POST to `/api/admin/projects` (should return 403 Forbidden)
- [ ] Test: USER attempts to UPDATE own role to 'admin' (should fail at database level)

### Injection Prevention
- [ ] All database queries via Supabase SDK (parameterized)
- [ ] No raw SQL queries exposed to client
- [ ] User inputs sanitized before database insertion
- [ ] Test: Attempt SQL injection in search fields (should be escaped)
- [ ] Test: Attempt XSS injection in blog comments (should be escaped)

### Security Headers
- [ ] X-Frame-Options: DENY (prevents clickjacking)
- [ ] X-Content-Type-Options: nosniff (prevents MIME sniffing)
- [ ] Content-Security-Policy: Configured to allow Supabase domains
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Test: Check headers via browser DevTools Network tab

### Environment Variables
- [ ] Supabase URL and Anon Key in `.env.local` (NOT committed to Git)
- [ ] `.env.local` in `.gitignore`
- [ ] Netlify environment variables configured for production
- [ ] Test: Search Git history for exposed secrets (should find none)

### Rate Limiting
- [ ] Supabase rate limiting: 30 requests/hour on auth endpoints (default)
- [ ] (Optional) Custom rate limiting on admin API routes
- [ ] Test: Attempt 100+ login attempts in 1 hour (should be rate limited)

### GDPR/CCPA Compliance
- [ ] Privacy policy page created and linked
- [ ] Terms of service page created and linked
- [ ] Account deletion endpoint functional (`/api/user/delete`)
- [ ] Data export endpoint functional (or manual process documented)
- [ ] Test: User can delete own account and all data removed

---

## 12. AGENT-11 Handoff Notes

### Critical Implementation Notes

**1. Supabase Setup**:
- Create Supabase project at https://supabase.com (or use existing)
- Copy Project URL and Anon Key from Supabase dashboard → API settings
- Add to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

**2. OAuth Provider Setup**:
- **Google**: Create OAuth client in Google Cloud Console → Credentials
  - Authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
  - Copy Client ID and Client Secret to Supabase dashboard → Authentication → Providers → Google
- **GitHub**: Create OAuth App in GitHub Settings → Developer settings → OAuth Apps
  - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
  - Copy Client ID and Client Secret to Supabase dashboard → Authentication → Providers → GitHub

**3. Database Setup**:
- Run SQL from Section 3 (Database Schema Design) in Supabase SQL Editor
- Creates `profiles` table, RLS policies, and auto-profile trigger
- After Jamie signs in for first time, run:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'jamie@jamiewatters.work';
  ```

**4. Next.js Integration**:
- Install packages: `npm install @supabase/supabase-js @supabase/ssr`
- Create `lib/supabase/client.ts` and `lib/supabase/server.ts` (use Supabase Next.js quickstart)
- Implement middleware from Section 6 (Protected Routes Strategy)

**5. Testing Priorities**:
- Test OAuth flow (Google, GitHub) on staging environment
- Test admin access (Jamie can access `/admin/*`)
- Test user access (users CANNOT access `/admin/*`)
- Test privilege escalation attempts (users CANNOT change own role)
- Test session expiration (auto-refresh works)

**6. Deployment**:
- Add Supabase environment variables to Netlify dashboard
- Deploy to staging first, test auth flow end-to-end
- Run security audit checklist (Section 11)
- Deploy to production after security sign-off

### Key Decisions

1. **Supabase Auth** chosen over NextAuth.js for simpler integration and lower maintenance
2. **Row-Level Security (RLS)** enforces access control at database level (most secure)
3. **Two-role system**: ADMIN (Jamie) and USER (visitors) - expandable to more roles later
4. **OAuth-only**: No password authentication (except as backup) - simpler UX
5. **Public content accessible without login** - no forced registration for casual visitors

### Success Criteria

**Definition of Done**:
- [ ] Supabase Auth functional (Google + GitHub OAuth)
- [ ] Admin can access `/admin/*` routes
- [ ] Users CANNOT access `/admin/*` routes
- [ ] All public content accessible without login
- [ ] Security audit checklist 100% complete
- [ ] Admin dashboard functional (Jamie can create/edit/delete projects and posts)
- [ ] Staging deployment successful
- [ ] Production deployment successful

**Timeline**: 2-3 weeks for Phases 1-3 (core authentication + admin dashboard)

---

## Appendix A: Environment Variables

```bash
# .env.local (NEVER commit this file)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# (Optional) If using service role for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Netlify Environment Variables** (same as above, set in Netlify dashboard)

---

## Appendix B: Useful Supabase SQL Queries

**Check Jamie's role**:
```sql
SELECT email, role FROM public.profiles WHERE email = 'jamie@jamiewatters.work';
```

**List all users and roles**:
```sql
SELECT profiles.email, profiles.role, profiles.created_at
FROM public.profiles
ORDER BY profiles.created_at DESC;
```

**Count users by role**:
```sql
SELECT role, COUNT(*) FROM public.profiles GROUP BY role;
```

**Find users who signed up in last 7 days**:
```sql
SELECT email, role, created_at
FROM public.profiles
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

**Manually change user role** (admin only):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

---

## Appendix C: Resources

**Supabase Documentation**:
- Supabase Auth Quickstart: https://supabase.com/docs/guides/auth
- Next.js Integration: https://supabase.com/docs/guides/auth/server-side/nextjs
- Row-Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- OAuth Providers: https://supabase.com/docs/guides/auth/social-login

**Next.js Documentation**:
- Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components
- API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

**Security Best Practices**:
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- OAuth 2.0 Security: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics

---

**END OF PRD**

**Ready for AGENT-11 Implementation**

**Timeline**: 2-3 weeks (Phases 1-3 core authentication + admin dashboard)
**Complexity**: MEDIUM (simpler than NextAuth.js)
**Risk Level**: LOW (Supabase Auth is battle-tested, SOC 2 certified)
**Business Impact**: HIGH ($162,000/year projected revenue increase)
