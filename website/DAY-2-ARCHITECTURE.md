# Day 2 Architecture Overview
## GitHub Integration & Daily Update Generator

```
┌─────────────────────────────────────────────────────────────────┐
│                     Admin UI Layer                               │
│                  /app/admin/content/page.tsx                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React Components                               │
│  ┌──────────────────────┐  ┌───────────────────────┐           │
│  │ DailyUpdateGenerator │  │ ContentPreviewModal   │           │
│  │                      │  │                       │           │
│  │ - Fetch projects     │  │ - Preview content     │           │
│  │ - Select checkboxes  │  │ - Edit before publish │           │
│  │ - Trigger generation │  │ - Publish/Draft       │           │
│  └──────────────────────┘  └───────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Routes                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ POST /api/admin/content/generate-daily                 │    │
│  │                                                         │    │
│  │ 1. Validate auth (JWT token)                           │    │
│  │ 2. Fetch selected projects from database              │    │
│  │ 3. Call generateDailyUpdate()                          │    │
│  │ 4. Return preview (don't save yet)                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ POST /api/admin/posts                                  │    │
│  │                                                         │    │
│  │ 1. Validate auth                                        │    │
│  │ 2. Generate slug from title                            │    │
│  │ 3. Create post in database                             │    │
│  │ 4. Revalidate Next.js cache                            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ /lib/daily-update-generator.ts                         │    │
│  │                                                         │    │
│  │ generateDailyUpdate(input, projects):                  │    │
│  │   for each project:                                     │    │
│  │     1. Parse GitHub URL                                 │    │
│  │     2. Decrypt token (if private repo)                 │    │
│  │     3. Fetch project-plan.md                           │    │
│  │     4. Parse completed tasks                           │    │
│  │   5. Aggregate all tasks                                │    │
│  │   6. Generate markdown content                         │    │
│  │   7. Calculate read time                               │    │
│  │   8. Return DailyUpdateOutput                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Integration Layer                              │
│  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ /lib/github.ts   │  │ /lib/        │  │ /lib/read-time- │  │
│  │                  │  │ markdown-    │  │ calculator.ts   │  │
│  │ parseGitHubUrl() │  │ parser.ts    │  │                 │  │
│  │ fetchProjectPlan()│  │              │  │ calculateRead   │  │
│  │ fetchFile()      │  │ parseProject │  │ Time()          │  │
│  │                  │  │ Plan()       │  │                 │  │
│  └──────────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   External Services                              │
│  ┌────────────────────────┐  ┌──────────────────────────┐      │
│  │ GitHub REST API        │  │ Database (PostgreSQL)    │      │
│  │                        │  │                          │      │
│  │ GET /repos/{owner}/    │  │ Projects table           │      │
│  │     {repo}/contents/   │  │ - id, name, githubUrl    │      │
│  │     {path}             │  │ - githubToken (encrypted)│      │
│  │                        │  │ - trackProgress          │      │
│  │ Authentication:        │  │                          │      │
│  │ - Bearer token         │  │ Posts table              │      │
│  │ - Rate limiting        │  │ - id, title, content     │      │
│  │                        │  │ - postType, published    │      │
│  └────────────────────────┘  └──────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: Generate Daily Update

```
1. USER ACTION
   └─> Clicks "Generate Daily Update" button
       └─> Selected projects: ["project-1", "project-2"]

2. API REQUEST
   └─> POST /api/admin/content/generate-daily
       Body: { projectIds: ["project-1", "project-2"] }

3. DATABASE QUERY
   └─> Fetch projects where id IN ["project-1", "project-2"]
       Returns:
       [
         { id: "1", name: "Agent-11", githubUrl: "github.com/user/agent-11",
           githubToken: "encrypted...", trackProgress: true },
         { id: "2", name: "Master-AI", githubUrl: "github.com/user/master-ai",
           githubToken: null, trackProgress: true }
       ]

4. FOR EACH PROJECT
   └─> Project 1: Agent-11
       ├─> Parse URL: { owner: "user", repo: "agent-11" }
       ├─> Decrypt token: "ghp_xxxxxxxxxxxxx"
       ├─> GitHub API: GET /repos/user/agent-11/contents/project-plan.md
       ├─> Response: { content: "base64...", sha: "abc123" }
       ├─> Decode: "# Project Plan\n\n- [x] Task 1\n- [x] Task 2\n..."
       └─> Parse: { completedTasks: ["Task 1", "Task 2"], ... }

   └─> Project 2: Master-AI
       ├─> Parse URL: { owner: "user", repo: "master-ai" }
       ├─> No token (public repo)
       ├─> GitHub API: GET /repos/user/master-ai/contents/project-plan.md
       ├─> Response: { content: "base64...", sha: "def456" }
       ├─> Decode: "# Project Plan\n\n- [x] Task A\n- [ ] Task B\n..."
       └─> Parse: { completedTasks: ["Task A"], ... }

5. AGGREGATE RESULTS
   └─> Combine tasks from all projects
       └─> Generate markdown:
           "# Daily Update: November 10, 2025\n\n
           ## Agent-11\n
           ✅ Completed:\n
           - Task 1\n
           - Task 2\n\n
           ## Master-AI\n
           ✅ Completed:\n
           - Task A\n\n
           ..."

6. CALCULATE METADATA
   ├─> Read time: ~3 minutes
   ├─> Tags: ["daily-update", "build-in-public"]
   └─> Excerpt: "Completed 3 tasks across 2 projects..."

7. RETURN PREVIEW
   └─> Response:
       {
         preview: {
           title: "Daily Update: November 10, 2025",
           content: "# Daily Update...",
           excerpt: "Completed 3 tasks...",
           tags: ["daily-update", "build-in-public"],
           readTime: 3,
           projects: [...]
         }
       }

8. SHOW MODAL
   └─> ContentPreviewModal displays preview
       ├─> User can edit content
       └─> User clicks "Publish Now"

9. SAVE TO DATABASE
   └─> POST /api/admin/posts
       Body: { title, content, excerpt, tags, postType: "daily-update", published: true }
       └─> Create post in database
           └─> Revalidate /journey cache

10. SUCCESS
    └─> Modal closes
    └─> Post appears in recent posts list
    └─> Visible at /journey/daily-update-november-10-2025
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ GITHUB TOKEN ENCRYPTION (From Day 1)                            │
│                                                                  │
│  Admin enters token:     "ghp_1234567890abcdefghijklmnopqrst"   │
│         │                                                        │
│         ▼                                                        │
│  encryptToken()                                                 │
│         │                                                        │
│         ├─> Generate random IV (16 bytes)                       │
│         ├─> Derive key from SESSION_SECRET (32 bytes)          │
│         ├─> Encrypt with AES-256-GCM                           │
│         ├─> Generate auth tag (16 bytes)                       │
│         └─> Return: "iv:authTag:encrypted"                     │
│                                                                  │
│  Stored in database: "a1b2c3....:d4e5f6....:g7h8i9...."        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ GITHUB TOKEN DECRYPTION (Day 2)                                 │
│                                                                  │
│  Fetch project from DB: { githubToken: "a1b2c3....:d4e5..." }   │
│         │                                                        │
│         ▼                                                        │
│  decryptToken()                                                 │
│         │                                                        │
│         ├─> Split: [iv, authTag, encrypted]                    │
│         ├─> Derive key from SESSION_SECRET                     │
│         ├─> Verify auth tag (prevents tampering)              │
│         ├─> Decrypt with AES-256-GCM                           │
│         └─> Return: "ghp_1234567890abcdefghijklmnopqrst"       │
│                                                                  │
│  Used immediately for GitHub API call                           │
│  NEVER logged or returned in API response                       │
│  Exists only in memory for duration of request                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION FLOW                                              │
│                                                                  │
│  Browser → API Request with Cookie                              │
│         │                                                        │
│         ▼                                                        │
│  extractTokenFromRequest(req)                                   │
│         │                                                        │
│         ├─> Read "auth-token" cookie                            │
│         └─> Return JWT token                                    │
│                                                                  │
│  verifyToken(token)                                             │
│         │                                                        │
│         ├─> Verify JWT signature                                │
│         ├─> Check expiration                                    │
│         └─> Return payload: { userId, role: "admin" }          │
│                                                                  │
│  if (!payload || payload.role !== 'admin')                      │
│         └─> Return 401 Unauthorized                             │
│                                                                  │
│  else                                                            │
│         └─> Continue with request                               │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
website/
├── app/
│   ├── admin/
│   │   └── content/
│   │       └── page.tsx ................... Main content admin UI
│   └── api/
│       └── admin/
│           ├── content/
│           │   └── generate-daily/
│           │       └── route.ts ........... Generate daily update API
│           └── posts/
│               ├── route.ts ............... Posts list/create API
│               └── [id]/
│                   └── route.ts ........... Single post CRUD API
│
├── components/
│   └── admin/
│       ├── DailyUpdateGenerator.tsx ....... Project selection UI
│       └── ContentPreviewModal.tsx ........ Preview/publish modal
│
├── lib/
│   ├── github.ts .......................... GitHub API integration
│   ├── markdown-parser.ts ................. Parse project-plan.md
│   ├── read-time-calculator.ts ............ Calculate reading time
│   ├── daily-update-generator.ts .......... Generate daily updates
│   └── encryption.ts ...................... Token encryption (Day 1)
│
└── scripts/
    ├── test-github-integration.ts ......... Unit tests
    └── test-real-repo.ts .................. Integration test
```

## Component Hierarchy

```
/admin/content
│
├── <DailyUpdateGenerator>
│   │
│   ├── Fetch projects (trackProgress=true)
│   ├── Display checkboxes
│   ├── Select All / Deselect All
│   ├── "Generate Daily Update →" button
│   │   └─> onClick: Call API, show preview modal
│   │
│   └── Error/Loading states
│
├── <ContentPreviewModal> (conditional)
│   │
│   ├── Header with close button
│   ├── Stats display (projects, tasks, read time)
│   ├── Tags display
│   │
│   ├── Edit/Preview toggle
│   │   ├── Edit mode: Title input + Content textarea
│   │   └── Preview mode: Rendered markdown
│   │
│   ├── Excerpt display
│   │
│   └── Footer actions
│       ├── "Cancel" button
│       ├── "Save as Draft" button
│       └── "Publish Now" button
│
└── Recent Posts List
    │
    └── For each post:
        ├── Title + badges (Published/Draft, Daily Update)
        ├── Excerpt
        ├── Metadata (date, read time, tags)
        └── Actions (View, Edit)
```

---

**Status**: All components implemented and tested ✅
