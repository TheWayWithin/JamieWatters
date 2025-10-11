# Authentication Architecture Decision

**Date**: October 9, 2025
**Decision**: Use Supabase Auth for OAuth + Neon Postgres for data storage
**Status**: Approved

---

## Decision Summary

Implement a **dual-service architecture**:
- **Supabase Auth**: OAuth (Google, GitHub, LinkedIn), magic links, session management
- **Neon Postgres**: All application data (users, projects, posts, comments, metrics)

---

## Context

### Current Situation
- Database: Neon Postgres (serverless, connection pooling)
- Current auth: Simple password-based (insecure, needs replacement)
- Requirements: OAuth (Google, GitHub), magic links, RBAC, commenting system

### Options Evaluated
1. **NextAuth.js**: Self-hosted, free, more setup complexity
2. **Clerk**: Managed service, beautiful UI, paid tiers
3. **Supabase Auth**: Managed auth service, can use WITHOUT Supabase database

---

## Decision: Supabase Auth (OAuth Only) + Neon Database

### Why This Works

**Supabase Auth is a standalone service**:
- Does NOT require using Supabase as your database
- Can authenticate users and sync to ANY database (including Neon)
- Provides auth endpoints, session management, and OAuth flows independently

**Architecture Pattern**:
```
User Login
   ↓
Supabase Auth (OAuth flow)
   ↓
JWT token issued
   ↓
Next.js middleware validates token
   ↓
On first login: Sync user to Neon via Prisma
   ↓
Application uses Neon for all data queries
```

---

## Advantages

### 1. Best-in-Class Authentication ✅
- OAuth providers: Google, GitHub, LinkedIn (built-in)
- Magic links (passwordless email login)
- Phone auth (SMS - future option)
- Session management and refresh tokens
- Email verification flows
- Password reset flows (if needed)

### 2. Developer Experience ✅
- Excellent Next.js integration (`@supabase/auth-helpers-nextjs`)
- Pre-built UI components (`@supabase/auth-ui-react`)
- Server Components + Client Components support
- Edge runtime compatible

### 3. Cost Efficiency ✅
- **Free tier**: 50,000 monthly active users
- No credit card required for free tier
- Only pay when you exceed free tier
- Neon database: Separate free tier (512MB storage)

### 4. Security ✅
- Industry-standard OAuth flows
- PKCE for added security
- Row Level Security (RLS) - can use if needed
- Automatic CSRF protection
- Secure session management

### 5. Minimal Vendor Lock-In ⚠️→✅
- Auth tokens are standard JWTs
- User data synced to YOUR database (Neon)
- If you migrate away: Export users, implement new auth, keep all data
- Easier than migrating from Clerk (which owns UI/UX)

---

## Trade-offs

### Cons (Mitigated)

**❌ Two Services to Manage**
- ✅ **Mitigation**: Both have excellent uptime (99.9%+), free tiers, minimal maintenance

**❌ User Data in Two Places**
- ✅ **Mitigation**: Supabase only stores auth credentials, Neon stores everything else
- ✅ **Pattern**: Single source of truth = Neon database (Supabase is just auth gateway)

**❌ Sync Complexity**
- ✅ **Mitigation**: Simple webhook or post-login sync (one-time setup)
- ✅ **Code**: ~50 lines to sync Supabase user → Neon UserProfile

**❌ Potential Future Cost**
- ✅ **Mitigation**: Free tier covers 50K MAU (plenty for MVP validation)
- ✅ **If hit limits**: At that scale, auth cost is justified business expense

---

## Implementation Architecture

### Environment Variables
```env
# Supabase Auth (OAuth only)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Neon Database (All data)
DATABASE_URL=postgresql://...@neon.tech/neondb
```

### Database Schema (Neon)
```prisma
model UserProfile {
  id        String   @id // Matches Supabase auth.users.id (UUID)
  email     String   @unique
  name      String?
  avatar    String?
  role      UserRole @default(USER)

  // Supabase Auth metadata
  supabaseId String  @unique // auth.users.id from Supabase

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  comments  Comment[]
}
```

### User Sync Flow
```typescript
// On user login/signup
async function syncUserToNeon(supabaseUser) {
  const existingUser = await prisma.userProfile.findUnique({
    where: { supabaseId: supabaseUser.id }
  });

  if (!existingUser) {
    // First login - create user in Neon
    await prisma.userProfile.create({
      data: {
        id: supabaseUser.id,
        supabaseId: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name,
        avatar: supabaseUser.user_metadata?.avatar_url,
        role: 'USER' // Default role
      }
    });
  }
}
```

### Authentication Flow
```typescript
// middleware.ts - Protect routes
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}
```

---

## Integration Points

### 1. OAuth Providers (Supabase Dashboard)
- Enable Google OAuth (get client ID/secret from Google Cloud Console)
- Enable GitHub OAuth (get from GitHub Developer Settings)
- Enable LinkedIn OAuth (for admin auto-share feature)

### 2. User Sync (Post-Login Hook)
- Supabase triggers webhook on new user signup
- Next.js API route receives webhook
- Creates UserProfile in Neon via Prisma

### 3. Session Management (Supabase Auth Helpers)
- `@supabase/auth-helpers-nextjs` handles sessions
- JWT tokens stored in HTTP-only cookies
- Server Components can validate sessions
- Client Components use `useUser()` hook

### 4. Role-Based Access Control (Neon Database)
- Roles stored in Neon UserProfile table
- Check role on protected routes
- Admin role assigned manually (database update)

---

## Migration Path (If Needed Later)

If you outgrow Supabase Auth:

1. **Export users** from Supabase Auth (CSV/API)
2. **Implement new auth** (e.g., Auth0, AWS Cognito)
3. **Update auth checks** in middleware (~100 lines of code)
4. **Keep all data** - Neon database unchanged
5. **Email users** about password reset (one-time)

**Effort**: ~2-3 days for experienced developer
**Data loss**: Zero (all user data already in Neon)

---

## Cost Projections

### Supabase Auth Pricing
- **Free**: 0 - 50,000 MAU
- **Pro**: $25/month for 50K - 100K MAU
- **Team**: $599/month for 100K - 1M MAU

### Neon Database Pricing
- **Free**: 512MB storage (plenty for 10K users)
- **Launch**: $19/month for 10GB storage
- **Scale**: $69/month for 100GB storage

### Combined Cost Scenarios
| Users | Supabase Auth | Neon DB | Total/Month |
|-------|---------------|---------|-------------|
| 0 - 10K | Free | Free | **$0** |
| 10K - 50K | Free | $19 | **$19** |
| 50K - 100K | $25 | $19 | **$44** |
| 100K - 500K | $599 | $69 | **$668** |

**At 100K users**: $44/month is negligible business cost. At that scale, revenue should far exceed this.

---

## Implementation Timeline

### Week 2 (Authentication Foundation)

**Day 1: Supabase Setup (4-6 hours)**
- [ ] Create Supabase project
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Set up redirect URLs for Netlify
- [ ] Install `@supabase/auth-helpers-nextjs` and `@supabase/auth-ui-react`

**Day 2: Next.js Integration (4-6 hours)**
- [ ] Create Supabase client utility
- [ ] Build login/signup pages with Supabase UI
- [ ] Implement middleware for route protection
- [ ] Test OAuth flows (Google, GitHub)

**Day 3: User Sync to Neon (4-6 hours)**
- [ ] Extend Prisma schema with UserProfile model
- [ ] Create API route for user sync
- [ ] Implement post-login sync logic
- [ ] Test user creation in Neon database

**Day 4: RBAC Implementation (3-4 hours)**
- [ ] Add role checks in middleware
- [ ] Create admin role assignment script
- [ ] Test admin-only routes
- [ ] Update admin dashboard with real auth

**Day 5: Magic Links & Polish (2-3 hours)**
- [ ] Enable magic link authentication
- [ ] Add logout functionality
- [ ] Implement session refresh
- [ ] Error handling and edge cases

---

## Success Criteria

- ✅ Users can sign up with Google OAuth
- ✅ Users can sign up with GitHub OAuth
- ✅ Users can sign in with magic link (email)
- ✅ User data synced to Neon UserProfile table
- ✅ Admin role properly gates admin routes
- ✅ Sessions persist across page refreshes
- ✅ Logout works correctly
- ✅ Protected routes redirect to login

---

## Resources

### Documentation
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase + Next.js: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Supabase + Prisma: https://supabase.com/docs/guides/integrations/prisma

### Code Examples
- Next.js App Router + Supabase: https://github.com/supabase/supabase/tree/master/examples/auth/nextjs
- User sync pattern: https://github.com/supabase/supabase/discussions/7078

### Community
- Supabase Discord: https://discord.supabase.com
- GitHub Discussions: https://github.com/supabase/supabase/discussions

---

## Approval

**Decision**: ✅ **APPROVED**
**Decided By**: User (Project Owner)
**Date**: October 9, 2025
**Rationale**: Best balance of features, cost, and developer experience for solo founder building in public

**Next Steps**:
1. Update auth-cms-implementation-plan.md with Supabase Auth specifics
2. Proceed with Phase 5.5 (database foundation) first
3. Implement Supabase Auth in Phase 7 Week 2

---

**Document Version**: 1.0
**Last Updated**: 2025-10-09
