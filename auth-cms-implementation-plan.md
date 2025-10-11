# Authentication & Content Management System - Implementation Plan

**Project**: JamieWatters.work Journey/Blog Enhancement
**Date**: October 9, 2025
**Mission Type**: Feature Development (Authentication + CMS + Commenting)

---

## Executive Summary

Build a comprehensive authentication and content management system for jamiewatters.work with:
- **Admin capabilities** for managing journey updates via intuitive wizard
- **Public commenting system** for follower engagement
- **OAuth authentication** (Google/GitHub) with magic link fallback
- **Role-based access control** (Admin vs User)
- **LinkedIn integration** for cross-platform content sharing

---

## Current State Analysis

### Existing Infrastructure
- **Stack**: Next.js 15, Prisma, PostgreSQL (Neon), TypeScript
- **Admin Page**: Basic password-only authentication (`/app/admin/page.tsx`)
- **Database**: Prisma schema exists with Post and Project models
- **Content**: Currently using placeholder data in code (`lib/placeholder-data.ts`)
- **Journey Page**: Public listing of posts (`/app/journey/page.tsx`)

### Gaps Identified
1. ❌ No OAuth authentication (only simple password)
2. ❌ No user management or profiles
3. ❌ No commenting system
4. ❌ No admin CMS for creating journey entries
5. ❌ Content hardcoded in placeholder files
6. ❌ No role-based access control
7. ❌ No LinkedIn integration

---

## Proposed Architecture

### 1. Authentication System (Supabase Auth)

**Why Supabase?**
- ✅ Best-in-class authentication with OAuth providers
- ✅ Magic links and passwordless auth built-in
- ✅ Row-Level Security (RLS) for database policies
- ✅ Seamless PostgreSQL integration
- ✅ MCP tool available (`mcp__supabase`)
- ✅ Battle-tested, secure, and scalable

**Authentication Methods**:
1. **Primary**: OAuth with Google and GitHub
2. **Fallback**: Magic link (email-based passwordless)
3. **Admin Override**: Keep simple password option as backup

**Role System**:
- `ADMIN` - You (full access to CMS, moderation, analytics)
- `USER` - Followers (can comment, access premium resources)

---

### 2. User Journey Flows

#### **Visitor Journey (Unauthenticated)**
```
1. Land on /journey page
2. Browse public journey posts
3. Click post to read full content
4. See comments section (view only)
5. Want to comment → Prompted to sign up/login
6. Choose: Google OAuth | GitHub OAuth | Magic Link
7. Account created → Redirected back to post
8. Can now comment and access additional resources
```

#### **Admin Journey (You)**
```
1. Navigate to /admin
2. Login with OAuth or password
3. Dashboard shows:
   - Recent posts (edit/delete)
   - Analytics overview
   - "Add Journey Entry" button
4. Click "Add Journey Entry" → Opens wizard:

   Step 1: Basic Info
   - Title
   - Excerpt
   - Tags
   - Featured image (optional)

   Step 2: Content
   - Rich markdown editor
   - Live preview
   - Image upload

   Step 3: Additional Resources
   - Add premium content links
   - Set access level (public/followers only)

   Step 4: Publishing Options
   - Save as draft
   - Publish immediately
   - Schedule for later
   - ☑️ Auto-share to LinkedIn

   Step 5: Preview & Publish
   - Full post preview
   - SEO preview (title, meta description)
   - Publish button

5. Published → Redirected to live post
6. LinkedIn auto-share (if enabled) triggers
```

#### **Follower Journey (Authenticated User)**
```
1. Login via OAuth or magic link
2. Browse journey posts
3. Read post content
4. Leave comment
5. Access follower-only resources
6. Receive email notifications (optional)
7. Manage profile and preferences
```

---

### 3. Database Schema Design

#### **New Tables (Prisma Schema Updates)**

```prisma
// User Profile (synced with Supabase Auth)
model UserProfile {
  id        String   @id // matches Supabase auth.users.id
  email     String   @unique
  name      String?
  avatar    String?
  role      UserRole @default(USER)
  bio       String?  @db.Text

  // Preferences
  emailNotifications Boolean @default(true)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  comments  Comment[]

  @@index([email])
  @@index([role])
}

enum UserRole {
  ADMIN
  USER
}

// Comments on Journey Posts
model Comment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      UserProfile @relation(fields: [userId], references: [id])
  content   String   @db.Text

  // Moderation
  approved  Boolean  @default(true) // Can be changed to false for moderation queue
  flagged   Boolean  @default(false)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId])
  @@index([userId])
  @@index([createdAt])
}

// Update existing Post model
model Post {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  excerpt     String   @db.Text
  content     String   @db.Text // Full markdown content
  tags        String[]
  readTime    Int      // Minutes

  // Publishing
  published   Boolean  @default(false)
  publishedAt DateTime?
  scheduledFor DateTime? // For scheduled publishing

  // Social sharing
  linkedInShared Boolean @default(false)
  linkedInUrl    String? // URL of LinkedIn post

  // Premium content
  premiumResources Json? // Array of {title, url, accessLevel}

  // SEO
  metaDescription String?
  featuredImage   String? // URL to image

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  comments    Comment[]

  @@index([publishedAt])
  @@index([published])
  @@index([slug])
}
```

---

### 4. Admin Content Management Wizard

**Component Structure**: `/app/admin/journey/new/page.tsx`

#### **Multi-Step Wizard UI**

**Step 1: Basic Information**
```typescript
interface BasicInfo {
  title: string;           // Post title
  excerpt: string;         // Short description (160 chars)
  tags: string[];          // Topics/categories
  featuredImage?: string;  // Optional cover image
  metaDescription?: string; // SEO meta description
}
```

**Step 2: Content Editor**
```typescript
interface ContentEditor {
  content: string;         // Markdown content
  // Features:
  // - Live markdown preview
  // - Image upload with drag-drop
  // - Code syntax highlighting preview
  // - Heading/link/list shortcuts
  // - Auto-save drafts
}
```

**Step 3: Additional Resources**
```typescript
interface PremiumResource {
  title: string;
  url: string;
  description?: string;
  accessLevel: 'public' | 'followers_only' | 'admin_only';
}

interface ResourcesStep {
  resources: PremiumResource[];
}
```

**Step 4: Publishing Options**
```typescript
interface PublishingOptions {
  publishNow: boolean;
  scheduledFor?: Date;
  shareToLinkedIn: boolean;
  linkedInMessage?: string; // Custom message for LinkedIn post
}
```

**Step 5: Preview & Publish**
```typescript
// Full preview of:
// - Post as it will appear on site
// - SEO preview (Google search result)
// - LinkedIn share preview (if enabled)
// - Final confirmation before publishing
```

---

### 5. LinkedIn Integration

**OAuth Setup**:
- Register app with LinkedIn Developer Program
- Obtain Client ID and Secret
- Configure OAuth callback URLs
- Request permissions: `w_member_social`, `r_basicprofile`

**Auto-Share Flow**:
```typescript
1. User enables "Share to LinkedIn" in wizard
2. On publish, trigger LinkedIn API call
3. POST to LinkedIn Share API with:
   - Post title
   - Excerpt
   - Link to full post
   - Featured image (if available)
4. Store LinkedIn post URL in database
5. Mark as shared (linkedInShared: true)
```

**Admin Controls** (visible only to ADMIN role):
- Toggle auto-share on/off per post
- Edit LinkedIn message before sharing
- View share analytics (likes, comments, shares)
- Reshare option for updated posts

---

## Implementation Phases

### **Phase 1: Authentication Foundation** (Week 1)

**Tasks**:
- [ ] Create Supabase project and obtain credentials
- [ ] Install Supabase client libraries (`@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`)
- [ ] Configure Supabase Auth with OAuth providers (Google, GitHub)
- [ ] Enable magic link authentication
- [ ] Create auth middleware for protected routes
- [ ] Build login/signup UI components
- [ ] Implement session management
- [ ] Test OAuth flows (Google, GitHub, Magic Link)

**Deliverables**:
- ✅ Working OAuth login (Google, GitHub)
- ✅ Magic link fallback functional
- ✅ Protected route middleware
- ✅ User session persistence

**Specialist**: Developer + Tester

---

### **Phase 2: User & Role Management** (Week 1)

**Tasks**:
- [ ] Extend Prisma schema with UserProfile model
- [ ] Create database migration
- [ ] Build user sync (Supabase Auth → Prisma)
- [ ] Implement role-based middleware (admin check)
- [ ] Update admin dashboard with proper auth
- [ ] Create user profile page
- [ ] Build admin user management UI

**Deliverables**:
- ✅ UserProfile table populated
- ✅ Admin role properly enforced
- ✅ User profile management working
- ✅ Role-based route protection

**Specialist**: Developer + Architect

---

### **Phase 3: Content Management System** (Week 2)

**Tasks**:
- [ ] Build admin content wizard component (5 steps)
- [ ] Create journey entry CRUD API routes
- [ ] Implement markdown editor with live preview
- [ ] Add draft/published workflow
- [ ] Build image upload functionality
- [ ] Create premium resources management
- [ ] Implement auto-save for drafts
- [ ] Build post scheduling system

**Deliverables**:
- ✅ Admin wizard fully functional
- ✅ Journey entries created via CMS (not hardcoded)
- ✅ Draft/publish workflow working
- ✅ Markdown editor with preview
- ✅ Image uploads functional

**Specialist**: Developer + Designer

---

### **Phase 4: Commenting System** (Week 2)

**Tasks**:
- [ ] Extend Post model with comments relation
- [ ] Create Comment model in Prisma
- [ ] Build comment API routes (CRUD)
- [ ] Create comment UI components
- [ ] Implement real-time updates (Supabase Realtime)
- [ ] Add comment moderation tools (admin only)
- [ ] Build comment flagging system
- [ ] Implement rate limiting (prevent spam)

**Deliverables**:
- ✅ Users can comment on posts
- ✅ Comments display in real-time
- ✅ Admin can moderate/delete comments
- ✅ Comment spam prevention working

**Specialist**: Developer + Tester

---

### **Phase 5: LinkedIn Integration** (Week 3)

**Tasks**:
- [ ] Set up LinkedIn OAuth app
- [ ] Build LinkedIn OAuth flow
- [ ] Implement share-to-LinkedIn API route
- [ ] Create LinkedIn preview in wizard
- [ ] Add LinkedIn share tracking
- [ ] Build reshare functionality
- [ ] Implement share analytics display

**Deliverables**:
- ✅ LinkedIn auto-share working
- ✅ Share tracking in database
- ✅ Admin can preview before sharing
- ✅ Analytics visible in admin dashboard

**Specialist**: Developer + Operator

---

### **Phase 6: Premium Resources & Access Control** (Week 3)

**Tasks**:
- [ ] Build resource access control logic
- [ ] Create premium content gating UI
- [ ] Add follower-only sections
- [ ] Implement email notification system (optional)
- [ ] Build user preferences page
- [ ] Add analytics tracking

**Deliverables**:
- ✅ Premium resources gated correctly
- ✅ Followers can access exclusive content
- ✅ Access control enforced at API level
- ✅ Email notifications optional

**Specialist**: Developer + Tester

---

## Technical Decisions & Rationale

### ✅ **Supabase Over Custom Auth**

**Decision**: Use Supabase for authentication instead of building custom solution

**Rationale**:
- **Security**: Battle-tested, audited authentication system
- **Speed**: OAuth, magic links, password reset out-of-box
- **Scale**: Handles sessions, tokens, rate limiting automatically
- **Maintenance**: Zero auth-related security patches to manage
- **MCP Available**: `mcp__supabase` tools available for rapid integration
- **Cost**: Free tier generous, scales with usage

**Trade-offs**:
- ❌ Vendor dependency (mitigated by open-source alternatives)
- ❌ Learning curve for RLS policies (mitigated by good docs)
- ✅ Saves weeks of development time
- ✅ Enterprise-grade security out-of-box

---

### ✅ **Role-Based Access Control (RBAC)**

**Decision**: Simple two-tier role system (ADMIN, USER)

**Rationale**:
- **Simplicity**: Only two roles needed initially
- **Extensible**: Easy to add PREMIUM_USER tier later
- **Enforcement**: Multiple layers (Supabase RLS + API middleware + UI)
- **Security**: Never trust client-side role checks

**Implementation**:
```typescript
// Row-Level Security (Supabase)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Only admins can insert/update posts"
  ON posts FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM user_profiles WHERE role = 'ADMIN'
  ));

// API Middleware (Next.js)
export async function requireAdmin(req: Request) {
  const user = await getUser(req);
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
}

// UI Components
{user.role === 'ADMIN' && <AdminControls />}
```

---

### ✅ **Content Wizard vs Simple Form**

**Decision**: Multi-step wizard for journey entry creation

**Rationale**:
- **UX**: Complex forms broken into digestible steps
- **Validation**: Each step validated before proceeding
- **Preview**: See exactly how post will look before publishing
- **Professional**: Matches quality of your personal brand
- **Flexibility**: Easy to add steps (e.g., SEO optimization)

**Alternative Considered**: Single long form
- ❌ Overwhelming for complex posts
- ❌ Higher error rate
- ❌ No preview until after publish
- ✅ Wizard provides superior UX

---

### ✅ **LinkedIn Auto-Share**

**Decision**: Integrate LinkedIn sharing directly in CMS

**Rationale**:
- **Audience Building**: Reach followers on their preferred platform
- **Consistency**: Every journey update shared automatically
- **Traffic**: Drives readers back to your site
- **Metrics**: Track engagement across platforms
- **Brand**: Unified presence across web and LinkedIn

**Implementation Options**:
1. **Auto-share** (recommended): Publish → Auto-post to LinkedIn
2. **Manual**: Generate preview, admin approves before sharing
3. **Scheduled**: Queue posts for optimal posting times

---

### ✅ **Markdown Over Rich Text Editor**

**Decision**: Use markdown for content creation with live preview

**Rationale**:
- **Developer-friendly**: You're comfortable with markdown
- **Version control**: Easy to track changes in plain text
- **Performance**: Lightweight, no heavy WYSIWYG libraries
- **Flexibility**: Can include code blocks with syntax highlighting
- **Portability**: Content not locked to specific editor

**Editor Features**:
- Live preview (side-by-side or toggle)
- Toolbar shortcuts (bold, italic, links, images)
- Image upload with drag-drop
- Auto-save drafts
- Syntax highlighting for code blocks

---

## Security Considerations (CRITICAL)

### 🔒 **Authentication Security**

**Requirements**:
1. ✅ Use Supabase Auth (industry standard, regularly audited)
2. ✅ Implement CSRF protection on all forms
3. ✅ Secure session management (HTTP-only cookies)
4. ✅ Rate limiting on auth endpoints (prevent brute force)
5. ✅ Multi-factor authentication option (future enhancement)

**Implementation**:
```typescript
// CSRF Protection (Next.js middleware)
import { csrf } from '@/lib/csrf';

export async function middleware(req: Request) {
  await csrf.verify(req);
}

// Rate Limiting (Upstash Redis or Vercel KV)
import { ratelimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const { success } = await ratelimit.limit(req.ip);
  if (!success) return new Response('Too many requests', { status: 429 });
}
```

---

### 🔒 **Authorization Security**

**Requirements**:
1. ✅ Row-Level Security (RLS) policies in Supabase
2. ✅ Server-side role checks on ALL admin routes
3. ✅ API route protection with middleware
4. ✅ Never trust client-side role checks
5. ✅ Audit logs for admin actions

**RLS Policies**:
```sql
-- Posts: Only admins can modify
CREATE POLICY "admin_full_access" ON posts
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'ADMIN'
    )
  );

-- Comments: Users can only edit their own
CREATE POLICY "users_own_comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments: Admins can moderate all
CREATE POLICY "admin_moderate_all" ON comments
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE role = 'ADMIN'
    )
  );
```

---

### 🔒 **Content Security**

**Requirements**:
1. ✅ Sanitize all user-generated content (comments)
2. ✅ Content Security Policy (CSP) headers
3. ✅ XSS prevention in markdown rendering
4. ✅ SQL injection prevention (Prisma handles this)
5. ✅ File upload validation (type, size limits)

**Implementation**:
```typescript
// Comment Sanitization
import DOMPurify from 'isomorphic-dompurify';

const sanitizedComment = DOMPurify.sanitize(userComment, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
  ALLOWED_ATTR: ['href']
});

// CSP Headers (next.config.js)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co;
  frame-ancestors 'none';
`;

// File Upload Validation
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

---

### 🔒 **API Security**

**Requirements**:
1. ✅ API rate limiting (prevent abuse)
2. ✅ Input validation with Zod schemas
3. ✅ Error handling (don't leak sensitive info)
4. ✅ CORS configuration (restrict origins)
5. ✅ Request size limits

**Implementation**:
```typescript
// Zod Validation
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  tags: z.array(z.string()).max(10),
  published: z.boolean(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const validated = createPostSchema.parse(body); // Throws on invalid
  // ... proceed with validated data
}

// Error Handling
try {
  // ... operation
} catch (error) {
  console.error('Admin operation failed:', error); // Log details server-side
  return new Response('Operation failed', { status: 500 }); // Generic message to client
}
```

---

## Success Metrics

### **Authentication**
- ✅ OAuth login working (Google, GitHub)
- ✅ Magic link fallback functional
- ✅ Session persistence across page refreshes
- ✅ Logout working correctly
- ✅ Role-based access enforced

### **Content Management**
- ✅ Admin can create journey entries via wizard
- ✅ Posts saved as drafts and published
- ✅ Markdown rendering correctly with preview
- ✅ Images upload and display properly
- ✅ Premium resources access controlled

### **Commenting**
- ✅ Users can comment on posts
- ✅ Comments display in real-time
- ✅ Admin can moderate/delete comments
- ✅ Comment spam prevention working

### **LinkedIn Integration**
- ✅ Auto-share to LinkedIn operational
- ✅ Share tracking in database
- ✅ Admin can preview before sharing

### **Security**
- ✅ Zero security vulnerabilities in audit
- ✅ RLS policies enforced
- ✅ No XSS or injection vulnerabilities
- ✅ Rate limiting preventing abuse

---

## Risk Assessment

### **Technical Risks**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Supabase RLS complexity | High | Medium | Start with simple policies, iterate based on testing |
| LinkedIn API rate limits | Medium | Low | Manual fallback option, queue system for high volume |
| Comment spam | High | High | Moderation queue, rate limiting, user reporting |
| OAuth provider outages | Medium | Low | Multiple providers, magic link fallback |
| Database migration issues | High | Medium | Thorough testing in dev, backup before migration |

### **Timeline Risks**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 3 weeks too ambitious | Medium | Medium | Phase-based delivery, MVP first approach |
| Scope creep | High | High | Strict scope control, defer nice-to-haves to v2 |
| Integration complexity | Medium | Medium | Use MCPs, leverage existing libraries |
| Testing time underestimated | Medium | High | Dedicated testing phase, automated tests |

### **Business Risks**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user engagement | Low | Medium | Focus on quality content, promote via LinkedIn |
| Comment moderation burden | Medium | Low | Automated spam detection, user reporting |
| LinkedIn API changes | Low | Low | Monitor API changelog, build abstraction layer |

---

## Dependencies & Prerequisites

### **Services to Set Up**
1. **Supabase Account** (free tier)
   - Create project
   - Enable Auth providers (Google, GitHub, Email)
   - Configure OAuth apps
   - Set up database

2. **OAuth Applications**
   - Google Cloud Console (OAuth 2.0 credentials)
   - GitHub Developer Settings (OAuth App)
   - LinkedIn Developer Program (App registration)

3. **Environment Variables**
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=

   # LinkedIn
   LINKEDIN_CLIENT_ID=
   LINKEDIN_CLIENT_SECRET=
   LINKEDIN_REDIRECT_URI=

   # Database
   DATABASE_URL= # Already configured (Neon)

   # Admin
   ADMIN_EMAIL= # Your email for admin role
   ```

4. **NPM Packages to Install**
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.39.0",
       "@supabase/auth-helpers-nextjs": "^0.8.7",
       "dompurify": "^3.0.6",
       "isomorphic-dompurify": "^2.9.0",
       "@upstash/ratelimit": "^1.0.0",
       "@upstash/redis": "^1.25.0"
     },
     "devDependencies": {
       "@types/dompurify": "^3.0.5"
     }
   }
   ```

---

## Next Steps After Approval

### **Immediate Actions** (Day 1)
1. ✅ Initialize context preservation files:
   - `agent-context.md` - Mission-wide context
   - `handoff-notes.md` - Agent-to-agent handoffs
   - `evidence-repository.md` - Screenshots and artifacts

2. ✅ Create `project-plan.md` with all tasks from phases above

3. ✅ Set up Supabase project and obtain credentials

4. ✅ Delegate to Strategist for detailed user stories

### **Week 1 Kickoff**
1. Delegate to Architect for:
   - Database schema finalization
   - API route design
   - Security architecture review

2. Delegate to Developer for:
   - Supabase client setup
   - Auth middleware implementation
   - UserProfile model creation

3. Delegate to Designer for:
   - Login/signup UI components
   - Admin wizard interface design
   - Comment component mockups

### **Continuous Throughout**
- Daily standups (context file updates)
- Tester validation after each phase
- Progress tracking in project-plan.md
- Security reviews at each milestone

---

## Questions for Clarification

Before proceeding, please confirm:

1. **Supabase Approval**: Are you comfortable using Supabase for auth, or would you prefer a different solution?

2. **LinkedIn Priority**: Is LinkedIn integration critical for MVP, or can it be deferred to Phase 5 (Week 3)?

3. **Comment Moderation**: Do you want all comments auto-approved, or should they go through moderation queue first?

4. **Email Notifications**: Should followers receive email notifications for new posts? (Requires email service like Resend or SendGrid)

5. **Analytics**: Do you want built-in analytics (page views, comment counts), or rely on external tools like Plausible/Google Analytics?

6. **Timeline**: Is 3 weeks realistic for your availability, or should we plan for a longer timeline with more buffer?

---

## Appendix: Technology Stack Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Frontend** | Next.js 15 | Already in use, excellent DX |
| **Backend** | Next.js API Routes | Serverless, easy deployment |
| **Database** | PostgreSQL (Neon) | Already configured, reliable |
| **ORM** | Prisma | Type-safe, excellent DX |
| **Auth** | Supabase Auth | Best-in-class, secure, feature-rich |
| **Real-time** | Supabase Realtime | WebSocket-based, built-in |
| **File Storage** | Supabase Storage | Integrated with auth, CDN included |
| **Rate Limiting** | Upstash Redis | Serverless Redis, generous free tier |
| **Email** | Resend (optional) | Developer-friendly, React email templates |
| **Deployment** | Netlify | Already configured, great DX |
| **Monitoring** | Sentry (optional) | Error tracking, performance monitoring |

---

**Ready to proceed?** Approve this plan and I'll immediately delegate to the squad to begin implementation! 🚀
