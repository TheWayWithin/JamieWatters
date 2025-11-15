# Comprehensive Test Guide - Phase 7 Admin Dashboard

**Testing Environment**: http://localhost:3002
**Admin Password (Dev)**: `admin123`
**Database**: Seeded with 10 projects + 1 blog post

---

## QUICK START MANUAL TESTING

### Prerequisites Checklist
- ✅ Dev server running on localhost:3002
- ✅ Database seeded with projects
- ✅ Browser ready (Chrome recommended)
- ✅ DevTools open (for console monitoring)

---

## TEST 1: AUTHENTICATION FLOW

### 1.1 Initial Login
**Steps**:
1. Open http://localhost:3002/admin in browser
2. Should see login form with:
   - "Admin Login" heading
   - Password input field
   - "Login" button
3. Enter password: `admin123`
4. Click "Login"

**Expected Results**:
- ✅ Redirect to `/admin/content`
- ✅ "Admin Dashboard" header visible
- ✅ Tab navigation showing (Content, Projects, Metrics, Settings)
- ✅ "Logout" button in header
- ✅ Email "jamie@jamiewatters.work" displayed
- ✅ No console errors

**Failure Scenarios to Check**:
- ❌ Wrong password → Should show error "Invalid password"
- ❌ Empty password → Should show error or prevent submit

---

### 1.2 Session Persistence
**Steps**:
1. After successful login, refresh page (Cmd+R or Ctrl+R)
2. Wait for page reload

**Expected Results**:
- ✅ Still authenticated (no redirect to login)
- ✅ Content page still visible
- ✅ No flash of login screen
- ✅ Auth cookie persists (check DevTools → Application → Cookies)

---

### 1.3 Protected Route Access
**Steps**:
1. Click "Logout" button
2. Confirm redirected to login screen
3. Manually navigate to: http://localhost:3002/admin/projects

**Expected Results**:
- ✅ Redirects to admin login (shows login form)
- ✅ Does NOT show projects content
- ✅ Auth token cookie removed

---

### 1.4 Logout Flow
**Steps**:
1. Login again
2. Navigate to different admin tab (e.g., Settings)
3. Click "Logout" from any page

**Expected Results**:
- ✅ Logout works from any admin page
- ✅ Redirect to admin login
- ✅ Cannot access protected pages after logout

---

## TEST 2: TAB NAVIGATION (DESKTOP)

### 2.1 Desktop Tab Switching
**Steps**:
1. Login and verify on Content tab
2. Click "Projects" tab
3. Click "Metrics" tab
4. Click "Settings" tab
5. Click "Content" tab (return to start)

**Expected Results**:
- ✅ URL changes correctly:
  - Content: `/admin/content`
  - Projects: `/admin/projects`
  - Metrics: `/admin/metrics`
  - Settings: `/admin/settings`
- ✅ Active tab has blue underline and blue text
- ✅ Inactive tabs have gray text
- ✅ Hover on inactive tabs shows darker gray
- ✅ Content changes correctly for each tab
- ✅ No page reload (client-side navigation)

---

### 2.2 Visual State Verification
**Check on each tab**:
- ✅ Active tab: Blue text (`text-brand-primary`) + bottom border
- ✅ Inactive tabs: Gray text (`text-text-secondary`)
- ✅ Tab icons visible: ✍️ 🚀 📊 ⚙️
- ✅ Consistent header across all tabs
- ✅ Logout button always visible

---

## TEST 3: DAILY UPDATE WORKFLOW

### 3.1 Prerequisites Check
**Steps**:
1. Go to Projects tab
2. Verify at least one project has:
   - GitHub URL populated
   - "Track Progress" toggle enabled (green "Tracking" badge)

**If no tracked projects**:
1. Click "Edit" on any project
2. Add GitHub URL: `https://github.com/jamiewatters/JamieWatters`
3. Enable "Track Progress" toggle
4. Click "Save"

---

### 3.2 Generate Daily Update
**Steps**:
1. Go to Content tab
2. Find "📊 Generate Daily Update" card at top
3. Verify list of tracked projects appears
4. Verify checkboxes next to each project
5. Verify at least one project is checked (auto-selected)
6. Click "Generate Daily Update →" button

**Expected Results**:
- ✅ Button changes to "Generating..." with disabled state
- ✅ Loading indicator appears
- ✅ After 2-5 seconds, preview modal opens
- ✅ Preview shows:
  - Title (e.g., "Day 3: Implementation Complete")
  - Excerpt (auto-generated, ~160 chars)
  - Full markdown content
  - Tasks from project-plan.md (if GitHub repo has this file)
  - Tags list
  - Read time estimate
- ✅ No console errors

**Potential Failure Scenarios**:
- ❌ GitHub rate limit → Error: "GitHub rate limit exceeded"
- ❌ Repo not found → Error: "Could not fetch project-plan.md"
- ❌ No project-plan.md → May generate generic update
- ❌ Private repo without token → May fail or show error

---

### 3.3 Preview Content Review
**Steps**:
1. Review preview modal content
2. Check markdown rendering:
   - Headers render correctly (h1, h2, h3)
   - Lists render (bullet points, numbered)
   - Code blocks have syntax highlighting
   - Links are clickable (in preview)
3. Verify metadata:
   - Excerpt is reasonable (~160 chars)
   - Tags are relevant
   - Read time calculated (rough estimate)

**Expected Results**:
- ✅ Content is formatted correctly
- ✅ No broken markdown
- ✅ Preview looks like final post
- ✅ Can scroll through long content

---

### 3.4 Edit Before Publishing
**Steps**:
1. In preview modal, modify title (e.g., add " - Updated")
2. Modify content (add a sentence)
3. Check preview updates

**Expected Results**:
- ✅ Title edits reflected immediately
- ✅ Content edits reflected in preview
- ✅ Markdown re-renders correctly
- ✅ Character count updates if shown

---

### 3.5 Publish Daily Update
**Steps**:
1. In preview modal, click "Publish Now" button
2. Wait for API response

**Expected Results**:
- ✅ Success message: "Daily update published!"
- ✅ Modal closes automatically
- ✅ Preview state clears
- ✅ "Recent Posts" section refreshes
- ✅ New post appears at top of list with:
  - Title
  - "Published" badge (green)
  - "Daily Update" badge (blue)
  - Today's date
  - Read time
  - Tag count
- ✅ No errors in console

---

### 3.6 Verify on Public Site
**Steps**:
1. Open new tab: http://localhost:3002/journey
2. Check if new post appears in feed
3. Click on the post to view full content

**Expected Results**:
- ✅ Post visible in /journey feed
- ✅ Post displays correctly:
  - Title, date, read time
  - Excerpt
  - Tags
- ✅ Click opens post page: `/journey/[slug]`
- ✅ Full content renders correctly
- ✅ All markdown formatting preserved
- ✅ Page loads without errors

---

## TEST 4: MANUAL POST WORKFLOW

### 4.1 Create New Manual Post
**Steps**:
1. Go to Content tab
2. Find "✍️ Write Manual Post" card
3. Click "New Manual Post →" button

**Expected Results**:
- ✅ Navigate to `/admin/content/new`
- ✅ Post editor form appears with fields:
  - Title (text input)
  - Post Type (dropdown: daily-update, weekly-plan, essay, etc.)
  - Tags (input, comma-separated or chip-based)
  - Content (textarea or markdown editor)
  - Preview button
  - Save Draft button
  - Publish button

---

### 4.2 Write Post Content
**Test Data**:
- **Title**: "Week 1 Retrospective: Lessons Learned"
- **Post Type**: "weekly-plan"
- **Tags**: "retrospective, week-1, learnings"
- **Content**:
```markdown
# Week 1 Complete

## Achievements
- Set up project architecture
- Implemented admin dashboard
- Created content management system

## Challenges
- GitHub API rate limiting required authentication
- Mobile responsive design needed extra iteration

## Next Week
- Performance optimization
- SEO implementation
- Launch preparation
```

**Steps**:
1. Fill in all fields with test data above
2. Type markdown content including headers, lists, etc.

---

### 4.3 Preview Manual Post
**Steps**:
1. Click "Preview" button
2. Review preview modal

**Expected Results**:
- ✅ Preview modal opens
- ✅ Markdown renders correctly:
  - # becomes h1
  - ## becomes h2
  - Lists render as bullet points
- ✅ Title shows correctly
- ✅ Excerpt auto-generated (or editable)
- ✅ Read time calculated
- ✅ Tags parsed correctly

---

### 4.4 Save as Draft
**Steps**:
1. Click "Save Draft" button
2. Wait for response

**Expected Results**:
- ✅ Success message: "Post saved as draft"
- ✅ Post appears in "Recent Posts" with:
  - "Draft" badge (yellow/orange)
  - "Draft" text instead of date
  - Can click "Edit" to continue editing

---

### 4.5 Edit Draft
**Steps**:
1. Find draft in Recent Posts
2. Click "Edit" button
3. Modify title or content
4. Click "Save Draft" again

**Expected Results**:
- ✅ Editor pre-populates with existing content
- ✅ Can modify any field
- ✅ Save updates draft (doesn't create duplicate)
- ✅ Updated content reflected in list

---

### 4.6 Publish Draft
**Steps**:
1. Open draft for editing (or from new post form)
2. Click "Publish" button (not "Save Draft")
3. Wait for response

**Expected Results**:
- ✅ Success message: "Post published!"
- ✅ Post status changes to "Published" badge (green)
- ✅ Published date appears (today's date)
- ✅ Post now visible on /journey page
- ✅ Can view on public site

---

### 4.7 Verify Published Manual Post
**Steps**:
1. Visit http://localhost:3002/journey
2. Find the published manual post
3. Click to view full post

**Expected Results**:
- ✅ Post appears in feed
- ✅ Post type badge shown (e.g., "Weekly Plan")
- ✅ Full content displays correctly
- ✅ All markdown rendered properly
- ✅ Tags visible
- ✅ Read time accurate

---

## TEST 5: PROJECTS MANAGEMENT

### 5.1 View Projects List
**Steps**:
1. Go to Projects tab
2. Review projects list

**Expected Results**:
- ✅ All 10 seeded projects visible
- ✅ Each project shows:
  - Name
  - Description (truncated if long)
  - Tech stack (pills/badges)
  - Status badge (Active, Planning, Paused, Complete)
  - MRR and Users (if set)
  - Actions: Edit, Delete buttons
- ✅ "Add New" button visible at top
- ✅ Projects sorted (featured first, then by date)

---

### 5.2 Create New Project
**Steps**:
1. Click "Add New Project" button
2. Fill in form:

**Test Data**:
- **Name**: "TestProject-2025"
- **Description**: "Test project for QA validation"
- **URL**: "https://testproject.com"
- **GitHub URL**: "https://github.com/test/testproject"
- **Tech Stack**: Add 3 items: "React", "Node.js", "PostgreSQL"
- **Category**: "SaaS"
- **Status**: "PLANNING"
- **Featured**: Leave unchecked
- **Track Progress**: Enable toggle
- **MRR**: 0
- **Users**: 0

3. Click "Create Project" button

**Expected Results**:
- ✅ Success message: "Project created successfully"
- ✅ Form closes/redirects
- ✅ New project appears in list
- ✅ Project has:
  - Green "Tracking" badge (trackProgress enabled)
  - Correct tech stack
  - "PLANNING" status badge
- ✅ Slug auto-generated: "testproject-2025"
- ✅ No console errors

---

### 5.3 Edit Existing Project
**Steps**:
1. Find "TestProject-2025" in list
2. Click "Edit" button
3. Modify fields:
   - Change Status to "ACTIVE"
   - Change MRR to 100
   - Change Users to 50
   - Add tech stack item: "TypeScript"
4. Click "Save" button

**Expected Results**:
- ✅ Form pre-populates with current values
- ✅ Can modify all fields
- ✅ Save button updates record
- ✅ Success message appears
- ✅ Project list refreshes with updated values:
  - Status badge shows "ACTIVE"
  - MRR shows $100
  - Users shows 50
  - Tech stack includes "TypeScript"

---

### 5.4 Toggle Track Progress
**Steps**:
1. Find a project with Track Progress disabled
2. Click "Edit"
3. Enable "Track Progress" toggle
4. Save
5. Verify project now has "Tracking" badge

**Expected Results**:
- ✅ Toggle switches correctly
- ✅ Badge appears/disappears based on state
- ✅ Project now available in Daily Update generator

---

### 5.5 Delete Project (Cancel)
**Steps**:
1. Click "Delete" button on any project
2. Confirmation dialog appears
3. Click "Cancel" button

**Expected Results**:
- ✅ Confirmation dialog shows:
  - Warning message: "Are you sure you want to delete [Project Name]?"
  - "Cancel" button
  - "Delete" or "Confirm" button (danger style)
- ✅ Clicking "Cancel" closes dialog
- ✅ Project NOT deleted
- ✅ List unchanged

---

### 5.6 Delete Project (Confirm)
**Steps**:
1. Click "Delete" on "TestProject-2025" (test project)
2. Confirmation dialog appears
3. Click "Confirm" or "Delete" button

**Expected Results**:
- ✅ Success message: "Project deleted successfully"
- ✅ Dialog closes
- ✅ Project removed from list immediately
- ✅ Database record deleted
- ✅ No errors in console

---

## TEST 6: METRICS MANAGEMENT

### 6.1 View Metrics Page
**Steps**:
1. Go to Metrics tab
2. Review page layout

**Expected Results**:
- ✅ Page title: "Metrics"
- ✅ Description text explaining feature
- ✅ Project selector dropdown with all projects
- ✅ Current metrics cards (3 cards):
  - MRR card
  - Users card
  - Status card
- ✅ Update form below with:
  - MRR input
  - Users input
  - Status dropdown
  - "Update Metrics" button

---

### 6.2 Select Project
**Steps**:
1. Click project selector dropdown
2. Select a project (e.g., "AimpactScanner.com")

**Expected Results**:
- ✅ Dropdown shows all projects
- ✅ Selecting project loads current metrics:
  - MRR displays in card (e.g., "$500")
  - Users displays in card (e.g., "1,200")
  - Status displays with badge (e.g., "ACTIVE")
- ✅ Update form pre-fills with current values
- ✅ No errors

---

### 6.3 Update Metrics
**Steps**:
1. With project selected, modify metrics:
   - MRR: Change to 750
   - Users: Change to 1500
   - Status: Change to "ACTIVE" (if not already)
2. Click "Update Metrics" button

**Expected Results**:
- ✅ Button shows "Updating..." during save
- ✅ API call to POST /api/metrics
- ✅ Success message: "✅ Metrics updated successfully"
- ✅ Cards update immediately to show new values:
  - MRR: $750
  - Users: 1,500
  - Status: ACTIVE
- ✅ Form clears or maintains values
- ✅ No errors

---

### 6.4 Metrics Validation
**Steps**:
1. Try invalid inputs:
   - MRR: Enter "-100" (negative)
   - Users: Enter "abc" (non-numeric)
2. Try to submit

**Expected Results**:
- ✅ Validation prevents submit OR
- ✅ Error message shows: "Invalid input"
- ✅ Form highlights invalid fields
- ✅ Metrics NOT updated in database

---

## TEST 7: SETTINGS PAGE

### 7.1 View Settings
**Steps**:
1. Go to Settings tab
2. Review page layout

**Expected Results**:
- ✅ Page title: "Settings"
- ✅ Two main sections:
  1. **Account Information**
     - Email display: jamie@jamiewatters.work
     - "Change Password" button (disabled/coming soon)
  2. **GitHub Integration**
     - Connected projects count
     - Last sync time
     - "Sync All Projects Now" button
     - List of connected projects

---

### 7.2 GitHub Integration Stats
**Steps**:
1. Review GitHub Integration section
2. Check stats cards

**Expected Results**:
- ✅ Connected projects count matches projects with:
  - githubUrl AND trackProgress enabled
- ✅ Last sync time shows:
  - "Never synced" if no projects synced OR
  - Most recent sync time across all projects
- ✅ Connected projects list shows:
  - Project names
  - GitHub URLs
  - Sync status badges

---

### 7.3 Sync All Projects
**Steps**:
1. Click "Sync All Projects Now" button
2. Wait for response

**Expected Results**:
- ✅ Button shows "Syncing..." during operation
- ✅ API call triggered (simulated in current implementation)
- ✅ Success message appears after completion
- ✅ Last sync time updates to current time
- ✅ No errors

**Note**: Current implementation may be simulated. Real GitHub API integration would:
- Fetch project-plan.md from each repo
- Update lastSynced timestamp
- Show errors for failed repos

---

## TEST 8: MOBILE RESPONSIVENESS

### 8.1 Switch to Mobile View
**Steps**:
1. Open Chrome DevTools (F12)
2. Click "Toggle Device Toolbar" (Cmd+Shift+M)
3. Select "iPhone SE" (375px x 667px)
4. Reload page

---

### 8.2 Mobile Tab Navigation
**Steps**:
1. Login on mobile viewport
2. Observe tab navigation

**Expected Results**:
- ✅ Desktop tabs HIDDEN (horizontal tab bar not visible)
- ✅ Mobile dropdown VISIBLE instead
- ✅ Dropdown shows current tab with arrow icon (▼)
- ✅ Click dropdown to expand/collapse
- ✅ All tabs accessible from dropdown:
  - ✍️ Content
  - 🚀 Projects
  - 📊 Metrics
  - ⚙️ Settings
- ✅ Selected tab highlighted (blue text/background)
- ✅ Navigation works correctly

---

### 8.3 Mobile Forms
**Steps**:
1. Test each form on mobile:
   - Login form
   - Create Project form
   - Update Metrics form
   - Create Post form

**Check for Each Form**:
- ✅ Input fields full-width (no overflow)
- ✅ Labels visible and readable
- ✅ Touch targets ≥44px (buttons, inputs)
- ✅ No horizontal scroll
- ✅ Keyboard doesn't cover inputs
- ✅ Submit buttons accessible (not cut off)
- ✅ Validation messages visible

---

### 8.4 Mobile Tables/Lists
**Steps**:
1. View Projects list on mobile
2. View Recent Posts list on mobile

**Expected Results**:
- ✅ Tables convert to cards OR
- ✅ Tables scroll horizontally with indicator OR
- ✅ Tables stack vertically with all data visible
- ✅ Action buttons accessible
- ✅ No text truncation issues
- ✅ Touch targets large enough

---

### 8.5 Mobile Modals
**Steps**:
1. Generate daily update on mobile
2. Check preview modal

**Expected Results**:
- ✅ Modal fits in viewport
- ✅ Can scroll modal content
- ✅ Close button accessible
- ✅ Action buttons visible
- ✅ No content cut off
- ✅ Can interact with all controls

---

### 8.6 Mobile Performance
**Steps**:
1. Use Chrome DevTools Lighthouse on mobile
2. Run performance audit

**Expected Results**:
- ✅ First Contentful Paint < 2s
- ✅ Time to Interactive < 3s
- ✅ No layout shifts (CLS < 0.1)
- ✅ Touch targets appropriately sized
- ✅ Viewport meta tag present

---

## TEST 9: ERROR HANDLING

### 9.1 Network Errors
**Steps**:
1. Open DevTools → Network tab
2. Set "Offline" mode
3. Try any action (e.g., create project, generate update)

**Expected Results**:
- ✅ Error message appears: "Network error" or similar
- ✅ No silent failures
- ✅ User can retry after reconnecting
- ✅ No console errors (or graceful error logs)

---

### 9.2 GitHub API Errors
**Steps**:
1. Create project with invalid GitHub URL: "https://github.com/invalid/repo123456789"
2. Enable Track Progress
3. Try to generate daily update with this project

**Expected Results**:
- ✅ Error message: "Could not fetch project-plan.md from GitHub"
- ✅ Suggests checking repo URL
- ✅ Other projects still process (partial success)
- ✅ Preview shows what was successful

---

### 9.3 Validation Errors
**Steps**:
1. Try to create project with:
   - Empty name
   - Invalid URL (not starting with http)
   - No tech stack
2. Submit form

**Expected Results**:
- ✅ Validation prevents submit
- ✅ Error messages show for each field:
  - "Name is required"
  - "URL must be a valid URL"
  - "At least one tech stack item required"
- ✅ Highlights invalid fields (red border)
- ✅ Form does not submit

---

### 9.4 Session Expiry
**Steps**:
1. Login successfully
2. Wait 24+ hours OR manually delete auth-token cookie
3. Try any admin action

**Expected Results**:
- ✅ Detects session expired
- ✅ Redirects to login screen
- ✅ Shows message: "Session expired, please login again"
- ✅ Can login again without issues

---

## TEST 10: PERFORMANCE & ACCESSIBILITY

### 10.1 Lighthouse Audit (Desktop)
**Steps**:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select categories: Performance, Accessibility, SEO
4. Run audit on /admin/content

**Target Scores**:
- ✅ Performance: ≥90
- ✅ Accessibility: ≥90
- ✅ Best Practices: ≥90
- ✅ SEO: ≥80 (admin pages may have lower SEO priority)

---

### 10.2 Keyboard Navigation
**Steps**:
1. Logout to start fresh
2. Use ONLY keyboard (no mouse):
   - Tab through login form
   - Enter password
   - Press Enter to login
   - Tab through admin interface
   - Navigate tabs using Tab/Enter
   - Navigate forms using Tab
   - Submit forms using Enter

**Expected Results**:
- ✅ All interactive elements focusable with Tab
- ✅ Focus indicators visible (blue outline)
- ✅ Logical tab order (top to bottom, left to right)
- ✅ Can operate all features with keyboard only
- ✅ Escape key closes modals
- ✅ Enter submits forms

---

### 10.3 Screen Reader Testing (Optional)
**Steps** (macOS with VoiceOver):
1. Enable VoiceOver (Cmd+F5)
2. Navigate admin interface
3. Listen to announcements

**Expected Results**:
- ✅ Page landmarks announced (header, nav, main, footer)
- ✅ Button labels clear: "Login button", "Create Project button"
- ✅ Form fields announced with labels
- ✅ Links have descriptive text
- ✅ Images have alt text
- ✅ ARIA labels present where needed

---

### 10.4 Color Contrast
**Steps**:
1. Use browser extension: "WAVE" or "axe DevTools"
2. Run accessibility scan
3. Check color contrast issues

**Expected Results**:
- ✅ Text meets WCAG AA standards (4.5:1 for normal text)
- ✅ Large text meets 3:1 ratio
- ✅ UI components meet 3:1 ratio
- ✅ No low-contrast text issues

---

## TEST 11: EDGE CASES

### 11.1 Very Long Content
**Steps**:
1. Create manual post with 5000+ words
2. Publish
3. View on /journey page
4. Check performance

**Expected Results**:
- ✅ Editor handles long content without lag
- ✅ Preview renders completely
- ✅ Post page loads without performance issues
- ✅ Read time calculated correctly (e.g., 20-25 min)

---

### 11.2 Special Characters
**Steps**:
1. Create project/post with special characters:
   - Title: "Project #1: <Test> & "Quotes" — Em-dash"
   - Description with emoji: "🚀 Launch ready! Testing & validation"
   - Content with code: \`\`\`javascript
2. Save and view

**Expected Results**:
- ✅ Special characters display correctly (not escaped as &amp;)
- ✅ Emoji render correctly
- ✅ Code blocks syntax-highlighted
- ✅ Quotes don't break JSON
- ✅ No XSS vulnerabilities (HTML tags escaped)

---

### 11.3 Empty States
**Steps**:
1. Delete all projects (or test on fresh database)
2. Visit each admin page

**Expected Results**:
- ✅ Projects: Shows "No projects yet" message with "Add New" CTA
- ✅ Content: Shows "No posts yet" message
- ✅ Metrics: Shows "Select a project" or disabled state
- ✅ Settings: Shows "No connected projects" (if none have GitHub)
- ✅ No broken UI or console errors

---

### 11.4 Concurrent Sessions
**Steps**:
1. Login on Chrome
2. Login on Firefox (or incognito)
3. Perform actions on both simultaneously
4. Verify data consistency

**Expected Results**:
- ✅ Both sessions work independently
- ✅ Changes in one reflect in other after refresh
- ✅ No race conditions
- ✅ No data corruption

---

## TEST 12: CONSOLE & LOGS

### 12.1 Console Error Monitoring
**Throughout all tests, monitor browser console**:

**Acceptable Logs**:
- ✅ Info logs: "Project created", "Auth check passed"
- ✅ Development warnings about HMR (Hot Module Reload)

**Unacceptable Errors**:
- ❌ React errors: "Cannot read property", "undefined is not a function"
- ❌ API errors: 500 Internal Server Error (unless testing error handling)
- ❌ TypeScript errors: "Property does not exist"
- ❌ Hydration errors: "Text content does not match"
- ❌ Memory leaks: Continual increase in memory usage

---

### 12.2 Network Tab Monitoring
**Check DevTools → Network tab**:

**Expected Patterns**:
- ✅ API calls return 200/201 for success
- ✅ API calls return 400/401/404/500 with error messages (when testing errors)
- ✅ No unnecessary duplicate requests
- ✅ Auth token sent in headers/cookies
- ✅ Response times < 500ms for most calls (GitHub API may be slower)

**Red Flags**:
- ❌ Repeated failed requests (infinite retry loop)
- ❌ Requests timing out (> 10s)
- ❌ Large payload sizes (> 1MB for admin operations)

---

## SUMMARY CHECKLIST

After completing all tests, verify:

### Functionality
- [ ] Authentication flow works completely
- [ ] All 4 tabs navigate correctly
- [ ] Daily update generation works end-to-end
- [ ] Manual post creation works end-to-end
- [ ] Projects CRUD operations all work
- [ ] Metrics update works
- [ ] Settings page displays correctly
- [ ] Published posts appear on /journey page

### User Experience
- [ ] No confusing error messages
- [ ] Loading states show during async operations
- [ ] Success messages appear after mutations
- [ ] Forms validate before submit
- [ ] Confirmation dialogs for destructive actions

### Mobile
- [ ] Tab navigation works on mobile
- [ ] All forms usable on mobile
- [ ] No horizontal scroll
- [ ] Touch targets appropriately sized

### Performance
- [ ] Page load < 2s
- [ ] No janky animations
- [ ] No memory leaks
- [ ] Lighthouse score ≥ 90

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] ARIA labels present

### Security
- [ ] Auth required for all admin routes
- [ ] Session expires after 24 hours
- [ ] Logout clears session
- [ ] No sensitive data in console logs

---

## REPORTING TEMPLATE

When reporting bugs, use this format:

```markdown
### Bug: [Short title]
**Severity**: Critical | High | Medium | Low
**Location**: [Page/component]
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Screenshot**: [If applicable]
**Console Error**: [If any]
**Suggested Fix**: [If known]
```

---

**Testing Tip**: Use the "Console Drawer" in DevTools (Escape key) to see console logs while testing in Device Mode or Lighthouse.

**Time Estimate**: Complete testing should take 2-3 hours for thorough coverage.
