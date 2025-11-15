# Phase 7: Simplified Build-in-Public CMS - Implementation Plan

**Project**: JamieWatters.work Automated Build-in-Public System
**Timeline**: 3-5 days
**Status**: Planning
**Last Updated**: 2025-11-09

---

## Executive Summary

Build a streamlined admin CMS that automates daily progress posts by reading `project-plan.md` files from GitHub repos, while providing a simple interface for manual weekly planning posts and project management.

**Key Difference from Original Plan**:
- ❌ NO OAuth (Google, GitHub login)
- ❌ NO public user accounts
- ❌ NO commenting system
- ❌ NO LinkedIn OAuth auto-share
- ✅ Simple password auth (already working)
- ✅ GitHub API integration for automated updates
- ✅ Markdown editor for manual posts
- ✅ Project CRUD with GitHub repo tracking

**Estimated Time Savings**: 15 days (from 3 weeks to 3-5 days)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Dashboard                          │
│  (Authenticated with existing password system)              │
└──────────────┬──────────────┬──────────────┬────────────────┘
               │              │              │
               ▼              ▼              ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │ Projects │  │ Content  │  │ Metrics  │
         │   Tab    │  │   Tab    │  │   Tab    │
         └──────────┘  └──────────┘  └──────────┘
               │              │              │
               │              │              │
        ┌──────▼──────┐      │       ┌──────▼──────┐
        │   GitHub    │      │       │  Database   │
        │     API     │      │       │  (Neon)     │
        │ Integration │      │       └─────────────┘
        └─────────────┘      │
                             │
                      ┌──────▼──────┐
                      │  Markdown   │
                      │   Editor    │
                      └─────────────┘
```

### Database Schema Updates

**New Fields for Projects Table**:
```prisma
model Project {
  // Existing fields...
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String
  techStack   String[]
  url         String?
  metrics     Json
  category    String
  featured    Boolean  @default(false)
  status      String   @default("active")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // NEW fields for GitHub integration
  githubUrl      String?  // e.g., "https://github.com/user/repo"
  githubToken    String?  // Encrypted token for private repos
  trackProgress  Boolean  @default(false) // Include in daily updates?
  lastSynced     DateTime? // Last time we read project-plan.md

  // Relations
  posts       Post[]
}
```

**Posts Table** (already exists, minor updates):
```prisma
model Post {
  id           String   @id @default(cuid())
  slug         String   @unique
  title        String
  content      String   // Markdown content
  excerpt      String?
  publishedAt  DateTime?
  published    Boolean  @default(false)
  tags         String[]
  readTime     Int?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // NEW fields
  postType     String   @default("manual") // "manual" | "daily-update" | "weekly-plan"
  projectId    String?  // Optional: link to specific project
  project      Project? @relation(fields: [projectId], references: [id])

  // Author info (always Jamie for now)
  author       String   @default("Jamie Watters")
  authorEmail  String   @default("jamie@jamiewatters.work")
}
```

---

## Day-by-Day Implementation Plan

### Day 1: Database Schema & Projects CRUD

**Objective**: Update database schema and build Projects management tab

#### Tasks:

**1.1: Update Prisma Schema** (30 minutes)
- Add new fields to Project model (githubUrl, githubToken, trackProgress, lastSynced)
- Add new fields to Post model (postType, projectId relation)
- Generate migration
- Apply to local database
- Apply to production (Neon)

**Files Modified**:
- `/prisma/schema.prisma`

**Commands**:
```bash
npx prisma migrate dev --name add_github_integration
npx prisma generate
```

---

**1.2: Build Projects Tab UI** (2 hours)

**Component**: `/app/admin/projects/page.tsx`

**Features**:
- List all projects in table view
- Columns: Name, GitHub URL, Track Progress (toggle), Status, Last Synced, Actions
- Add New Project button
- Edit/Delete actions per project

**UI Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Projects                                    [+ Add New] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name          GitHub URL        Track  Status  Actions │
│  ─────────────────────────────────────────────────────  │
│  Agent-11      github.com/...     ✓     Active   [Edit] │
│  Master-AI     github.com/...     ✓     Active   [Edit] │
│  AIMpact       github.com/...     ✗     Beta     [Edit] │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Files Created**:
- `/app/admin/projects/page.tsx` - Projects list view
- `/components/admin/ProjectsTable.tsx` - Table component
- `/components/admin/ProjectRow.tsx` - Individual row

---

**1.3: Build Add/Edit Project Form** (2 hours)

**Component**: `/app/admin/projects/[id]/page.tsx` (Edit)
**Component**: `/app/admin/projects/new/page.tsx` (Add New)

**Form Fields**:
```typescript
interface ProjectFormData {
  name: string;
  slug: string; // Auto-generated from name
  description: string;
  techStack: string[]; // Multi-select or comma-separated
  url: string; // Live project URL
  category: string; // Dropdown: ai-tools, frameworks, education, marketplace
  status: 'active' | 'beta' | 'planning' | 'archived';
  featured: boolean; // Checkbox

  // GitHub Integration
  githubUrl: string; // e.g., https://github.com/user/repo
  githubToken?: string; // Optional, for private repos
  trackProgress: boolean; // Include in daily updates?

  // Metrics
  metrics: {
    mrr: number;
    users: number;
  };
}
```

**Validation**:
- Name: Required, 3-100 chars
- GitHub URL: Valid GitHub repo URL format
- GitHub Token: Valid token format (if provided)
- All other fields: Standard validation

**Files Created**:
- `/app/admin/projects/new/page.tsx`
- `/app/admin/projects/[id]/page.tsx`
- `/components/admin/ProjectForm.tsx`
- `/lib/validations/project.ts` (Zod schemas)

---

**1.4: Build Projects API Routes** (1.5 hours)

**Endpoints**:

1. **GET /api/admin/projects** - List all projects
   ```typescript
   // Returns: Project[]
   ```

2. **GET /api/admin/projects/[id]** - Get single project
   ```typescript
   // Returns: Project
   ```

3. **POST /api/admin/projects** - Create new project
   ```typescript
   // Body: ProjectFormData
   // Returns: Project
   ```

4. **PUT /api/admin/projects/[id]** - Update project
   ```typescript
   // Body: Partial<ProjectFormData>
   // Returns: Project
   ```

5. **DELETE /api/admin/projects/[id]** - Delete project
   ```typescript
   // Returns: { success: true }
   ```

**Security**:
- All routes protected by existing auth middleware
- Validate auth token from cookie
- Encrypt GitHub tokens before storing (use crypto.encrypt)
- Never expose GitHub tokens in API responses

**Files Created**:
- `/app/api/admin/projects/route.ts` (GET, POST)
- `/app/api/admin/projects/[id]/route.ts` (GET, PUT, DELETE)
- `/lib/encryption.ts` (Encrypt/decrypt GitHub tokens)

---

**Day 1 Deliverables**:
- ✅ Updated database schema
- ✅ Projects management tab (list, add, edit, delete)
- ✅ API routes for project CRUD
- ✅ GitHub token encryption/decryption
- ✅ Full CRUD workflow tested locally

**Day 1 Testing Checklist**:
- [ ] Create new project with GitHub URL
- [ ] Edit existing project
- [ ] Toggle "Track Progress" on/off
- [ ] Delete project
- [ ] Verify GitHub token is encrypted in database
- [ ] Test with private repo (GitHub token required)

---

### Day 2: GitHub Integration & Daily Update Generator

**Objective**: Build GitHub API integration to read `project-plan.md` and generate daily updates

#### Tasks:

**2.1: GitHub API Integration Library** (2 hours)

**Component**: `/lib/github.ts`

**Functions**:

```typescript
interface GitHubConfig {
  owner: string;      // Parsed from githubUrl
  repo: string;       // Parsed from githubUrl
  token?: string;     // Decrypted from database
}

// Parse GitHub URL to extract owner/repo
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null

// Fetch file content from GitHub
export async function fetchFileFromGitHub(
  config: GitHubConfig,
  filePath: string,
  branch?: string
): Promise<string>

// Fetch project-plan.md specifically
export async function fetchProjectPlan(
  config: GitHubConfig
): Promise<string>

// Parse project-plan.md to extract tasks
export interface Task {
  content: string;
  completed: boolean;
  section?: string; // Which section it's under
}

export function parseProjectPlan(markdown: string): {
  tasks: Task[];
  completedTasks: Task[];
  inProgressTasks: Task[];
  pendingTasks: Task[];
}

// Get recently completed tasks (for daily updates)
export function getRecentlyCompletedTasks(
  tasks: Task[],
  since?: Date
): Task[]
```

**GitHub API Details**:
- Use GitHub REST API: `GET /repos/{owner}/{repo}/contents/{path}`
- Support both public repos (no token) and private repos (with token)
- Handle rate limiting (5000 requests/hour with token, 60 without)
- Proper error handling for 404, 403, rate limits

**Files Created**:
- `/lib/github.ts` - GitHub API integration
- `/lib/markdown-parser.ts` - Parse project-plan.md checkboxes

---

**2.2: Daily Update Generator Logic** (2.5 hours)

**Component**: `/lib/daily-update-generator.ts`

**Function**:
```typescript
interface DailyUpdateInput {
  projectIds: string[]; // Which projects to include
  date?: Date; // Default: yesterday
}

interface DailyUpdateOutput {
  title: string; // e.g., "Daily Update: November 9, 2025"
  content: string; // Markdown content
  excerpt: string;
  tags: string[]; // e.g., ["daily-update", "build-in-public"]
  readTime: number; // Estimated minutes
  projects: {
    projectId: string;
    projectName: string;
    githubUrl: string;
    completedTasks: string[];
  }[];
}

export async function generateDailyUpdate(
  input: DailyUpdateInput
): Promise<DailyUpdateOutput>
```

**Generated Content Format**:
```markdown
# Daily Update: November 9, 2025

Progress across 3 active projects:

## Agent-11
[View on GitHub](https://github.com/user/agent-11)

✅ **Completed**:
- Fixed CSP middleware implementation for Next.js 15
- Deployed coordinator updates to production
- Resolved header conflict in next.config.js

⏳ **In Progress**:
- MCP integration guide documentation

---

## Master-AI Framework
[View on GitHub](https://github.com/user/master-ai)

✅ **Completed**:
- Updated SEO analyzer for 2025 algorithms
- Fixed API rate limiting bug

---

## AIMpact Scanner
[View on GitHub](https://github.com/user/aimpact)

✅ **Completed**:
- Added new scanning metrics
- Improved report generation performance

---

*This update was automatically generated from project-plan.md files. [Learn more about my build-in-public process →](/about)*
```

**Algorithm**:
1. Fetch all projects where `trackProgress = true`
2. For each project:
   - Fetch `project-plan.md` from GitHub
   - Parse markdown checkboxes
   - Filter completed tasks (marked `[x]`)
   - Optionally: Check Git commit dates to find tasks completed yesterday
3. Generate markdown content with completed tasks grouped by project
4. Calculate read time (~200 words per minute)
5. Return structured data ready for Post creation

**Files Created**:
- `/lib/daily-update-generator.ts`
- `/lib/read-time-calculator.ts` (Calculate estimated read time)

---

**2.3: Content Tab UI - Daily Update Generator** (1.5 hours)

**Component**: `/app/admin/content/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Content                                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ 📊 Generate Daily Update                       │    │
│  │                                                 │    │
│  │ Pull completed tasks from project-plan.md      │    │
│  │ files and create a daily progress post.        │    │
│  │                                                 │    │
│  │ Projects to include:                           │    │
│  │ ☑ Agent-11                                     │    │
│  │ ☑ Master-AI Framework                          │    │
│  │ ☐ AIMpact Scanner (no updates)                 │    │
│  │                                                 │    │
│  │           [Generate Daily Update →]            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │ ✍️ Write Manual Post                           │    │
│  │                                                 │    │
│  │ Create weekly plans, essays, or custom posts.  │    │
│  │                                                 │    │
│  │              [New Manual Post →]                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Recent Posts:                                           │
│  • Nov 9 - Daily Update (Published)                     │
│  • Nov 8 - Daily Update (Published)                     │
│  • Nov 7 - Week Ahead: Nov 10-16 (Draft)                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Button to generate daily update
- Checkbox list of projects (from database where trackProgress=true)
- Loading state while fetching from GitHub
- Preview generated content before publishing
- Publish immediately or save as draft

**Flow**:
1. User clicks "Generate Daily Update"
2. System shows loading state
3. Fetches project-plan.md from each tracked project
4. Parses completed tasks
5. Shows preview modal with generated content
6. User can edit if needed
7. User clicks "Publish" or "Save Draft"

**Files Created**:
- `/app/admin/content/page.tsx`
- `/components/admin/DailyUpdateGenerator.tsx`
- `/components/admin/ContentPreviewModal.tsx`

---

**2.4: Daily Update API Route** (1 hour)

**Endpoint**: **POST /api/admin/content/generate-daily**

**Request**:
```typescript
{
  projectIds: string[];
  date?: string; // ISO date, default: yesterday
}
```

**Response**:
```typescript
{
  preview: DailyUpdateOutput;
  // Does NOT save to database yet
}
```

**Flow**:
1. Validate authentication
2. Fetch selected projects from database
3. For each project:
   - Decrypt GitHub token if exists
   - Fetch project-plan.md from GitHub
   - Parse completed tasks
4. Generate daily update content
5. Return preview (don't save yet)

**Endpoint**: **POST /api/admin/posts**

**Request**:
```typescript
{
  title: string;
  content: string; // Markdown
  excerpt?: string;
  tags?: string[];
  postType: "manual" | "daily-update" | "weekly-plan";
  published: boolean; // true = publish now, false = draft
  projectId?: string; // Optional link to project
}
```

**Response**:
```typescript
{
  post: Post; // Created post with ID, slug, etc.
}
```

**Files Created**:
- `/app/api/admin/content/generate-daily/route.ts`
- `/app/api/admin/posts/route.ts` (GET, POST)
- `/app/api/admin/posts/[id]/route.ts` (GET, PUT, DELETE)

---

**Day 2 Deliverables**:
- ✅ GitHub API integration library
- ✅ project-plan.md parser (extract completed tasks)
- ✅ Daily update generator logic
- ✅ Content tab with "Generate Daily Update" button
- ✅ Preview modal for generated content
- ✅ Publish/draft workflow

**Day 2 Testing Checklist**:
- [ ] Generate daily update from real GitHub repos
- [ ] Verify completed tasks are correctly parsed
- [ ] Test with private repo (GitHub token)
- [ ] Test with public repo (no token)
- [ ] Preview generated content
- [ ] Publish daily update
- [ ] Verify post appears on /journey page

---

### Day 3: Manual Content Editor & Post Management

**Objective**: Build markdown editor for manual posts and post management interface

#### Tasks:

**3.1: Markdown Editor Component** (2 hours)

**Component**: `/components/admin/MarkdownEditor.tsx`

**Features**:
- Textarea for markdown input (with syntax highlighting optional)
- Live preview pane (side-by-side layout)
- Toolbar with common markdown actions:
  - Bold, Italic, Heading, Link, Code, List
- Character/word count
- Auto-save to draft (every 30 seconds)

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  [B] [I] [H] [Link] [Code] [List]      1,234 words     │
├───────────────────┬─────────────────────────────────────┤
│                   │                                     │
│  # Week Ahead     │   Week Ahead: Nov 10-16            │
│                   │   Focus Areas                       │
│  Focus areas:     │                                     │
│  - Agent-11 MCP   │   Focus areas:                      │
│  - Master-AI v2   │   • Agent-11 MCP integration       │
│                   │   • Master-AI v2 launch            │
│                   │                                     │
│   Editor          │         Preview                     │
│                   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

**Libraries to Use**:
- Simple textarea (no heavy dependencies)
- `remark` + `remark-html` for preview rendering (already in project)
- `rehype-highlight` for code syntax highlighting in preview

**Files Created**:
- `/components/admin/MarkdownEditor.tsx`
- `/hooks/useAutoSave.ts` (Auto-save draft hook)

---

**3.2: Manual Post Creation Page** (2 hours)

**Component**: `/app/admin/content/new/page.tsx`

**Form Fields**:
```typescript
interface PostFormData {
  title: string; // Required
  content: string; // Markdown, required
  excerpt?: string; // Optional, auto-generated from first 160 chars if empty
  tags: string[]; // Comma-separated input
  postType: "manual" | "weekly-plan"; // Dropdown (daily-update not manual)
  projectId?: string; // Optional: link to specific project
  published: boolean; // Publish now or save as draft
  publishedAt?: Date; // Schedule for future (optional v2 feature)
}
```

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Create New Post                                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Title: [___________________________________________]    │
│                                                          │
│  Post Type: [Manual ▼]  Project: [None ▼]              │
│                                                          │
│  Tags: [build-in-public, weekly-plan]                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │         Markdown Editor (full height)          │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Excerpt (optional):                                     │
│  [_________________________________________________]    │
│                                                          │
│  [Save as Draft]              [Publish Now →]           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Features**:
- Auto-generate slug from title
- Auto-calculate read time from content
- Auto-generate excerpt if not provided
- Save draft locally (localStorage) to prevent data loss
- Validation before publish

**Files Created**:
- `/app/admin/content/new/page.tsx`
- `/components/admin/PostForm.tsx`

---

**3.3: Post Management List** (1.5 hours)

**Component**: `/app/admin/content/posts/page.tsx`

**Features**:
- List all posts (published + drafts)
- Columns: Title, Type, Status, Published Date, Actions
- Filter by: All / Published / Drafts / Daily Updates / Manual
- Search by title
- Bulk actions: Delete selected

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  All Posts                 [All ▼] [Search: ___]        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Title               Type          Status  Date  Actions│
│  ──────────────────────────────────────────────────────│
│  Daily Update: ...   daily-update  ✓ Pub  Nov 9  [Edit]│
│  Week Ahead: ...     weekly-plan   ○ Drft Nov 7  [Edit]│
│  Using AI Agents     manual        ✓ Pub  Nov 5  [Edit]│
│                                                          │
│  ← Previous  1 2 3  Next →                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Files Created**:
- `/app/admin/content/posts/page.tsx`
- `/components/admin/PostsList.tsx`
- `/components/admin/PostsFilter.tsx`

---

**3.4: Edit Post Page** (1 hour)

**Component**: `/app/admin/content/posts/[id]/page.tsx`

**Same as create page, but**:
- Pre-populate form with existing post data
- Show "Last saved" timestamp
- Show edit history (optional: just show updatedAt)
- Cannot change postType after creation (prevent accidents)

**Files Created**:
- `/app/admin/content/posts/[id]/page.tsx` (reuses PostForm component)

---

**Day 3 Deliverables**:
- ✅ Markdown editor with live preview
- ✅ Manual post creation page
- ✅ Post management list (all posts)
- ✅ Edit existing posts
- ✅ Draft/publish workflow
- ✅ Auto-save to prevent data loss

**Day 3 Testing Checklist**:
- [ ] Create new manual post with markdown
- [ ] Preview renders correctly
- [ ] Save as draft
- [ ] Edit draft
- [ ] Publish draft
- [ ] Verify post appears on /journey page
- [ ] Auto-save works (wait 30 seconds without clicking save)
- [ ] Excerpt auto-generates if empty

---

### Day 4: Unified Admin Dashboard & Navigation

**Objective**: Integrate all tabs into single admin dashboard with proper navigation

#### Tasks:

**4.1: Admin Layout with Tab Navigation** (1.5 hours)

**Component**: `/app/admin/layout.tsx`

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  Admin Dashboard                          Jamie [Logout] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [Projects] [Content] [Metrics] [Settings]              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │             Tab Content Here                    │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Routes**:
- `/admin` → Redirect to `/admin/content` (default tab)
- `/admin/projects` → Projects management
- `/admin/content` → Content creation/management
- `/admin/metrics` → Metrics updates (existing functionality)
- `/admin/settings` → Account settings (future: change password)

**Navigation**:
- Tabs are highlighted when active
- Responsive: tabs become hamburger menu on mobile
- Consistent header across all tabs

**Files Modified**:
- `/app/admin/layout.tsx` - Add tab navigation
- `/app/admin/page.tsx` - Redirect to /admin/content

**Files Created**:
- `/components/admin/AdminTabs.tsx` - Tab navigation component

---

**4.2: Integrate Existing Metrics Tab** (1 hour)

**Move existing metrics update UI to new tab structure**:

**Current**: `/app/admin/page.tsx` (everything on one page)
**New**: `/app/admin/metrics/page.tsx` (dedicated tab)

**Changes**:
- Extract metrics update form from existing admin page
- Move to `/admin/metrics`
- Update to use new admin layout
- Ensure CRUD still works with existing API routes

**Files Created**:
- `/app/admin/metrics/page.tsx` (move metrics update UI here)

**Files Modified**:
- `/app/admin/page.tsx` - Remove metrics UI, add redirect

---

**4.3: Quick Stats Dashboard (Home Tab)** (1.5 hours)

**Component**: `/app/admin/dashboard/page.tsx`

**Features** (Nice to have, not critical):
- Total projects: 10 active, 2 archived
- Total posts: 45 published, 3 drafts
- Last daily update: Nov 9, 2025
- Quick actions:
  - Generate daily update
  - New manual post
  - Update metrics

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard Overview                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  10       │  │  45       │  │  3        │             │
│  │  Projects │  │  Posts    │  │  Drafts   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│  Recent Activity:                                        │
│  • Daily update published (2 hours ago)                  │
│  • Agent-11 metrics updated (1 day ago)                  │
│  • New post draft created (3 days ago)                   │
│                                                          │
│  Quick Actions:                                          │
│  [📊 Generate Daily Update]  [✍️ New Post]              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Files Created**:
- `/app/admin/dashboard/page.tsx`
- `/components/admin/QuickStats.tsx`
- `/components/admin/RecentActivity.tsx`

---

**4.4: Settings Tab (Basic)** (1 hour)

**Component**: `/app/admin/settings/page.tsx`

**Features** (MVP):
- Display current admin email (hardcoded: jamie@jamiewatters.work)
- Change password button (future feature)
- GitHub integration status (how many projects have tokens)
- Last sync times for GitHub projects

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Settings                                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Account                                                 │
│  Email: jamie@jamiewatters.work                         │
│  [Change Password] (Coming soon)                        │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  GitHub Integration                                      │
│  Connected Projects: 3 of 10                            │
│  Last Sync: Nov 9, 2025 9:30 AM                         │
│                                                          │
│  [Sync All Projects Now]                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Files Created**:
- `/app/admin/settings/page.tsx`

---

**Day 4 Deliverables**:
- ✅ Unified admin layout with tab navigation
- ✅ All features accessible via tabs
- ✅ Metrics tab (existing functionality moved)
- ✅ Dashboard overview (optional nice-to-have)
- ✅ Settings tab (basic)
- ✅ Consistent navigation across all admin pages

**Day 4 Testing Checklist**:
- [ ] Navigate between all tabs
- [ ] Metrics update still works in new tab
- [ ] Projects CRUD accessible via Projects tab
- [ ] Content generation accessible via Content tab
- [ ] Dashboard shows correct stats
- [ ] Mobile responsive (tabs become menu)

---

### Day 5: Polish, Testing & Deployment

**Objective**: Final testing, bug fixes, documentation, and production deployment

#### Tasks:

**5.1: End-to-End Testing** (2 hours)

**Test Scenarios**:

1. **Complete Daily Update Workflow**:
   - Add new project with GitHub URL
   - Enable "Track Progress"
   - Click "Generate Daily Update"
   - Verify tasks are pulled from project-plan.md
   - Preview content
   - Publish
   - Verify appears on /journey page

2. **Complete Manual Post Workflow**:
   - Create new manual post
   - Write markdown content
   - Preview
   - Save as draft
   - Edit draft
   - Publish
   - Verify appears on /journey page

3. **Projects Management**:
   - Create project
   - Edit project
   - Update metrics
   - Delete project (with confirmation)

4. **Authentication**:
   - Login/logout
   - Session persistence (cookie)
   - Protected routes redirect to login

**Testing Checklist**:
- [ ] All forms validate correctly
- [ ] All API routes return proper errors
- [ ] GitHub integration works for public repos
- [ ] GitHub integration works for private repos (with token)
- [ ] Markdown renders correctly in preview and live site
- [ ] Auto-save works (don't lose drafts)
- [ ] Mobile responsive on all admin pages
- [ ] No console errors

---

**5.2: Error Handling & User Feedback** (1.5 hours)

**Improvements**:
- Better error messages for GitHub API failures
  - "Could not fetch project-plan.md from GitHub. Check repo URL and token."
  - "GitHub rate limit exceeded. Try again in 1 hour."
- Loading states for all async operations
- Success toasts for all mutations
  - "✅ Project created successfully"
  - "✅ Daily update published"
- Confirmation dialogs for destructive actions
  - "Are you sure you want to delete this project?"

**Files Modified**:
- Add error handling to all API routes
- Add loading states to all forms
- Add toast notification system

**Files Created**:
- `/components/ui/Toast.tsx` - Toast notification component
- `/hooks/useToast.ts` - Toast hook

---

**5.3: Documentation** (1 hour)

**Create User Guide**: `/docs/admin-cms-guide.md`

**Contents**:
1. **Getting Started**
   - How to log in
   - Admin dashboard overview

2. **Managing Projects**
   - Adding new projects
   - Connecting GitHub repos
   - Private vs public repos (when to use token)

3. **Daily Updates**
   - How to generate daily updates
   - What gets included
   - Editing generated content

4. **Manual Posts**
   - Creating weekly plans
   - Markdown formatting guide
   - Best practices

5. **Troubleshooting**
   - GitHub connection issues
   - Common errors and fixes

**Files Created**:
- `/docs/admin-cms-guide.md`
- Update `/README.md` with link to admin guide

---

**5.4: Production Deployment** (1.5 hours)

**Pre-Deployment Checklist**:
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] GitHub tokens encrypted in database

**Deployment Steps**:

1. **Database Migration** (Neon):
   ```bash
   # Apply migration to production
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Environment Variables** (Netlify):
   - Verify `ADMIN_PASSWORD_HASH` is set
   - Verify `SESSION_SECRET` is set
   - No new env vars needed for this phase

3. **Deploy to Production**:
   ```bash
   git add .
   git commit -m "feat: Phase 7 - Simplified Build-in-Public CMS

   - Projects management with GitHub integration
   - Daily update generator from project-plan.md
   - Manual post editor with markdown support
   - Unified admin dashboard with tabs
   - Complete CRUD for projects and posts"

   git push origin main
   ```

4. **Post-Deployment Verification**:
   - [ ] Log in to production admin
   - [ ] Create test project
   - [ ] Generate test daily update
   - [ ] Verify appears on live site
   - [ ] Delete test data

**Files Created**:
- Update `progress.md` with Phase 7 completion
- Update `project-plan.md` - mark Phase 7 complete

---

**Day 5 Deliverables**:
- ✅ Complete end-to-end testing
- ✅ All bugs fixed
- ✅ Error handling improved
- ✅ User documentation created
- ✅ Deployed to production
- ✅ Production verification complete

**Day 5 Testing Checklist**:
- [ ] Everything works in production
- [ ] No regressions on existing features
- [ ] Admin guide is clear and helpful
- [ ] Performance is acceptable (<2s page loads)
- [ ] Mobile works well

---

## Security Considerations

### GitHub Token Security

**Encryption**:
```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = process.env.ENCRYPTION_KEY; // 32-byte key in env

export function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY, 'hex'), iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

**Never**:
- ❌ Return GitHub tokens in API responses
- ❌ Log GitHub tokens
- ❌ Store tokens in plain text
- ❌ Expose tokens in error messages

**Always**:
- ✅ Encrypt before storing in database
- ✅ Decrypt only when needed (GitHub API calls)
- ✅ Use environment variable for encryption key
- ✅ Validate token format before storing

---

## Performance Considerations

### GitHub API Rate Limiting

**Without Token**: 60 requests/hour per IP
**With Token**: 5000 requests/hour

**Strategy**:
- Cache `project-plan.md` content in database (lastSynced field)
- Only re-fetch if:
  - User explicitly clicks "Sync Now"
  - Last sync > 24 hours ago
  - Generating daily update

**Caching**:
```typescript
// Check if we need to fetch from GitHub
const needsSync = !project.lastSynced ||
                  (Date.now() - project.lastSynced.getTime() > 24 * 60 * 60 * 1000);

if (needsSync) {
  const content = await fetchProjectPlan(githubConfig);
  // Update database with cached content
  await prisma.project.update({
    where: { id: project.id },
    data: {
      cachedPlanContent: content,
      lastSynced: new Date()
    }
  });
}
```

---

## Future Enhancements (Post-MVP)

### Phase 7.5: Advanced Features (Optional)

**Not included in initial 5-day build, but easy to add later**:

1. **Scheduled Publishing**
   - Set publishedAt to future date
   - Cron job checks every hour for posts to publish

2. **Image Uploads**
   - Integrate with Cloudinary or Vercel Blob
   - Drag-drop images into markdown editor

3. **Change Password**
   - UI to update admin password
   - Requires current password verification

4. **Multiple Admin Users**
   - Add User table
   - Role-based permissions (Admin, Editor)

5. **Rich Text Editor**
   - WYSIWYG editor option (in addition to markdown)
   - Use TipTap or similar

6. **Analytics Dashboard**
   - Post views (integrate with existing analytics)
   - Most popular posts
   - Traffic trends

7. **LinkedIn Auto-Share** (Complex)
   - OAuth integration
   - Auto-post to LinkedIn when publishing
   - Track engagement

---

## Success Metrics

**Phase 7 is successful if**:

- ✅ Can add/edit/delete projects with GitHub integration
- ✅ Can generate daily updates automatically from project-plan.md
- ✅ Can create manual posts with markdown editor
- ✅ Can publish posts that appear on /journey page
- ✅ GitHub tokens are securely encrypted
- ✅ Admin dashboard is intuitive and fast
- ✅ Complete workflow takes <5 minutes per day
- ✅ Zero data loss (auto-save, drafts)
- ✅ Works on mobile (responsive)

**Time Savings**:
- Previous: 30-60 min/day to manually write updates
- After: 5 min/day to generate + review + publish

---

## Risk Mitigation

### High-Risk Areas

**1. GitHub API Integration**
- **Risk**: GitHub rate limits or authentication failures
- **Mitigation**:
  - Implement caching (24-hour TTL)
  - Clear error messages
  - Graceful degradation (use cached content if API fails)

**2. Token Security**
- **Risk**: GitHub tokens exposed in database or logs
- **Mitigation**:
  - Encrypt tokens with AES-256-GCM
  - Never return in API responses
  - Environment variable for encryption key
  - Regular security audits

**3. Data Loss**
- **Risk**: User writes long post, browser crashes, loses work
- **Mitigation**:
  - Auto-save every 30 seconds
  - Save to localStorage as backup
  - Show "Last saved" timestamp

**4. Complexity Creep**
- **Risk**: Adding features beyond 5-day scope
- **Mitigation**:
  - Strict adherence to this plan
  - Mark additional features as "Phase 7.5"
  - Focus on core workflow first

---

## Tech Stack Summary

**Frontend**:
- Next.js 15 App Router (already in use)
- React 19 (already in use)
- Tailwind CSS (already in use)
- TypeScript (already in use)

**Backend**:
- Next.js API Routes (already in use)
- Prisma ORM (already in use)
- Neon Postgres (already in use)

**New Dependencies**:
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3", // Already installed (for password hashing)
    "octokit": "^3.1.2",  // GitHub API client (NEW)
    "marked": "^11.1.1",  // Markdown parser (alternative to remark, lighter)
  }
}
```

**Note**: We're already using `remark` and `rehype` for blog rendering, so we might not need `marked`. Can reuse existing markdown infrastructure.

---

## Open Questions

**Questions to resolve before starting**:

1. **GitHub Token Storage**:
   - Do we need an ENCRYPTION_KEY environment variable?
   - Or use SESSION_SECRET for encryption? (simpler, but less secure)

2. **Auto-save Frequency**:
   - Every 30 seconds OK?
   - Or save on every keystroke (more complex)?

3. **Project-Plan.md Location**:
   - Always in root of repo?
   - Or allow custom path per project? (e.g., `/docs/project-plan.md`)

4. **Daily Update Trigger**:
   - Manual button click only?
   - Or also cron job at 9am daily? (requires additional setup)

5. **Completed Tasks Detection**:
   - Just parse `[x]` checkboxes?
   - Or check Git commit dates to find "yesterday's work"? (more accurate but complex)

---

## Next Steps

**To proceed with implementation**:

1. **Review this plan** - Any changes or additions?
2. **Answer open questions** - Need your input on decisions
3. **Set timeline** - Confirm 5-day timeline works
4. **Start Day 1** - Begin with database schema updates

Ready to start building when you approve the plan! 🚀
