# Day 2 Testing Guide
## How to Test the Daily Update Generator

---

## Prerequisites

✅ **Completed from Day 1**:
- Database schema with `Project.githubUrl`, `Project.githubToken`, `Project.trackProgress`
- Encryption/decryption functions working
- Admin authentication working
- Projects CRUD API working

✅ **From Day 2**:
- All files created and build successful
- Dev server running (`npm run dev`)

---

## Quick Test Scenarios

### Scenario 1: Test with Existing Project (No GitHub Integration)

**Goal**: Verify UI works and shows appropriate messages

1. **Login to admin**
   ```
   Navigate to: http://localhost:3000/admin
   Login with admin credentials
   ```

2. **Navigate to Content page**
   ```
   Click "Content" in admin dashboard
   OR navigate to: http://localhost:3000/admin/content
   ```

3. **Expected Result**:
   - If no projects have `trackProgress=true`:
     ```
     📊 Generate Daily Update
     No projects are set to track progress.
     Go to Projects and enable "Track Progress" for projects you want to include.
     ```

4. **Enable tracking on a project**:
   ```
   Navigate to: http://localhost:3000/admin/projects
   Find a project
   Toggle "Track Progress" switch
   Go back to Content page
   ```

5. **Expected Result**:
   - Project appears in checkbox list
   - Shows project name and GitHub URL (if configured)

---

### Scenario 2: Test with Public GitHub Repository

**Goal**: Generate a daily update from a real public repo

1. **Create a test project with GitHub URL**:
   ```
   Navigate to: http://localhost:3000/admin/projects/new

   Fill in:
   - Name: "Test Project"
   - Description: "Testing daily updates"
   - GitHub URL: "https://github.com/vercel/next.js"
   - Track Progress: ✅ Enabled
   ```

2. **Create project-plan.md in that repo** (if it doesn't exist):
   ```markdown
   # Project Plan

   ## This Week
   - [x] Completed task 1
   - [x] Completed task 2
   - [ ] Pending task

   ## Next Week
   - [ ] Future task
   ```

3. **Generate daily update**:
   ```
   Navigate to: http://localhost:3000/admin/content
   Project should be checked
   Click "Generate Daily Update →"
   ```

4. **Expected Result**:
   - Loading indicator appears
   - If project-plan.md exists:
     - Preview modal shows
     - Displays completed tasks
     - Shows read time, tags
   - If file doesn't exist:
     - Error message: "project-plan.md not found"

---

### Scenario 3: Test with This Repository (JamieWatters)

**Goal**: Test with the actual project repository

1. **Push project-plan.md to GitHub** (if not already pushed):
   ```bash
   cd /Users/jamiewatters/DevProjects/JamieWatters
   git add project-plan.md
   git commit -m "Add project-plan.md for daily updates"
   git push origin main
   ```

2. **Create project for JamieWatters**:
   ```
   Navigate to: http://localhost:3000/admin/projects/new

   Fill in:
   - Name: "JamieWatters.work"
   - Description: "Personal portfolio and build-in-public CMS"
   - GitHub URL: "https://github.com/TheWayWithin/JamieWatters"
   - Track Progress: ✅ Enabled
   - Category: AI_TOOLS (or appropriate)
   - Status: ACTIVE
   ```

3. **Generate daily update**:
   ```
   Navigate to: http://localhost:3000/admin/content
   "JamieWatters.work" should be checked
   Click "Generate Daily Update →"
   Wait for GitHub API call (1-2 seconds)
   ```

4. **Expected Result**:
   - Preview modal appears
   - Shows title: "Daily Update: November 10, 2025"
   - Lists completed tasks from project-plan.md
   - Shows sections (Week 1, Week 2, etc.)
   - Read time calculated
   - Tags: ["daily-update", "build-in-public"]

5. **Test editing**:
   ```
   Click "✏️ Edit"
   Modify title or content
   Click "👁️ Preview" to see changes
   ```

6. **Test publishing**:
   ```
   Click "Publish Now"
   Wait for API call
   Modal closes
   Post appears in "Recent Posts" list
   ```

7. **Verify post created**:
   ```
   Navigate to: http://localhost:3000/journey
   Post should appear in list
   Click to view full post
   ```

---

### Scenario 4: Test with Private Repository

**Goal**: Test token decryption and private repo access

1. **Create a private GitHub repository**:
   ```
   1. Go to https://github.com/new
   2. Create private repository
   3. Add project-plan.md file
   4. Commit and push
   ```

2. **Generate GitHub token**:
   ```
   1. Go to https://github.com/settings/tokens
   2. Generate new token (classic)
   3. Scopes: repo (all)
   4. Copy token: ghp_xxxxxxxxxxxxxxxxxxxx
   ```

3. **Create project with token**:
   ```
   Navigate to: http://localhost:3000/admin/projects/new

   Fill in:
   - Name: "Private Project"
   - GitHub URL: "https://github.com/yourusername/private-repo"
   - GitHub Token: ghp_xxxxxxxxxxxxxxxxxxxx (paste token)
   - Track Progress: ✅ Enabled
   ```

4. **Verify token encrypted**:
   ```
   Open database:
   SELECT githubToken FROM "Project" WHERE name = 'Private Project';

   Should see encrypted format:
   "a1b2c3d4....:e5f6g7h8....:i9j0k1l2...."
   NOT plain text token!
   ```

5. **Generate daily update**:
   ```
   Navigate to: http://localhost:3000/admin/content
   "Private Project" should be checked
   Click "Generate Daily Update →"
   ```

6. **Expected Result**:
   - ✅ Success: Token decrypted, file fetched, tasks parsed
   - ❌ Error: Check token permissions or repo URL

---

### Scenario 5: Test Error Handling

**Goal**: Verify errors are handled gracefully

**Test 1: Invalid GitHub URL**
```
Create project with URL: "not-a-valid-url"
Try to generate daily update
Expected: "Invalid GitHub URL format" error
```

**Test 2: Non-existent file**
```
Create project with valid repo but no project-plan.md
Try to generate daily update
Expected: "project-plan.md not found" error
```

**Test 3: Rate limit**
```
Make 60+ requests without token (hard to test)
Expected: "GitHub API rate limit exceeded. Resets at HH:MM."
```

**Test 4: No projects selected**
```
Deselect all projects
Click "Generate Daily Update →"
Expected: "Please select at least one project" error
```

**Test 5: Network error**
```
Disconnect internet
Try to generate daily update
Expected: "Failed to fetch from GitHub" error
```

---

## Manual Testing Checklist

### UI Components

- [ ] **Content Page Loads**
  - [ ] Shows "Generate Daily Update" section
  - [ ] Shows "Write Manual Post" section
  - [ ] Shows "Recent Posts" section

- [ ] **Project Selection**
  - [ ] Lists projects with trackProgress=true
  - [ ] Checkboxes work (check/uncheck)
  - [ ] "Select All" button works
  - [ ] "Deselect All" button works
  - [ ] Shows project count "X of Y project(s) selected"

- [ ] **Loading States**
  - [ ] Button shows "Generating..." while loading
  - [ ] Button disabled during generation
  - [ ] Cursor shows loading indicator

- [ ] **Error Messages**
  - [ ] Shows error in red box below checkboxes
  - [ ] Error message is user-friendly
  - [ ] Doesn't expose sensitive info (tokens, stack traces)

### Preview Modal

- [ ] **Modal Display**
  - [ ] Opens after successful generation
  - [ ] Centers on screen
  - [ ] Blocks interaction with background
  - [ ] Has close button (X)

- [ ] **Content Display**
  - [ ] Shows project count, task count, read time
  - [ ] Shows tags as badges
  - [ ] Shows generated title
  - [ ] Shows markdown content (formatted)

- [ ] **Edit Functionality**
  - [ ] "Edit" button shows textarea
  - [ ] Can modify title
  - [ ] Can modify content
  - [ ] "Preview" button shows rendered markdown
  - [ ] Changes persist between edit/preview toggle

- [ ] **Publishing**
  - [ ] "Save as Draft" creates post with published=false
  - [ ] "Publish Now" creates post with published=true
  - [ ] Button shows "Saving..." / "Publishing..." during API call
  - [ ] Modal closes on success
  - [ ] Recent posts list updates

### API Endpoints

- [ ] **POST /api/admin/content/generate-daily**
  - [ ] Requires authentication (401 if not logged in)
  - [ ] Validates projectIds array
  - [ ] Returns preview object
  - [ ] Handles GitHub API errors
  - [ ] Doesn't save to database

- [ ] **POST /api/admin/posts**
  - [ ] Requires authentication
  - [ ] Validates required fields
  - [ ] Generates unique slug
  - [ ] Creates post in database
  - [ ] Revalidates Next.js cache
  - [ ] Returns created post

- [ ] **GET /api/admin/posts**
  - [ ] Requires authentication
  - [ ] Returns posts array
  - [ ] Supports filtering (postType, published)
  - [ ] Orders by publishedAt DESC

### GitHub Integration

- [ ] **URL Parsing**
  - [ ] HTTPS format: github.com/owner/repo
  - [ ] SSH format: git@github.com:owner/repo
  - [ ] Short format: owner/repo
  - [ ] With .git suffix
  - [ ] Returns null for invalid URLs

- [ ] **File Fetching**
  - [ ] Fetches from public repos (no token)
  - [ ] Fetches from private repos (with token)
  - [ ] Decodes base64 content
  - [ ] Handles 404 errors
  - [ ] Handles 403 rate limits
  - [ ] Sets proper User-Agent header

- [ ] **Token Security**
  - [ ] Tokens encrypted before storage
  - [ ] Tokens decrypted only when needed
  - [ ] Tokens NEVER in API responses
  - [ ] Tokens NEVER in console logs
  - [ ] Tokens NEVER in error messages

### Markdown Parsing

- [ ] **Task Detection**
  - [ ] Detects `- [ ]` as pending
  - [ ] Detects `- [x]` as completed
  - [ ] Detects `- [X]` as completed (case-insensitive)
  - [ ] Supports `*` and `+` list markers
  - [ ] Detects in-progress indicators (⏳, 🚧)

- [ ] **Section Association**
  - [ ] Associates tasks with parent headers
  - [ ] Supports # to ###### heading levels
  - [ ] Handles tasks without sections

- [ ] **Completion Calculation**
  - [ ] Calculates percentage correctly
  - [ ] Handles 0 tasks (0%)
  - [ ] Handles all completed (100%)

### Content Generation

- [ ] **Markdown Output**
  - [ ] Generates proper markdown syntax
  - [ ] Includes project names as headers
  - [ ] Includes GitHub links
  - [ ] Groups tasks by project
  - [ ] Shows completed tasks with ✅
  - [ ] Shows in-progress tasks with ⏳
  - [ ] Adds footer with attribution

- [ ] **Metadata**
  - [ ] Title includes date
  - [ ] Excerpt summarizes content
  - [ ] Tags include "daily-update", "build-in-public"
  - [ ] Read time calculated (1-10 min typical)

---

## Automated Tests

Run the test scripts:

```bash
cd /Users/jamiewatters/DevProjects/JamieWatters/website

# Basic functionality tests
npx tsx scripts/test-github-integration.ts

# Real repository test (after pushing project-plan.md)
npx tsx scripts/test-real-repo.ts
```

**Expected Output**:
```
✅ URL parsing: 4/4 tests passed
✅ Public repo fetch: Success
✅ 404 handling: Correct error caught
✅ Markdown parsing: 9 tasks detected correctly
✅ Read time: Calculated correctly
```

---

## Database Verification

Check database state:

```sql
-- Verify encryption
SELECT id, name,
       LENGTH(githubToken) as token_length,
       (githubToken LIKE '%:%:%') as is_encrypted
FROM "Project"
WHERE githubToken IS NOT NULL;

-- Expected: token_length > 100, is_encrypted = true

-- Check posts created
SELECT id, title, postType, published,
       publishedAt, createdAt
FROM "Post"
WHERE postType = 'daily-update'
ORDER BY createdAt DESC
LIMIT 5;

-- Verify no plaintext tokens in logs
-- Check application logs for "ghp_" or "github_pat_"
-- Should be ZERO occurrences
```

---

## Performance Testing

1. **Response Time**:
   ```
   Generate daily update with 1 project: < 2 seconds
   Generate daily update with 3 projects: < 5 seconds
   Generate daily update with 10 projects: < 15 seconds
   ```

2. **Database Queries**:
   ```
   Open browser DevTools → Network tab
   Generate daily update
   Check API response times:
   - /api/admin/projects: < 200ms
   - /api/admin/content/generate-daily: < 5000ms
   - /api/admin/posts: < 500ms
   ```

3. **GitHub API Rate Limits**:
   ```
   Without token: 60 requests/hour
   With token: 5000 requests/hour

   Monitor: Response headers
   - x-ratelimit-remaining
   - x-ratelimit-reset
   ```

---

## Troubleshooting

### Issue: "Authentication required" error

**Solution**:
- Make sure you're logged in to admin
- Check cookie "auth-token" exists in browser
- Verify JWT token hasn't expired
- Try logging out and back in

### Issue: "project-plan.md not found"

**Solution**:
- Verify file exists in GitHub repository
- Check file is named exactly "project-plan.md" (lowercase)
- Ensure file is in root directory, not subfolder
- Try accessing directly: github.com/owner/repo/blob/main/project-plan.md

### Issue: "Invalid GitHub URL format"

**Solution**:
- Use format: github.com/owner/repo
- Remove trailing slashes
- Remove /tree/main or /blob/main paths
- Test with parseGitHubUrl() function

### Issue: "Access forbidden" (403 error)

**Solution**:
- For private repos: Add GitHub token
- Check token hasn't expired
- Verify token has "repo" scope
- Test token at: https://api.github.com/user (with Bearer token)

### Issue: Rate limit exceeded

**Solution**:
- Wait for reset time (shown in error message)
- Add GitHub token to increase limit to 5000/hour
- Reduce number of projects in single generation
- Cache project-plan.md content (future enhancement)

### Issue: Modal doesn't open

**Solution**:
- Check browser console for errors
- Verify preview data returned from API
- Check modal z-index (should be 50)
- Try refreshing page

---

## Success Criteria

✅ **Minimum Viable Testing**:
- [ ] Generate daily update from 1 public repo
- [ ] Preview modal displays correctly
- [ ] Publish creates post in database
- [ ] Post visible at /journey page

✅ **Complete Testing**:
- [ ] All scenarios tested (5/5)
- [ ] All UI components work (checkboxes, buttons, modal)
- [ ] All API endpoints return correct data
- [ ] Error handling graceful and user-friendly
- [ ] Security verified (encryption, no token leaks)
- [ ] Performance acceptable (<5s for 3 projects)

---

## Next Steps After Testing

Once testing is complete:

1. **Document any issues found** in GitHub issues
2. **Create sample daily update** for portfolio
3. **Set up regular generation schedule** (manual for now, automated in future)
4. **Proceed to Day 3**: Manual content editor and post management UI

---

*Testing is critical for production deployment. Take time to verify all scenarios!*
