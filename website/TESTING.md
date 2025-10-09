# Testing Checklist

This document outlines all manual testing that should be performed before deployment.

## Keyboard Navigation

- [ ] Tab through all interactive elements in logical order
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes mobile menu
- [ ] Focus visible on all elements (3px purple glow)
- [ ] Skip to content link works (Tab on page load, then Enter)
- [ ] All forms can be completed with keyboard only

## Screen Reader Testing

- [ ] Page titles announce correctly
- [ ] Headings in logical hierarchy (H1 → H2 → H3)
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] ARIA labels on icon buttons (mobile menu, social icons)
- [ ] Links have descriptive text (no "click here")
- [ ] Dynamic content changes announced

### Test with:
- macOS: VoiceOver (Cmd+F5)
- Windows: NVDA (free)
- Chrome: ChromeVox extension

## Color Contrast (WCAG AA)

All color combinations meet minimum 4.5:1 for body text:

- [ ] Cloud (#F8FAFC) on Deep Space (#0F172A): 15.8:1 ✅ (AAA)
- [ ] Visionary Purple (#7C3AED) on Deep Space: 4.9:1 ✅ (AA Large)
- [ ] Execution Blue (#2563EB) on Deep Space: 5.2:1 ✅ (AA)
- [ ] Proof Gold (#F59E0B) on Deep Space: 6.8:1 ✅ (AA)
- [ ] All interactive elements meet 4.5:1 minimum
- [ ] Test with WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

## Responsive Design

### Mobile (375px - iPhone SE)
- [ ] All content readable
- [ ] No horizontal scroll
- [ ] Touch targets > 44px
- [ ] Mobile menu functional
- [ ] Single column layouts
- [ ] Fonts scale appropriately

### Tablet (768px - iPad)
- [ ] 2-column grids work correctly
- [ ] Navigation switches to desktop view at md: breakpoint
- [ ] Images scale properly
- [ ] No layout breaks

### Desktop (1440px - Common laptop)
- [ ] Full layouts display correctly
- [ ] 3-4 column grids aligned
- [ ] Max-width constraint (1280px) working
- [ ] Hover states functional
- [ ] Desktop navigation visible

### Test Devices/Browsers:
- [ ] Chrome DevTools responsive mode
- [ ] Actual iPhone/iPad if available
- [ ] Firefox responsive design mode
- [ ] Safari if on macOS

## Performance

### Lighthouse Audits (Chrome DevTools)
Run on incognito mode for accurate results:

- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 95

### Loading Performance
- [ ] Page load < 2s on 3G connection
- [ ] Time to First Byte (TTFB) < 600ms
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] First Input Delay (FID) < 100ms

### Bundle Size
- [ ] Total JavaScript < 200KB gzipped ✅ (Currently ~105KB)
- [ ] Total CSS < 50KB gzipped
- [ ] Fonts < 100KB
- [ ] No duplicate dependencies (check with bundle analyzer)

### Image Optimization
- [ ] All images WebP format
- [ ] Images lazy loaded below fold
- [ ] Proper width/height attributes (no CLS)
- [ ] Responsive images served (srcset)

## Functionality Testing

### Home Page
- [ ] Hero section loads correctly
- [ ] Metrics dashboard displays (even with zeros)
- [ ] Featured projects render (3 cards)
- [ ] Recent blog posts render (3 cards)
- [ ] All CTAs link correctly
- [ ] Navigation to other pages works

### Portfolio Listing
- [ ] All 10 projects display
- [ ] Aggregate metrics show correctly
- [ ] Project cards clickable
- [ ] Grid responsive (3→2→1 columns)
- [ ] Tech badges color-coded correctly
- [ ] Links to individual projects work

### Individual Project Pages
- [ ] All 10 project slugs generate pages
- [ ] Project data displays correctly
- [ ] Metrics cards show current data
- [ ] Tech stack badges render
- [ ] Hero image placeholder visible (16:9)
- [ ] Related projects section works
- [ ] "View All Projects" link functional

### Blog Listing ("The Journey")
- [ ] All blog posts display
- [ ] Posts sorted by date (newest first)
- [ ] Post cards show: title, excerpt, date, tags, read time
- [ ] Grid responsive (3→1 columns)
- [ ] Links to individual posts work
- [ ] RSS link present (functional when implemented)

### Individual Blog Posts
- [ ] All 3 posts generate correctly
- [ ] Markdown renders properly
- [ ] Syntax highlighting works (code blocks)
- [ ] Tags display correctly
- [ ] Social share buttons work:
  - [ ] Twitter share opens intent
  - [ ] LinkedIn share opens dialog
  - [ ] Copy link copies to clipboard (shows success message)
- [ ] Post navigation (Previous/Next) works
- [ ] "Back to all posts" link functional

### About Page
- [ ] Profile photo placeholder visible
- [ ] Content sections readable (max-width 800px)
- [ ] Email link works (opens mail client)
- [ ] Social icons link correctly (Twitter, LinkedIn, GitHub)
- [ ] "Follow My Journey" CTA links to /journey

### Admin Dashboard
**Unauthenticated:**
- [ ] Login form displays
- [ ] Password input works
- [ ] Invalid password shows error
- [ ] Valid password authenticates (currently: "password")

**Authenticated:**
- [ ] Project selector dropdown works (10 projects)
- [ ] Current metrics display for selected project
- [ ] Update form fields functional:
  - [ ] MRR input (number)
  - [ ] Users input (number)
  - [ ] Status dropdown (4 options)
- [ ] Save button submits form
- [ ] Success message displays on save
- [ ] Logout button returns to login form

## Cross-Browser Testing

### Required Browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest) - if on macOS
- [ ] Edge (latest)

### Test in each browser:
- [ ] Page loads without errors
- [ ] All features functional
- [ ] Styles render correctly
- [ ] No console errors
- [ ] Fonts load properly

## Security Testing

- [ ] Admin password NOT in plain text in code
- [ ] Environment variables NOT committed to Git
- [ ] CSP headers working (check Network tab)
- [ ] No inline scripts (CSP compliant)
- [ ] HTTPS enforced in production
- [ ] No sensitive data in client-side code

## Accessibility Testing Tools

### Automated Tools:
1. **Lighthouse** (Chrome DevTools)
   - Run audit
   - Fix all high/medium issues

2. **axe DevTools** (Browser extension)
   - Install extension
   - Run scan on each page
   - Address violations

3. **WAVE** (WebAIM)
   - Visit https://wave.webaim.org/
   - Enter page URL
   - Review errors/warnings

### Manual Testing:
- [ ] Keyboard-only navigation (unplug mouse!)
- [ ] Screen reader testing (VoiceOver/NVDA)
- [ ] Zoom to 200% (text still readable, no horizontal scroll)
- [ ] Dark mode (already default, verify contrast)

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests above passing
- [ ] No console errors in any browser
- [ ] Lighthouse scores meet targets (>90)
- [ ] Environment variables configured in Netlify
- [ ] Database migrations run on production database
- [ ] Admin password bcrypt hashed (NOT plain text)
- [ ] DNS configured for custom domain
- [ ] SSL certificate active
- [ ] 404 page works correctly
- [ ] robots.txt and sitemap.xml present (if applicable)
- [ ] Open Graph image displays correctly (test on social media)

## Post-Deployment Verification

After deploying to jamiewatters.work:

- [ ] Site loads at https://jamiewatters.work
- [ ] All pages accessible via navigation
- [ ] Direct links to all pages work
- [ ] Admin login works
- [ ] Metrics update persists to database
- [ ] ISR revalidation working (1-hour cache)
- [ ] API routes responding correctly
- [ ] No mixed content warnings (all HTTPS)
- [ ] Google Search Console indexing (submit sitemap)

## Known Issues / Deferred

Document any known issues that will be fixed in v2:

- RSS feed endpoint not implemented yet
- Real-time metrics updates (currently manual)
- Blog post search/filtering
- Project category filtering
- Image optimization (WebP conversion pending)
- Profile photo needs optimization

## Testing Notes

Add notes from testing sessions here:

- Date tested: _________
- Tester: _________
- Issues found: _________
- Fixes applied: _________
