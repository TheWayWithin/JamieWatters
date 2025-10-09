# JamieWatters.work - System Architecture Documentation

## Executive Summary

JamieWatters.work is a personal brand website showcasing Jamie Watters' journey to becoming a billion-dollar solopreneur. The architecture prioritizes **speed to market** (4-6 week MVP launch), **solo operator efficiency** (minimal manual workflows), and **security-first design** (proper CSP implementation, secure by default).

This is a **monolithic Next.js application** leveraging modern JAMstack principles with static generation and incremental regeneration for optimal performance. The architecture intentionally starts simple with manual metrics management, enabling rapid validation before investing in complex automation infrastructure.

**Key Architecture Characteristics:**
- **JAMstack**: Static site generation with incremental regeneration for near-instant page loads
- **Solo-Operator Optimized**: Git-push deploys, markdown-based content, minimal database operations
- **Security-First**: CSP with nonces, environment-based secrets, no authentication compromise
- **Performance-Driven**: < 2s page loads, Lighthouse > 90, aggressive caching strategy
- **MVP-Focused**: Manual metrics first, automation deferred to v2 after market validation

**Current Status**: Development (Phase 2 - Architecture Design Complete) - Ready for UI/UX design and implementation.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    JamieWatters.work                            │
│                    Personal Brand Platform                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐         ┌────────────────────────┐    │
│  │   Next.js Frontend  │◄────────┤   Next.js Backend      │    │
│  │                     │  API    │   (API Routes)         │    │
│  │ - React 18          │         │                        │    │
│  │ - Tailwind CSS      │         │ - Markdown Parser      │    │
│  │ - TypeScript        │         │ - Database Queries     │    │
│  │ - App Router        │         │ - Metrics API          │    │
│  │ - Static/ISR Pages  │         │ - Admin API (optional) │    │
│  └─────────────────────┘         └───────────┬────────────┘    │
│                                              │                 │
│                                              │                 │
│                                   ┌──────────▼──────────┐      │
│                                   │  Neon Database      │      │
│                                   │  (via Prisma ORM)   │      │
│                                   │                     │      │
│                                   │ - projects table    │      │
│                                   │ - posts metadata    │      │
│                                   │ - metrics_history   │      │
│                                   └─────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Content (Git Repository)                               │   │
│  │  - /content/posts/*.md (Blog markdown files)            │   │
│  │  - /public/images/* (Optimized images)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

External Integrations (Future v2):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ ConvertKit  │    │ Stripe API  │    │ Project     │
│ Newsletter  │    │ MRR Data    │    │ Analytics   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Data Flow:**
1. User requests page → Netlify CDN checks cache
2. Cache miss → Next.js generates page (SSG/ISR)
3. Next.js fetches data from Neon Database via Prisma
4. Blog content loaded from markdown files in repository
5. Page rendered and cached at edge (revalidated every 1 hour)
6. Admin updates metrics → API route → Prisma → Database
7. Next deployment automatically revalidates all ISR pages

---

## Infrastructure Architecture

### Deployment Strategy

**Platform**: Netlify (Starter Plan → Pro as needed)

**Why Netlify:**
- **Next.js optimized deployment**: Automatic builds, optimizations, and global CDN
- **Edge caching**: Global distribution with sub-100ms response times
- **Branch deployments**: Preview deployments for every PR
- **Built-in forms and functions**: No separate backend setup required
- **Git-driven workflow**: Push to `main` = auto-deploy
- **Free tier sufficient**: MVP fits within starter plan limits

**Deployment Flow:**
```
Developer Workflow:
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Edit content │ --> │ Git commit   │ --> │ Git push     │
│ or code      │     │              │     │ to main      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  ▼
Netlify Deployment:                   ┌──────────────────┐
                                      │ GitHub webhook   │
                                      │ triggers Netlify │
                                      └──────┬───────────┘
                                             │
        ┌────────────────────────────────────┴──────────┐
        │                                               │
        ▼                                               ▼
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│ Run build    │ --> │ Run Prisma   │ --> │ Deploy to edge  │
│ (next build) │     │ migrations   │     │ CDN worldwide   │
└──────────────┘     └──────────────┘     └─────────────────┘
        │                                               │
        └───────────────────┬───────────────────────────┘
                            ▼
                    ┌──────────────┐
                    │ Live site at │
                    │ JamieWatters │
                    │ .work        │
                    └──────────────┘

Time: ~2-3 minutes from push to live
```

### Infrastructure Components

#### Compute - Netlify Functions
- **Platform**: Netlify Edge Functions + Background Functions
- **Configuration**:
  - Edge Functions for static content delivery (< 50ms latency)
  - Serverless Functions for API routes (1024MB memory, 10s timeout)
  - Auto-scaling based on traffic (0 to millions of requests)
- **Cold Start Mitigation**:
  - ISR keeps functions warm through regular revalidation
  - Edge caching reduces function invocations by 95%+
- **Monitoring**: Netlify Dashboard (response times, invocation counts, errors)

#### Storage - Neon Database + Git Repository
- **Database**: Neon (Serverless Postgres with branching)
  - **Size**: 512MB initially on free tier (scales to 10GB on paid plans)
  - **Connection Pooling**: Built-in connection pooling for serverless
  - **Backup Strategy**: Point-in-time recovery (PITR) with 7-day retention
  - **Encryption**: TLS in transit, AES-256 at rest
  - **Branch Databases**: Isolated preview databases for each Netlify deployment
- **File Storage**:
  - Blog markdown files stored in Git repository (version controlled)
  - Images in `/public/` directory (served via Netlify CDN)
  - No object storage needed for MVP

#### Networking
- **CDN**: Netlify Edge Network (global distribution)
  - Automatic HTTPS certificate provisioning and renewal
  - Brotli compression for text assets
  - HTTP/2 and HTTP/3 support
- **Load Balancing**: Automatic via Netlify's infrastructure
- **DNS**: Netlify DNS (or custom DNS pointing to Netlify)
- **SSL/TLS**: Automatic Let's Encrypt certificates, TLS 1.3
- **Domain**: JamieWatters.work (custom domain configuration via Netlify dashboard)

#### Caching Strategy
```
Request Flow with Caching:

User Request
     │
     ▼
┌─────────────────┐
│ Netlify Edge    │ <-- Cache hit (99% of traffic)
│ CDN (global)    │     Return cached HTML (< 50ms)
└────────┬────────┘
         │ Cache miss or revalidation needed
         ▼
┌─────────────────┐
│ Serverless Func │
│ (ISR/SSG logic) │ <-- Generate page (200-500ms)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Database Query  │ <-- Fetch dynamic data
│ (if needed)     │
└────────┬────────┘
         │
         ▼
  Cache & Return

Revalidation:
- Blog posts: Every 1 hour (ISR revalidate: 3600)
- Portfolio pages: Every 1 hour (ISR revalidate: 3600)
- Static pages: Build-time only (Home, About)
```

---

## Application Architecture

### Frontend Architecture

```
Frontend Component Hierarchy:

app/
├── layout.tsx                    # Root layout (Header, Footer)
│   ├── Header Component
│   │   ├── Logo
│   │   ├── Navigation (Desktop)
│   │   └── Mobile Menu Toggle
│   └── Footer Component
│       ├── Social Links
│       ├── Copyright
│       └── Contact CTA
│
├── page.tsx                      # Home Page (SSG)
│   ├── Hero Section
│   │   ├── Headline
│   │   ├── Subheadline
│   │   └── Primary CTA
│   ├── Portfolio Overview
│   │   ├── Metrics Summary (Total MRR, Users, Projects)
│   │   └── Featured Projects (Top 3)
│   ├── Recent Blog Posts
│   │   └── Post Preview Cards (3 latest)
│   └── About Preview Section
│
├── portfolio/
│   ├── page.tsx                  # Portfolio Listing (ISR)
│   │   ├── Category Filter (AI Tools, Frameworks, etc.)
│   │   └── Project Grid (All 10 projects)
│   └── [slug]/
│       └── page.tsx              # Individual Project (ISR)
│           ├── Project Header (name, description, URL)
│           ├── Metrics Display (MRR, users, status)
│           ├── Tech Stack Badges
│           ├── Screenshot/Demo
│           ├── Case Study Sections
│           │   ├── Problem Statement
│           │   ├── Solution Approach
│           │   ├── Implementation Details
│           │   └── Lessons Learned
│           └── Related Projects
│
├── journey/
│   ├── page.tsx                  # Blog Listing (ISR)
│   │   ├── Post Grid (reverse chronological)
│   │   ├── Pagination (10 per page)
│   │   └── RSS Feed Link
│   └── [slug]/
│       └── page.tsx              # Individual Post (ISR)
│           ├── Post Header (title, date, read time)
│           ├── Markdown Content (with syntax highlighting)
│           ├── Social Share Buttons
│           └── Post Navigation (prev/next)
│
├── about/
│   └── page.tsx                  # About Page (SSG)
│       ├── Personal Story
│       ├── Vision Statement
│       ├── Current Focus
│       └── Contact Information
│
└── api/
    ├── metrics/
    │   └── route.ts              # Admin API: Update metrics
    └── revalidate/
        └── route.ts              # Webhook: On-demand revalidation

Shared Components:
components/
├── ui/                           # Reusable UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   └── Input.tsx
├── portfolio/
│   ├── ProjectCard.tsx           # Portfolio grid item
│   ├── MetricsDisplay.tsx        # Metrics visualization
│   └── TechStackBadge.tsx        # Technology badges
├── blog/
│   ├── PostCard.tsx              # Blog post preview
│   ├── PostContent.tsx           # Markdown renderer
│   └── ShareButtons.tsx          # Social sharing
└── layout/
    ├── Header.tsx
    ├── Footer.tsx
    ├── MobileMenu.tsx
    └── Navigation.tsx
```

**Technology Stack:**
- **Framework**: Next.js 14.2+ (App Router)
- **Language**: TypeScript 5.3+
- **UI Library**: React 18.3+
- **Styling**: Tailwind CSS 3.4+ (utility-first)
- **CSS Architecture**:
  - Tailwind utilities for 90% of styling
  - CSS modules for complex animations (if needed)
  - No styled-components or emotion (smaller bundle)
- **Fonts**:
  - `next/font` for automatic font optimization
  - System font stack fallback for instant text rendering
- **Icons**: Lucide React (tree-shakeable, 2KB per icon)
- **Build Tools**:
  - Next.js compiler (Turbopack in development)
  - Automatic code splitting per route
  - Image optimization via `next/image`

**State Management:**
- **Server State**: React Server Components (RSC) - no client state needed for most pages
- **Client State**: React `useState` for interactive components (mobile menu, filters)
- **No Redux/Zustand**: Application too simple to warrant global state management
- **URL State**: Pagination, filters in URL search params for shareability

**Performance Optimizations:**
- **Code Splitting**: Automatic per-route, dynamic imports for heavy components
- **Image Optimization**: `next/image` with WebP/AVIF, lazy loading, responsive sizes
- **Font Loading**: Preload critical fonts, subset to Latin characters only
- **Bundle Size Target**: Initial JS < 200KB (gzipped), total page size < 1MB
- **Lazy Loading**: Below-the-fold content and images load on scroll

### Backend Architecture

```
Backend API Architecture:

app/api/
├── metrics/
│   └── route.ts                  # POST /api/metrics
│       ├── Validate admin password (env var)
│       ├── Validate request body (Zod schema)
│       ├── Update project metrics in database
│       └── Revalidate portfolio pages
│
├── revalidate/
│   └── route.ts                  # POST /api/revalidate
│       ├── Verify webhook secret
│       ├── Trigger ISR revalidation
│       └── Return revalidation status
│
└── rss/
    └── route.ts                  # GET /api/rss
        ├── Fetch all published posts
        ├── Generate RSS XML
        └── Return with XML content-type

lib/
├── prisma.ts                     # Prisma client singleton
├── markdown.ts                   # Markdown parsing utilities
│   ├── parseMarkdown()           # Parse frontmatter + content
│   ├── renderMarkdown()          # Convert to HTML with syntax highlighting
│   └── calculateReadTime()       # Estimate reading time
├── seo.ts                        # SEO metadata generation
│   ├── generateMetadata()        # Page-specific meta tags
│   └── generateStructuredData()  # JSON-LD schema markup
└── validation.ts                 # Request validation schemas (Zod)

Data Fetching Patterns:
┌──────────────────────────────────────────────────────┐
│ Server Component (React Server Component)            │
│   ↓ async function                                   │
│   ├─→ await prisma.project.findMany()               │
│   │   (Direct database query, no API route needed)  │
│   └─→ Pass data as props to client components       │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ API Route (for admin updates or webhooks)            │
│   ↓ POST /api/metrics                                │
│   ├─→ Validate authentication                        │
│   ├─→ Validate request body (Zod)                    │
│   ├─→ await prisma.project.update()                  │
│   └─→ revalidatePath('/portfolio')                   │
└──────────────────────────────────────────────────────┘
```

**Technology Stack:**
- **Runtime**: Node.js 18+ (Vercel Serverless Functions)
- **API Design**: RESTful API via Next.js API Routes
  - No separate API server needed
  - Collocated with frontend for simplicity
- **Database Access**: Prisma ORM 5.0+
  - Type-safe queries
  - Automatic migrations
  - Connection pooling via Prisma Data Proxy
- **Authentication**: Simple password-based admin auth
  - Admin password stored in environment variable
  - Hashed comparison using `bcrypt`
  - No JWT complexity needed for MVP (single admin user)
- **Validation**: Zod for runtime type checking
  - API request validation
  - Environment variable validation
  - Form input validation
- **Markdown Processing**:
  - `gray-matter` for frontmatter parsing
  - `remark` + `remark-html` for markdown → HTML
  - `rehype-highlight` for code syntax highlighting
  - No MDX needed (simpler, faster builds)

**API Endpoints:**

| Endpoint | Method | Purpose | Auth | Payload |
|----------|--------|---------|------|---------|
| `/api/metrics` | POST | Update project metrics | Password | `{ projectId, metrics: { mrr, users, status } }` |
| `/api/revalidate` | POST | Trigger ISR revalidation | Webhook secret | `{ paths: string[] }` |
| `/api/rss` | GET | RSS feed for blog | Public | N/A |

**Error Handling:**
- API routes return standardized error responses:
  ```typescript
  {
    error: "Error message",
    code: "ERROR_CODE",
    statusCode: 400
  }
  ```
- Client-side error boundaries for React errors
- Sentry integration for error tracking (post-MVP)

---

## Data Architecture

### Database Schema Design (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Projects: Portfolio items with metrics
model Project {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  description String   @db.Text
  longDescription String?  @db.Text // For case study page
  url         String
  techStack   String[]  // Array of technologies
  category    Category
  featured    Boolean  @default(false)

  // Metrics (current snapshot)
  mrr         Decimal  @default(0) @db.Decimal(10, 2)
  users       Int      @default(0)
  status      ProjectStatus @default(ACTIVE)

  // Content
  problemStatement String? @db.Text
  solutionApproach String? @db.Text
  lessonsLearned   String? @db.Text
  screenshots      String[] // Array of image URLs

  // Metadata
  launchedAt  DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  metricsHistory MetricsHistory[]

  @@index([category])
  @@index([featured])
}

enum Category {
  AI_TOOLS
  FRAMEWORKS
  EDUCATION
  MARKETPLACE
  OTHER
}

enum ProjectStatus {
  ACTIVE
  BETA
  PLANNING
  ARCHIVED
}

// Blog posts metadata (content in markdown files)
model Post {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  excerpt     String   @db.Text
  tags        String[]
  readTime    Int      // Minutes
  publishedAt DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([publishedAt])
}

// Metrics history for future charts (v2 feature)
model MetricsHistory {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  mrr         Decimal  @db.Decimal(10, 2)
  users       Int
  recordedAt  DateTime @default(now())

  @@index([projectId, recordedAt])
}
```

**Database Design Decisions:**

1. **Projects Table**:
   - Stores all portfolio project data
   - `techStack` as string array (simpler than separate table for MVP)
   - `featured` flag for home page display
   - `screenshots` as string array (URLs to images in `/public/`)

2. **Posts Table**:
   - **Metadata only** - actual content in markdown files
   - Rationale: Git version control for content, simpler workflow
   - `readTime` calculated and stored (not computed dynamically)

3. **MetricsHistory Table**:
   - Optional for MVP (can defer)
   - Enables future growth charts without losing historical data
   - Foreign key cascade delete (if project deleted, history goes too)

4. **No Users/Auth Table**:
   - MVP has single admin (Jamie)
   - Password in environment variable (no user management needed)
   - Post-MVP: Add if multiple contributors needed

### Data Flow Architecture

```
Content Management Workflow:

1. Blog Post Publishing:
   ┌──────────────────┐
   │ Jamie writes     │
   │ markdown file in │
   │ /content/posts/  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Git commit +     │
   │ push to main     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Vercel builds    │
   │ and deploys      │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ New post live    │
   │ (ISR revalidates)│
   └──────────────────┘

   Time: ~2-3 minutes total

2. Metrics Update Workflow:
   ┌──────────────────┐
   │ Jamie logs into  │
   │ /admin page      │
   │ (password auth)  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Edits metrics    │
   │ in simple form   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ POST /api/metrics│
   │ (updates DB)     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ ISR revalidates  │
   │ portfolio pages  │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Updated metrics  │
   │ live immediately │
   └──────────────────┘

   Time: < 30 seconds

3. New Project Addition:
   ┌──────────────────┐
   │ Jamie uses admin │
   │ form or Prisma   │
   │ Studio           │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Inserts project  │
   │ into database    │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Creates markdown │
   │ file for project │
   │ case study       │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Git push         │
   │ (triggers deploy)│
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ New project page │
   │ live             │
   └──────────────────┘

   Time: ~5 minutes (mostly content writing)
```

**Database Query Patterns:**

```typescript
// High-frequency queries (cached via ISR):

// 1. Portfolio listing page
const projects = await prisma.project.findMany({
  where: { status: 'ACTIVE' },
  orderBy: [
    { featured: 'desc' },
    { createdAt: 'desc' }
  ],
  select: {
    id: true,
    slug: true,
    name: true,
    description: true,
    techStack: true,
    category: true,
    mrr: true,
    users: true,
    url: true,
  }
});

// 2. Individual project page
const project = await prisma.project.findUnique({
  where: { slug: params.slug },
  include: {
    metricsHistory: {
      orderBy: { recordedAt: 'desc' },
      take: 30, // Last 30 data points for chart (v2)
    }
  }
});

// 3. Home page metrics summary
const aggregateMetrics = await prisma.project.aggregate({
  where: { status: 'ACTIVE' },
  _sum: {
    mrr: true,
    users: true,
  },
  _count: {
    id: true,
  }
});

// Low-frequency queries (admin only):

// 4. Update project metrics
await prisma.$transaction([
  prisma.project.update({
    where: { id: projectId },
    data: { mrr, users, updatedAt: new Date() }
  }),
  prisma.metricsHistory.create({
    data: { projectId, mrr, users }
  })
]);
```

---

## Security Architecture

### Authentication & Authorization

**MVP Authentication Model**: Single Admin (No User Management)

```typescript
// lib/auth.ts
import bcrypt from 'bcrypt';

// Admin password stored as hashed env var
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!ADMIN_PASSWORD_HASH) {
    throw new Error('ADMIN_PASSWORD_HASH not configured');
  }
  return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
}

// Middleware for protected API routes
export function requireAuth(handler: Function) {
  return async (req: Request) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const password = authHeader.substring(7);
    const isValid = await verifyAdminPassword(password);

    if (!isValid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 403 });
    }

    return handler(req);
  };
}
```

**Authorization Matrix:**

```
Feature/Role         │ Public │ Admin
─────────────────────┼────────┼───────
View all pages       │   ✅   │  ✅
View blog posts      │   ✅   │  ✅
View portfolio       │   ✅   │  ✅
Access /admin page   │   ❌   │  ✅
Update metrics       │   ❌   │  ✅
Publish blog posts   │   ❌   │  ✅ (via Git)
View analytics       │   ❌   │  ✅
```

**Post-MVP Enhancement (v2):**
- Implement session-based auth for admin panel
- Add JWT for API authentication if needed
- Consider NextAuth.js for OAuth if multiple contributors

### Security Measures

#### Content Security Policy (CSP)

**CRITICAL**: CSP implemented with `strict-dynamic` and nonces (NEVER removed for convenience)

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

export function middleware(request: NextRequest) {
  // Generate nonce for this request
  const nonce = Buffer.from(randomBytes(16)).toString('base64');

  // CSP with strict-dynamic (prevents XSS)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: http:;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://vitals.vercel-insights.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const response = NextResponse.next();
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Nonce', nonce);

  // Additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: '/:path*',
};
```

**Using Nonces in Components:**
```tsx
// app/layout.tsx
import { headers } from 'next/headers';

export default function RootLayout({ children }) {
  const nonce = headers().get('x-nonce');

  return (
    <html>
      <head>
        <script nonce={nonce} src="/analytics.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

#### API Security

**Rate Limiting** (via Vercel Edge Config or Upstash Redis in v2):
```typescript
// lib/rate-limit.ts (simplified for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(identifier: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || record.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}
```

**Input Validation** (Zod schemas):
```typescript
// lib/validation.ts
import { z } from 'zod';

export const MetricsUpdateSchema = z.object({
  projectId: z.string().uuid(),
  metrics: z.object({
    mrr: z.number().min(0).max(1000000),
    users: z.number().int().min(0).max(10000000),
    status: z.enum(['ACTIVE', 'BETA', 'PLANNING', 'ARCHIVED']),
  })
});

export const PostCreateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  tags: z.array(z.string()).max(10),
  publishedAt: z.string().datetime(),
});
```

**CORS Policy**:
```typescript
// No CORS needed for MVP (all API routes same-origin)
// If adding external API access in v2:
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://jamiewatters.work',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};
```

#### Data Protection

**Encryption at Rest**:
- Database: Neon uses AES-256 encryption (automatic)
- Secrets: Stored in Netlify environment variables (encrypted)

**Encryption in Transit**:
- TLS 1.3 for all HTTPS connections (automatic via Vercel)
- Database connections over TLS (Prisma enforces this)

**PII Handling**:
- No PII collected in MVP (no user accounts, no emails stored)
- Analytics: Vercel Analytics is privacy-friendly (no cookies, no tracking)
- Future newsletter: Double opt-in, GDPR-compliant provider (ConvertKit)

**Compliance**:
- GDPR: No PII = minimal compliance burden
- CCPA: Same as above
- Cookie notice: Not needed (no tracking cookies)

**Security Checklist**:
- [ ] CSP headers with nonces implemented
- [ ] All environment variables validated with Zod
- [ ] Admin password hashed (bcrypt, 12 rounds)
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (React escapes by default + CSP)
- [ ] CSRF: Not needed (no cookie-based auth for MVP)
- [ ] Rate limiting on admin API routes
- [ ] Database backups enabled (Vercel automatic)
- [ ] HTTPS enforced (Vercel automatic)
- [ ] Security headers set (X-Frame-Options, etc.)

---

## Development & Build Architecture

### Development Workflow

```
Developer Workflow (Solo Operator: Jamie):

┌─────────────────────────────────────────────────┐
│ Local Development                               │
│                                                 │
│ 1. Edit code/content in VS Code                │
│ 2. Run: npm run dev                             │
│ 3. Preview at http://localhost:3000            │
│ 4. Make changes (hot reload automatically)      │
└────────────────────┬────────────────────────────┘
                     │ Changes look good?
                     ▼
┌─────────────────────────────────────────────────┐
│ Git Commit & Push                               │
│                                                 │
│ 1. git add .                                    │
│ 2. git commit -m "Add new blog post"           │
│ 3. git push origin main                         │
└────────────────────┬────────────────────────────┘
                     │ GitHub receives push
                     ▼
┌─────────────────────────────────────────────────┐
│ Automatic Deployment (Vercel)                   │
│                                                 │
│ 1. GitHub webhook triggers Vercel               │
│ 2. Vercel runs build process                    │
│ 3. Runs type checking (tsc)                     │
│ 4. Runs database migrations (prisma migrate)    │
│ 5. Builds Next.js app (next build)              │
│ 6. Deploys to global CDN                        │
│ 7. Runs health checks                           │
└────────────────────┬────────────────────────────┘
                     │ Build successful?
                     ▼
┌─────────────────────────────────────────────────┐
│ Live on JamieWatters.work                       │
│ Time: ~2-3 minutes from push                    │
└─────────────────────────────────────────────────┘

Rollback (if needed):
1. Go to Vercel dashboard
2. Click "Redeploy" on previous successful deployment
3. Site reverted in < 1 minute
```

### Repository Structure

```
jamiewatters/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout with Header/Footer
│   ├── page.tsx               # Home page
│   ├── portfolio/
│   │   ├── page.tsx           # Portfolio listing
│   │   └── [slug]/
│   │       └── page.tsx       # Individual project page
│   ├── journey/
│   │   ├── page.tsx           # Blog listing
│   │   └── [slug]/
│   │       └── page.tsx       # Individual blog post
│   ├── about/
│   │   └── page.tsx           # About page
│   ├── admin/
│   │   └── page.tsx           # Admin dashboard (protected)
│   └── api/
│       ├── metrics/
│       │   └── route.ts       # Metrics update API
│       └── rss/
│           └── route.ts       # RSS feed generation
│
├── components/                 # Reusable React components
│   ├── ui/                    # UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   ├── portfolio/
│   │   ├── ProjectCard.tsx
│   │   ├── MetricsDisplay.tsx
│   │   └── TechStackBadge.tsx
│   ├── blog/
│   │   ├── PostCard.tsx
│   │   ├── PostContent.tsx
│   │   └── ShareButtons.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── MobileMenu.tsx
│       └── Navigation.tsx
│
├── lib/                        # Utility functions
│   ├── prisma.ts              # Prisma client singleton
│   ├── markdown.ts            # Markdown parsing
│   ├── seo.ts                 # SEO metadata generation
│   ├── validation.ts          # Zod schemas
│   └── auth.ts                # Admin authentication
│
├── content/                    # Content files (Git-managed)
│   └── posts/                 # Blog post markdown files
│       ├── 2024-01-week-1.md
│       ├── 2024-01-week-2.md
│       └── 2024-01-week-3.md
│
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── seed.ts                # Database seeding script
│
├── public/                     # Static assets
│   ├── images/                # Project screenshots
│   │   ├── projects/
│   │   └── blog/
│   ├── favicon.ico
│   └── robots.txt
│
├── styles/                     # Global styles
│   └── globals.css            # Tailwind directives + custom CSS
│
├── types/                      # TypeScript type definitions
│   ├── project.ts
│   ├── post.ts
│   └── metrics.ts
│
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Example environment variables
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
└── README.md                   # Project documentation
```

### Build System Architecture

#### Frontend Build Process

```bash
# Build command (Vercel runs this automatically)
npm run build

# Build steps executed:
1. Type checking:         tsc --noEmit
2. Prisma generation:     prisma generate
3. Next.js build:         next build
   ├── Compile TypeScript
   ├── Generate static pages (SSG)
   ├── Prepare ISR pages
   ├── Optimize images
   ├── Bundle JavaScript (minify, tree-shake)
   └── Generate build manifest

# Output:
.next/
├── cache/                      # Build cache for incremental builds
├── server/                     # Server-side code
│   ├── app/                   # Compiled pages
│   └── chunks/                # Code-split chunks
└── static/                     # Static assets
    ├── chunks/                # Client JavaScript bundles
    ├── css/                   # Compiled CSS
    └── media/                 # Optimized images
```

**Build Optimizations:**
- **Incremental Builds**: Only rebuild changed pages (saves 50-70% build time)
- **Tree Shaking**: Remove unused code from bundles
- **Minification**: Terser for JS, cssnano for CSS
- **Code Splitting**: Automatic per-route + dynamic imports
- **Image Optimization**: WebP/AVIF conversion, responsive sizes
- **Font Optimization**: Subset fonts, inline critical font CSS

**Build Time Target**: < 60 seconds (critical for fast iterations)

#### Environment Configuration

**Development Environment:**
```bash
# .env.local (not committed to Git)
DATABASE_URL="postgresql://user:password@localhost:5432/jamiewatters_dev"
ADMIN_PASSWORD_HASH="$2b$12$..." # bcrypt hash of dev password
NODE_ENV="development"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

**Production Environment (Netlify):**
```bash
# Environment variables in Netlify dashboard
DATABASE_URL="postgresql://..." # Neon connection string
ADMIN_PASSWORD_HASH="$2b$12$..." # Production password hash
NODE_ENV="production"
NEXT_PUBLIC_SITE_URL="https://jamiewatters.work"
NETLIFY_URL="[auto-generated]" # Provided by Netlify
```

**Environment Variable Validation:**
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  ADMIN_PASSWORD_HASH: z.string().min(60), // bcrypt hash length
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

## Deployment & Operations

### Deployment Pipeline

```
CI/CD Pipeline (Vercel):

┌─────────────────────────────────────────────────┐
│ Trigger: Push to main branch                    │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 1. Clone Repository                              │
│    - Fetch latest code from GitHub               │
│    - Install dependencies: npm ci                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 2. Build Application                             │
│    - Type check: tsc --noEmit                    │
│    - Generate Prisma client                      │
│    - Build Next.js: next build                   │
│    - Output: .next/ directory                    │
└────────────────────┬────────────────────────────┘
                     │ Build failed? → Stop, notify
                     ▼ Build succeeded
┌─────────────────────────────────────────────────┐
│ 3. Database Migration                            │
│    - Run: prisma migrate deploy                  │
│    - Apply any pending schema changes            │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 4. Deploy to Edge Network                        │
│    - Upload static assets to CDN                 │
│    - Deploy serverless functions                 │
│    - Update edge configuration                   │
│    - Deployment URL: [preview-url]               │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ 5. Health Checks                                 │
│    - Test root page (/)                          │
│    - Test API route (/api/rss)                   │
│    - Verify database connection                  │
└────────────────────┬────────────────────────────┘
                     │ All checks passed?
                     ▼
┌─────────────────────────────────────────────────┐
│ 6. Promote to Production                         │
│    - Assign production domain                    │
│    - Invalidate CDN cache (if needed)            │
│    - Send deployment notification                │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│ ✅ Live at https://jamiewatters.work            │
│    Time: ~2-3 minutes from push                  │
└─────────────────────────────────────────────────┘

Rollback Process:
1. Open Netlify dashboard
2. Go to "Deploys" tab
3. Find last known good deployment
4. Click "Publish deploy"
5. Site reverted in < 60 seconds
```

**Deployment Checklist (Before First Deploy):**
- [ ] Domain purchased and DNS configured
- [ ] Netlify site created and linked to GitHub repo
- [ ] Environment variables set in Netlify dashboard
- [ ] Database provisioned (Neon)
- [ ] Prisma schema migrated to production database
- [ ] Initial content seeded (10 projects, 3 blog posts)
- [ ] Custom domain assigned and SSL provisioned
- [ ] Build settings configured (Next.js detection automatic)

### Operational Monitoring

#### Health Checks

**Vercel Health Check Endpoint:**
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up',
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    }, { status: 503 });
  }
}
```

**Monitoring:**
- **Endpoint**: `https://jamiewatters.work/api/health`
- **Frequency**: Vercel checks automatically every 5 minutes
- **Alert on**: 3 consecutive failures or 5xx errors

#### Logging Strategy

**Vercel Built-in Logging:**
- **Server Logs**: Automatic capture of serverless function logs
- **Edge Logs**: CDN request/response logs
- **Real-time Streaming**: View logs live in Vercel dashboard
- **Retention**: 1 week on hobby plan, 30 days on pro plan

**Application Logging:**
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.stack, ...meta, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, meta?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta, timestamp: new Date().toISOString() }));
  },
};

// Usage in API routes:
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  logger.info('Metrics update requested', { projectId });
  try {
    // ... update logic
    logger.info('Metrics updated successfully', { projectId, mrr, users });
  } catch (error) {
    logger.error('Metrics update failed', error, { projectId });
    throw error;
  }
}
```

**Log Levels:**
- **INFO**: Normal operations (deployments, successful requests)
- **WARN**: Potential issues (slow queries, rate limit approaches)
- **ERROR**: Failures requiring attention (API errors, database failures)

**Post-MVP Enhancement**: Integrate Sentry for error tracking and alerting

#### Performance Monitoring

**Vercel Analytics (Built-in):**
- Real User Monitoring (RUM) automatically enabled
- Metrics tracked:
  - Page load times (LCP, FID, CLS)
  - Server response times
  - Cache hit rates
  - Bandwidth usage
- Dashboard: `https://vercel.com/[team]/[project]/analytics`

**Web Vitals:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Performance Characteristics

### Response Time Targets

| Page Type | Target (p50) | Target (p95) | Strategy |
|-----------|-------------|-------------|----------|
| Home Page | < 500ms | < 1000ms | SSG + Edge Cache |
| Portfolio Listing | < 800ms | < 1500ms | ISR + Edge Cache |
| Individual Project | < 800ms | < 1500ms | ISR + Edge Cache |
| Blog Listing | < 800ms | < 1500ms | ISR + Edge Cache |
| Individual Blog Post | < 1000ms | < 2000ms | ISR + Markdown Parse |
| API Routes | < 200ms | < 500ms | Database Query + Prisma |

### Scalability Metrics

```
Current Architecture Capacity (MVP):

┌──────────────────────────────────────────────────┐
│ Metric              │ Target    │ MVP Capacity   │
├──────────────────────────────────────────────────┤
│ Concurrent Users    │ 100       │ 10,000+        │
│ Requests/Second     │ 10        │ 1,000+         │
│ Database Size       │ 100MB     │ 256MB (free)   │
│ CDN Bandwidth       │ 100GB/mo  │ Unlimited      │
│ Serverless Invokes  │ 10K/day   │ 100K/day (free)│
│ Build Minutes       │ 10/mo     │ 6,000/mo (free)│
└──────────────────────────────────────────────────┘

Performance Benchmarks (Target):
- Time to First Byte (TTFB): < 100ms (edge cached)
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.0s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Lighthouse Performance: > 90
- Lighthouse SEO: > 95
- Lighthouse Accessibility: > 90
```

### Optimization Strategies

**Frontend Optimizations:**

1. **Image Optimization**
   ```tsx
   import Image from 'next/image';

   <Image
     src="/images/projects/aimpactscanner.webp"
     alt="AimpactScanner screenshot"
     width={1200}
     height={630}
     quality={85}
     placeholder="blur"
     blurDataURL="data:image/..." // Low-quality placeholder
     loading="lazy" // Below-the-fold images
   />
   ```
   - WebP/AVIF format conversion (automatic)
   - Responsive sizes (`srcset` generation)
   - Lazy loading below fold
   - Blur placeholder for smooth loading

2. **Font Optimization**
   ```tsx
   import { Inter } from 'next/font/google';

   const inter = Inter({
     subsets: ['latin'],
     display: 'swap',
     variable: '--font-inter',
     preload: true,
   });
   ```
   - Subset to Latin characters only (smaller file size)
   - `font-display: swap` to avoid FOIT (Flash of Invisible Text)
   - Preload critical fonts
   - Variable fonts for multiple weights in one file

3. **Code Splitting**
   ```tsx
   import dynamic from 'next/dynamic';

   // Heavy component loaded only when needed
   const MetricsChart = dynamic(() => import('./MetricsChart'), {
     loading: () => <p>Loading chart...</p>,
     ssr: false, // Client-side only
   });
   ```
   - Automatic per-route splitting
   - Dynamic imports for heavy components
   - Defer non-critical JavaScript

4. **CSS Optimization**
   - Tailwind CSS tree-shaking (only used classes included)
   - Critical CSS inlined in HTML
   - Non-critical CSS loaded asynchronously

**Backend Optimizations:**

1. **Database Query Optimization**
   ```typescript
   // Efficient queries with Prisma
   const projects = await prisma.project.findMany({
     select: {
       // Only fetch needed fields
       id: true,
       slug: true,
       name: true,
       description: true,
       // Skip heavy fields like longDescription
     },
     where: { status: 'ACTIVE' },
     orderBy: { createdAt: 'desc' },
     take: 10, // Limit results
   });
   ```
   - Select only needed fields
   - Index frequently queried columns
   - Limit result sets
   - Use database aggregations instead of app-level

2. **Caching Strategy**
   ```typescript
   // ISR configuration in page component
   export const revalidate = 3600; // Revalidate every 1 hour

   // Aggressive caching for static assets
   // next.config.js
   headers: async () => [
     {
       source: '/images/:path*',
       headers: [
         { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
       ],
     },
   ];
   ```
   - ISR with 1-hour revalidation for dynamic pages
   - Long-term caching for static assets (1 year)
   - Vercel CDN caching at edge (global)

3. **Markdown Parsing Optimization**
   - Parse markdown at build time when possible
   - Cache parsed HTML in memory (LRU cache)
   - Stream large markdown files instead of loading fully

**Monitoring & Continuous Optimization:**
- Weekly Lighthouse audits (automate via CI in v2)
- Monitor Core Web Vitals via Vercel Analytics
- Database query performance tracking (Prisma slow query log)
- Bundle size tracking (alert if JS bundle > 200KB)

---

## Scaling Strategy

### Current Architecture: Solo Operator (0-10K visitors/month)

**Capacity**:
- Concurrent users: 100-500
- Requests/second: 10-50
- Database: 256MB (hundreds of projects, thousands of posts)
- Serverless invocations: 10K-50K/month

**Bottlenecks**: None expected at this scale

**Costs**: $0-20/month (Vercel hobby plan free, domain $12/year)

### Phase 2: Growing Audience (10K-100K visitors/month)

**Changes Required**:
- Upgrade to Vercel Pro plan ($20/month)
- Scale Vercel Postgres storage (512MB → 1GB)
- Add Redis caching for hot data (Upstash free tier)
- Implement proper rate limiting (Upstash Ratelimit)

**New Components**:
```
┌────────────────────┐
│ Upstash Redis      │ <-- Cache hot queries (project metrics)
│ (Edge caching)     │     Rate limiting state
└────────────────────┘

┌────────────────────┐
│ Vercel Pro Plan    │ <-- Higher limits, better DDoS protection
│ (DDoS mitigation)  │     Team collaboration features
└────────────────────┘
```

**Estimated Costs**: $20-50/month

### Phase 3: Viral Growth / Productization (100K-1M visitors/month)

**Architecture Evolution**:
- Separate read replicas for database (Vercel Postgres Enterprise)
- Implement full-text search (Algolia or Meilisearch)
- CDN optimization for static assets (existing Vercel CDN sufficient)
- Real-time metrics automation (integrate project APIs)

**New Components**:
```
┌────────────────────┐
│ Algolia Search     │ <-- Full-text search for blog/portfolio
│ (10K requests/mo)  │     Faster than database queries
└────────────────────┘

┌────────────────────┐
│ Database Replicas  │ <-- Read scaling
│ (Postgres)         │     Write to primary, read from replicas
└────────────────────┘

┌────────────────────┐
│ Background Jobs    │ <-- Metrics automation
│ (Vercel Cron)      │     Scheduled data fetching
└────────────────────┘
```

**Estimated Costs**: $100-300/month

### Database Scaling Strategy

```
Database Scaling Progression:

Phase 1 (Current): Single Postgres Instance
┌─────────────────────────────────┐
│ Vercel Postgres (256MB)         │
│ - All reads and writes          │
│ - Connection pooling (Prisma)   │
│ - Backup: Daily (7-day retention)│
└─────────────────────────────────┘
Capacity: 10K-100K visitors/month

Phase 2: Larger Single Instance + Redis
┌─────────────────────────────────┐
│ Vercel Postgres (1GB)           │
│ - All reads and writes          │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Upstash Redis (Cache)           │
│ - Hot data (project metrics)    │
│ - Session storage (if auth v2)  │
└─────────────────────────────────┘
Capacity: 100K-500K visitors/month

Phase 3: Read Replicas + Full-Text Search
┌─────────────────────────────────┐
│ Primary Database (Writes)       │
└──────────────┬──────────────────┘
               │ Replication
               ▼
┌─────────────────────────────────┐
│ Read Replica 1                  │ <-- API queries
│ Read Replica 2 (optional)       │ <-- Analytics queries
└─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Algolia (Search Index)          │ <-- Full-text search
└─────────────────────────────────┘
Capacity: 500K-5M visitors/month
```

**Migration Path**:
- Phase 1 → 2: Enable Redis, update queries to check cache first (1-2 days)
- Phase 2 → 3: Set up read replicas, route read queries to replicas (1 week)
- Prisma makes this easy: `prisma.$executeRaw` for writes, `prisma.$queryRaw` for reads

---

## Architecture Decisions & Rationale

### Critical Architecture Decisions

#### Decision 1: Monolithic Next.js App (vs. Microservices)

**Choice**: Single Next.js application with App Router

**Alternatives Considered**:
- Microservices architecture (separate frontend, API, CMS)
- Headless CMS (Contentful, Sanity) + Next.js frontend
- Static site generator (Astro, Hugo) + separate API

**Rationale**:
- **Solo operator efficiency**: One codebase, one deployment, minimal overhead
- **MVP speed**: No microservice orchestration, API contracts, or CORS complexity
- **Cost**: Single hosting bill (Vercel), no separate CMS subscription
- **Simplicity**: Fewer moving parts = fewer failure points
- **Colocation benefits**: API routes and frontend share types, utilities, database client

**Trade-offs**:
- ✅ Pros: Faster development, lower cost, simpler operations, better DX
- ❌ Cons: Harder to scale teams (not a concern for solo operator), all-or-nothing deploys (mitigated by Vercel's instant rollback)

**When to Reconsider**: If hiring a dedicated backend team or if API needs to serve multiple clients (mobile apps, third-party integrations)

#### Decision 2: Neon Database (vs. Supabase)

**Choice**: Neon (Serverless Postgres with branching)

**Alternatives Considered**:
- **Supabase**: Postgres + Auth + Real-time + Storage
- **PlanetScale**: MySQL serverless with branching
- **MongoDB Atlas**: NoSQL document database

**Rationale**:
- **Branch databases**: Isolated preview databases for each Netlify deployment
- **Serverless scaling**: Pay-per-use, auto-scaling, built-in connection pooling
- **Developer experience**: Git-like branching for databases, instant provisioning
- **Postgres familiarity**: Standard SQL, mature ecosystem, excellent Prisma support
- **Cost-effective**: Generous free tier with 512MB storage, scales affordably

**Trade-offs**:
- ✅ Pros: Simpler setup (5 minutes vs. 30 minutes), one vendor, excellent DX, free tier sufficient
- ❌ Cons: No built-in auth (not needed for MVP), no real-time subscriptions (not needed for MVP), slightly more expensive at scale (but still cheap)

**When to Reconsider**: If real-time features needed (v2 metrics dashboard with live updates) or if auth requirements become complex (multi-tenant SaaS pivot)

#### Decision 3: File-Based Blog Content (vs. Database CMS)

**Choice**: Markdown files in Git repository

**Alternatives Considered**:
- **Database-stored content**: Blog posts in Postgres with rich text editor
- **Headless CMS**: Contentful, Sanity, Strapi
- **MDX**: Markdown with embedded React components

**Rationale**:
- **Git-native workflow**: Jamie already uses Git; no new tools to learn
- **Version control built-in**: Full history of content changes, easy rollback
- **Zero deployment friction**: Edit markdown → commit → push = published (2-3 minutes)
- **No CMS lock-in**: Content is portable, owned forever
- **Simple mental model**: Markdown is universal, no proprietary syntax

**Trade-offs**:
- ✅ Pros: Simple workflow, no CMS subscription, version controlled, portable, fast builds
- ❌ Cons: No WYSIWYG editor (not needed for technical audience), requires Git knowledge (Jamie already proficient)

**When to Reconsider**: If hiring non-technical content creators or if rich media embeds become critical

#### Decision 4: Manual Metrics (vs. Real-Time Automation)

**Choice**: Manual metrics updates via admin form (weekly or bi-weekly)

**Alternatives Considered**:
- **Real-time automation**: Integrate with Stripe, analytics APIs, project databases
- **Scheduled automation**: Cron jobs fetching metrics nightly
- **Hybrid**: Manual for some projects, automated for others

**Rationale**:
- **MVP speed**: Manual metrics = launch in days; automation = weeks of API integration work
- **Validation first**: Prove the concept before investing in complex automation
- **10 diverse projects**: Each project has different APIs (Stripe, GA, custom databases); standardizing is complex
- **Acceptable latency**: Metrics updated weekly is fine for portfolio (not real-time trading dashboard)
- **5-minute weekly workflow**: Simple form update takes less time than debugging API integrations

**Trade-offs**:
- ✅ Pros: Ship in 4-6 weeks vs. 3+ months, validate concept first, simpler architecture
- ❌ Cons: Manual work weekly (but only 5 minutes), slight data staleness (acceptable for use case)

**When to Reconsider**: After validating audience demand, automate high-value metrics first (e.g., Stripe MRR), leave low-value manual

#### Decision 5: ISR with 1-Hour Revalidation (vs. SSR or Pure SSG)

**Choice**: Incremental Static Regeneration (ISR) with 1-hour revalidation for dynamic pages

**Alternatives Considered**:
- **Pure SSG**: Build all pages at deploy time
- **Server-Side Rendering (SSR)**: Generate pages on every request
- **Client-Side Rendering (CSR)**: Fetch data in browser

**Rationale**:
- **Performance**: Static pages served from edge CDN (< 50ms response time)
- **Freshness**: Content revalidates every hour; acceptable staleness for portfolio/blog
- **Build time**: ISR doesn't rebuild entire site; only changed pages regenerate
- **SEO**: Pre-rendered HTML; perfect for search engines
- **Metrics updates**: After updating metrics, pages automatically refresh within 1 hour (or on-demand revalidation)

**Trade-offs**:
- ✅ Pros: Best performance, excellent SEO, low infrastructure cost, auto-scaling
- ❌ Cons: Up to 1-hour staleness (acceptable), more complex than pure SSG (but Next.js handles it)

**When to Reconsider**: If real-time updates become critical (unlikely for portfolio/blog)

### Technology Selection Rationale

| Component | Technology | Why Chosen | Alternatives Considered |
|-----------|------------|------------|------------------------|
| **Frontend Framework** | Next.js 14 (App Router) | Industry standard for React SSR/SSG, excellent DX, Vercel integration, large community | Remix (less mature ecosystem), Astro (less dynamic), Create React App (outdated) |
| **Language** | TypeScript | Type safety prevents bugs, better DX with autocomplete, industry standard | JavaScript (fewer safety guarantees), ReScript (too niche) |
| **Styling** | Tailwind CSS | Utility-first = fast development, small bundle (tree-shaking), no naming conflicts | CSS Modules (more verbose), styled-components (larger bundle), Sass (less modern) |
| **Database** | Vercel Postgres | Serverless, auto-scaling, excellent Prisma integration, single vendor | Supabase (unnecessary auth features), PlanetScale (MySQL less familiar), MongoDB (overkill for relational data) |
| **ORM** | Prisma | Type-safe queries, excellent DX, auto-generated types, migration management | Drizzle (less mature), raw SQL (no type safety), TypeORM (more complex) |
| **Deployment** | Vercel | Zero-config Next.js deployment, global CDN, serverless functions, built-in analytics | Netlify (less Next.js optimization), Cloudflare Pages (more complex), AWS Amplify (overkill) |
| **Markdown Parser** | gray-matter + remark | Simple, standard, no build complexity, syntax highlighting via rehype | next-mdx-remote (overkill), Contentlayer (extra build step), marked (less extensible) |
| **Form Validation** | Zod | Runtime type checking, excellent TypeScript integration, composable schemas | Yup (less TS-first), Joi (backend-focused), class-validator (more boilerplate) |
| **Analytics** | Vercel Analytics | Built-in, privacy-friendly, no cookies, Core Web Vitals tracking | Plausible (extra cost), Google Analytics (privacy concerns), PostHog (overkill for MVP) |

---

## Future Considerations

### Planned Improvements (v2 Roadmap)

**Post-MVP Features** (After Launch + Validation):

- [ ] **Automated Metrics Dashboard** (2-3 weeks)
  - Integrate Stripe API for MRR data
  - Pull user counts from project databases
  - Scheduled cron jobs (nightly updates)
  - Historical charts (past 90 days)

- [ ] **"The Playbook" Content Section** (1-2 weeks)
  - Thought leadership articles
  - Frameworks and templates
  - Evergreen content vs. Journey's weekly updates

- [ ] **Newsletter Integration** (1 week)
  - ConvertKit or Beehiiv integration
  - Email capture form
  - Automated weekly digest of new posts

- [ ] **Theme Toggle** (2-3 days)
  - Dark mode (default) + light mode
  - User preference persistence (localStorage)
  - Smooth theme transition

- [ ] **Comment System** (1 week)
  - Giscus (GitHub Discussions backend) or Hyvor Talk
  - Spam protection
  - Moderation workflow

- [ ] **Advanced Portfolio Filtering** (2-3 days)
  - Filter by category, tech stack, status
  - Sort by MRR, users, launch date
  - Search functionality (client-side or Algolia)

- [ ] **Project Metrics History Charts** (1 week)
  - Line charts showing MRR/user growth over time
  - Chart.js or Recharts for visualization
  - Populate from `metrics_history` table

- [ ] **RSS Feed Enhancement** (1 day)
  - Full-text RSS feed (not just excerpts)
  - JSON Feed format (in addition to XML)

- [ ] **Social Proof Widgets** (2-3 days)
  - Twitter follower count
  - Email subscriber count
  - GitHub stars/forks for open-source projects

### Technical Debt

**Identified for Future Resolution**:

1. **Lack of Automated Testing** (Priority: Medium)
   - Current: No unit tests, no integration tests, no E2E tests
   - Debt: Risk of regressions as features added
   - Mitigation: Start with critical path E2E tests (Playwright)
   - Plan: Add Vitest for unit tests, Playwright for E2E (1 week effort)

2. **No Error Monitoring** (Priority: Medium)
   - Current: Errors only visible in Vercel logs
   - Debt: Delayed detection of production issues
   - Mitigation: Monitor Vercel dashboard daily
   - Plan: Integrate Sentry (2-3 hours effort)

3. **Manual Metrics Updates** (Priority: Low for MVP, High for v2)
   - Current: Manual form updates weekly
   - Debt: Time investment, potential staleness
   - Mitigation: Keep metrics update workflow under 5 minutes
   - Plan: Automate high-value metrics first (Stripe MRR), defer low-value

4. **Single Admin User** (Priority: Low)
   - Current: One admin password, no user management
   - Debt: Can't delegate content creation to others
   - Mitigation: Sufficient for solo operator; not blocking
   - Plan: Add NextAuth.js if hiring content team (1-2 days effort)

5. **No Database Backups** (Priority: Medium)
   - Current: Relying on Vercel's automated backups
   - Debt: No self-managed backup strategy
   - Mitigation: Vercel has 7-day automated backups
   - Plan: Add weekly backup script to S3 (1 day effort)

### Migration Path

**Potential Future Architectural Changes**:

#### Scenario 1: Scaling to 1M+ Visitors/Month

**Current**: Monolithic Next.js on Vercel
**Future**: Keep monolith, add caching and read replicas
**Migration Steps**:
1. Add Redis caching layer (Upstash) - 1 day
2. Set up Postgres read replicas - 2 days
3. Route read queries to replicas via Prisma - 1 day
4. Monitor performance, optimize slow queries - ongoing

**Estimated Downtime**: Zero (incremental changes)

#### Scenario 2: Adding Mobile App

**Current**: Web-only application
**Future**: Shared API for web + mobile
**Migration Steps**:
1. Extract API routes to dedicated `/api/*` structure - already done
2. Add mobile-specific endpoints (pagination, smaller payloads) - 1 week
3. Implement JWT authentication for mobile - 3 days
4. Add rate limiting per client - 2 days
5. Build React Native app consuming API - 4-6 weeks

**Estimated Downtime**: Zero (API is additive, web unaffected)

#### Scenario 3: Pivoting to SaaS Product

**Current**: Personal portfolio
**Future**: Multi-tenant SaaS platform
**Migration Steps**:
1. Add user authentication (NextAuth.js) - 3 days
2. Add workspace/team concept to database schema - 1 week
3. Implement row-level security (Prisma middleware) - 1 week
4. Add billing integration (Stripe subscriptions) - 1 week
5. Build tenant-specific admin dashboards - 2-3 weeks
6. Data migration from single-tenant to multi-tenant - 1 week

**Estimated Downtime**: 1-2 hours for database migration

---

## Appendices

### A. Glossary

- **ISR (Incremental Static Regeneration)**: Next.js feature that regenerates static pages on-demand after a time interval, combining SSG performance with dynamic data freshness
- **SSG (Static Site Generation)**: Pre-rendering pages at build time into static HTML
- **SSR (Server-Side Rendering)**: Generating HTML on each request on the server
- **Edge Functions**: Serverless functions deployed to CDN edge locations for low-latency execution
- **CSP (Content Security Policy)**: HTTP header that prevents XSS attacks by restricting script sources
- **Nonce**: Cryptographic number used once (for CSP script allowlisting)
- **Prisma**: Type-safe Node.js ORM with auto-generated types and migrations
- **JAMstack**: JavaScript, APIs, Markup - modern web architecture based on pre-rendering and decoupling
- **Vercel Edge Network**: Global CDN with 20+ locations for fast content delivery
- **Web Vitals**: Google's core metrics for user experience (LCP, FID, CLS)

### B. References

**Architecture Patterns Used**:
- JAMstack Architecture: https://jamstack.org/
- Incremental Static Regeneration: https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration
- Serverless Functions: https://vercel.com/docs/concepts/functions/serverless-functions
- Database Connection Pooling: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

**Key Libraries and Frameworks**:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- React: https://react.dev/
- Zod: https://zod.dev/

**External Documentation Links**:
- Vercel Documentation: https://vercel.com/docs
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Next.js App Router: https://nextjs.org/docs/app
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

### C. Implementation Guidance for Developer

**Component Hierarchy** (Top → Bottom):

1. **Layout Components** (Shared across pages)
   - `app/layout.tsx` - Root layout with Header/Footer
   - `components/layout/Header.tsx` - Logo, navigation, mobile menu
   - `components/layout/Footer.tsx` - Social links, copyright
   - `components/layout/MobileMenu.tsx` - Hamburger menu for mobile

2. **Page Components** (One per route)
   - `app/page.tsx` - Home page (Hero, portfolio overview, recent posts)
   - `app/portfolio/page.tsx` - Portfolio listing (grid of projects)
   - `app/portfolio/[slug]/page.tsx` - Individual project page
   - `app/journey/page.tsx` - Blog listing (post grid with pagination)
   - `app/journey/[slug]/page.tsx` - Individual blog post
   - `app/about/page.tsx` - About page (personal story)
   - `app/admin/page.tsx` - Admin dashboard (metrics form)

3. **Reusable Components** (Used by multiple pages)
   - `components/ui/Button.tsx` - Primary button component
   - `components/ui/Card.tsx` - Card wrapper for content
   - `components/ui/Badge.tsx` - Technology/category badges
   - `components/portfolio/ProjectCard.tsx` - Portfolio grid item
   - `components/portfolio/MetricsDisplay.tsx` - MRR/users visualization
   - `components/blog/PostCard.tsx` - Blog post preview card
   - `components/blog/PostContent.tsx` - Markdown renderer with syntax highlighting
   - `components/blog/ShareButtons.tsx` - Twitter/LinkedIn share buttons

**Utility Functions** (Helper libraries):

```typescript
// lib/prisma.ts - Prisma client singleton
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// lib/markdown.ts - Markdown parsing
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import highlight from 'rehype-highlight';

export async function parseMarkdown(filePath: string) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const processedContent = await remark().use(html).use(highlight).process(content);
  return { frontmatter: data, html: processedContent.toString() };
}

// lib/seo.ts - SEO metadata generation
export function generateMetadata(page: PageData) {
  return {
    title: `${page.title} | Jamie Watters`,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      images: [{ url: page.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      creator: '@jamiewatters',
    },
  };
}

// lib/validation.ts - Zod schemas
import { z } from 'zod';
export const MetricsUpdateSchema = z.object({
  projectId: z.string().uuid(),
  metrics: z.object({
    mrr: z.number().min(0),
    users: z.number().int().min(0),
  })
});
```

**Third-Party Libraries to Install**:

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "zod": "^3.22.0",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.0",
    "remark-html": "^16.0.0",
    "rehype-highlight": "^7.0.0",
    "bcrypt": "^5.1.1",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "prisma": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Development Workflow for Developer**:

1. **Initial Setup** (30 minutes)
   ```bash
   # Clone repository
   git clone https://github.com/jamiewatters/jamiewatters-work.git
   cd jamiewatters-work

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env.local
   # Edit .env.local with database URL and admin password hash

   # Set up database
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed  # Seed with Jamie's 10 projects

   # Start development server
   npm run dev
   # Open http://localhost:3000
   ```

2. **Daily Development** (Recommended Order)
   - **Day 1-2**: Set up project structure, configure Tailwind, create layout components
   - **Day 3-4**: Build home page, portfolio listing, individual project pages
   - **Day 5-6**: Build blog listing, individual post pages, markdown parsing
   - **Day 7-8**: Build admin dashboard, metrics update API
   - **Day 9-10**: SEO optimization (meta tags, sitemap, robots.txt)
   - **Day 11-12**: Performance optimization (image optimization, code splitting)
   - **Day 13-14**: Testing, bug fixes, polish

3. **Testing Workflow**
   - Manual testing in browser (Chrome DevTools)
   - Lighthouse audits for performance/SEO
   - Test on mobile devices (responsive design)
   - Cross-browser testing (Chrome, Firefox, Safari)

4. **Deployment Workflow**
   ```bash
   # Commit changes
   git add .
   git commit -m "Add portfolio pages"

   # Push to GitHub (triggers Vercel deployment)
   git push origin main

   # Monitor deployment in Vercel dashboard
   # Verify live site at https://jamiewatters.work
   ```

---

### D. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-08 | 1.0 | Initial architecture design for MVP | The Architect (AGENT-11) |

---

*Last Updated: 2025-10-08*
*Architecture Version: 1.0*
*Status: Approved (Phase 2 Complete)*

**Next Steps**: Proceed to Phase 3 - UI/UX Design with @designer
