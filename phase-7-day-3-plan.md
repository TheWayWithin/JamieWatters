# Phase 7 Day 3: Manual Content Editor & Post Management

**Mission**: Implement markdown editor and post management UI
**Status**: IN PROGRESS
**Started**: 2025-11-10
**Working Directory**: `/Users/jamiewatters/DevProjects/JamieWatters/website`

## Objectives

From phase-7-simple-cms-plan.md Day 3:

1. ✅ Rich text markdown editor with live preview
2. ✅ Post edit UI (create/edit pages)
3. ⏭️ Image upload support (deferred - optional)
4. ✅ Delete confirmation modals
5. ✅ Post metadata editing (tags, excerpt, publish status)

## Implementation Tasks

### Task 1: Markdown Editor Component (2 hours)
**Component**: `/components/admin/MarkdownEditor.tsx`

**Features**:
- [ ] Textarea for markdown input
- [ ] Live preview pane (side-by-side layout)
- [ ] Toolbar with markdown actions (Bold, Italic, Heading, Link, Code, List)
- [ ] Character/word count
- [ ] Auto-save to draft (every 30 seconds)

**Libraries**:
- Simple textarea (no heavy dependencies)
- `remark` + `remark-html` for preview (already in project)
- `rehype-highlight` for code syntax highlighting

**Files to Create**:
- `/components/admin/MarkdownEditor.tsx`
- `/hooks/useAutoSave.ts`

### Task 2: Manual Post Creation Page (2 hours)
**Component**: `/app/admin/content/new/page.tsx`

**Form Fields**:
- Title (required)
- Content (markdown, required)
- Excerpt (optional, auto-generate from first 160 chars if empty)
- Tags (comma-separated input)
- Post Type (dropdown: "manual" | "weekly-plan")
- Project ID (optional: link to specific project)
- Published (boolean: Publish now or save as draft)

**Features**:
- [ ] Auto-generate slug from title
- [ ] Auto-calculate read time from content
- [ ] Auto-generate excerpt if not provided
- [ ] Save draft locally (localStorage) to prevent data loss
- [ ] Validation before publish

**Files to Create**:
- `/app/admin/content/new/page.tsx`
- `/components/admin/PostForm.tsx`

### Task 3: Post Management List (1.5 hours)
**Component**: `/app/admin/content/posts/page.tsx`

**Features**:
- [ ] List all posts (published + drafts)
- [ ] Columns: Title, Type, Status, Published Date, Actions
- [ ] Filter by: All / Published / Drafts / Daily Updates / Manual
- [ ] Search by title
- [ ] Delete with confirmation modal

**Files to Create**:
- `/app/admin/content/posts/page.tsx`
- `/components/admin/PostsList.tsx`
- `/components/admin/PostsFilter.tsx`

### Task 4: Edit Post Page (1 hour)
**Component**: `/app/admin/content/posts/[id]/page.tsx`

**Features**:
- [ ] Pre-populate form with existing post data
- [ ] Show "Last saved" timestamp
- [ ] Cannot change postType after creation
- [ ] Reuse PostForm component

**Files to Create**:
- `/app/admin/content/posts/[id]/page.tsx` (reuses PostForm)

### Task 5: Post CRUD API Routes
**Endpoints needed** (may already exist from Day 2):
- `POST /api/admin/posts` - Create new post
- `GET /api/admin/posts/[id]` - Get single post
- `PUT /api/admin/posts/[id]` - Update post
- `DELETE /api/admin/posts/[id]` - Delete post

**Files** (may already exist):
- `/app/api/admin/posts/route.ts` (GET, POST)
- `/app/api/admin/posts/[id]/route.ts` (GET, PUT, DELETE)

## Success Criteria

- [ ] Create new manual post with markdown
- [ ] Preview renders correctly
- [ ] Save as draft
- [ ] Edit draft
- [ ] Publish draft
- [ ] Verify post appears on /journey page
- [ ] Auto-save works (wait 30 seconds without clicking save)
- [ ] Excerpt auto-generates if empty
- [ ] Delete confirmation modal works
- [ ] Slug auto-generates from title
- [ ] Read time auto-calculates

## Dependencies

**From Day 1 & 2** (already complete):
- Database schema with Post model ✅
- Admin authentication ✅
- Admin content page at `/admin/content` ✅
- Prisma schema includes `postType`, `projectId` fields ✅

## Context Preservation

**Before starting**: Read existing admin components to understand patterns
**During work**: Follow existing authentication and admin UI patterns
**After completion**: Update progress.md with what was completed

## Security Requirements

- All routes protected by existing auth middleware
- Content sanitization for markdown (XSS prevention)
- CSRF protection on forms
- Input validation with Zod schemas

## Performance Considerations

- Auto-save debounced to prevent excessive API calls
- Preview rendering optimized (debounced on keystroke)
- Markdown parser cached when possible

---

**Note**: Image upload support deferred as optional - can be added later if needed
