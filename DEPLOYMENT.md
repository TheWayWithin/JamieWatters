# Netlify Deployment Guide

Complete guide for deploying jamiewatters.work to Netlify with Neon database.

## Prerequisites

- [x] GitHub repository created
- [ ] Neon database created
- [ ] Admin password hash generated
- [ ] Custom domain ready (jamiewatters.work)
- [ ] Netlify account created

## Step 1: Neon Database Setup

### 1.1 Create Neon Project

1. Go to https://neon.tech
2. Sign up or log in
3. Click "Create a project"
4. Project settings:
   - **Name**: `jamiewatters-work`
   - **Region**: Choose closest to your users (e.g., US East for North America)
   - **Postgres version**: 16 (latest)
5. Click "Create project"

### 1.2 Get Database Connection String

1. In Neon dashboard, go to "Connection Details"
2. Copy the connection string (format: `postgresql://user:password@host/database`)
3. **IMPORTANT**: Keep this secure - never commit to Git!

### 1.3 Enable Database Branching (Optional but Recommended)

Neon's branching allows separate databases for production and preview deployments:

1. In Neon dashboard, go to "Branches"
2. Main branch already created (`main`)
3. For each preview deployment, Netlify can create a branch database
4. This prevents preview deployments from affecting production data

## Step 2: Generate Admin Password Hash

You'll need to hash your admin password with bcrypt before deployment.

### Option 1: Using Node.js (if bcrypt installed locally)

```bash
cd website
node -e "console.log(require('bcrypt').hashSync('your-secure-password', 12))"
```

Replace `your-secure-password` with a strong password.

### Option 2: Using Online Bcrypt Generator

1. Go to https://bcrypt-generator.com/
2. Enter your password
3. Set rounds to **12**
4. Copy the hash (starts with `$2b$12$...`)
5. **IMPORTANT**: Use a strong password (16+ characters, mixed case, numbers, symbols)

**Example hash:**
```
$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYKJ8S1.44K
```

## Step 3: Netlify Site Creation

### 3.1 Connect Repository

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Authorize Netlify to access your GitHub account
5. Select repository: `jamiewatters/jamiewatters-work` (or your repo)

### 3.2 Configure Build Settings

**Important**: Netlify auto-detects Next.js but verify these settings:

- **Base directory**: Leave blank (root)
- **Build command**: `cd website && npm run build`
- **Publish directory**: `website/.next`
- **Functions directory**: `website/.netlify/functions`

### 3.3 Environment Variables

Add these in: **Site settings → Environment variables → Add a variable**

| Key | Value | Context |
|-----|-------|---------|
| `DATABASE_URL` | `postgresql://user:password@host/database` | Production |
| `ADMIN_PASSWORD_HASH` | `$2b$12$...` (from Step 2) | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://jamiewatters.work` | Production |

**Important Notes:**
- Mark `DATABASE_URL` as **sensitive** (hide in logs)
- Mark `ADMIN_PASSWORD_HASH` as **sensitive**
- `NEXT_PUBLIC_*` variables are exposed to client (OK for site URL)

### 3.4 Install Next.js Plugin

Netlify should auto-detect Next.js and install the plugin. Verify in:
- **Site settings → Build & deploy → Build plugins**
- Look for `@netlify/plugin-nextjs`
- If not installed, click "Add plugin" and search for "Next.js"

## Step 4: Initial Deploy

1. Click "Deploy site" (or push to `main` branch triggers auto-deploy)
2. Wait for build to complete (~2-3 minutes)
3. Monitor build logs for errors

### Expected Build Output:
```
Building Next.js site...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (23/23)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB          105 kB
├ ○ /about                               3.8 kB          103 kB
├ ○ /admin                               4.5 kB          108 kB
├ ● /journey/[slug]                      2.1 kB           99 kB
├   ├ /journey/first-million
├   ├ /journey/ai-automation
├   └ /journey/solo-founder
└ ● /portfolio/[slug]                    3.4 kB          101 kB
    ├ /portfolio/project-1
    └ [+9 more paths]

Build complete!
```

### 4.1 Test Temporary URL

1. After build completes, Netlify assigns a random URL: `https://random-name-12345.netlify.app`
2. Open this URL in browser
3. Verify:
   - [ ] Home page loads
   - [ ] Navigation works
   - [ ] Portfolio pages load
   - [ ] Blog posts load
   - [ ] About page loads
   - [ ] Admin login works (use your password from Step 2)

### 4.2 Troubleshooting Build Failures

**Common issues:**

1. **"npm install failed"**
   - Check `package.json` is valid JSON
   - Try adding `NPM_FLAGS="--legacy-peer-deps"` in environment variables

2. **"Prisma schema not found"**
   - Verify `prisma/schema.prisma` exists in `/website` directory
   - Add build command: `cd website && npx prisma generate && npm run build`

3. **"DATABASE_URL not set"**
   - Verify environment variable added correctly
   - Check for typos in variable name (case-sensitive)

4. **"Next.js build failed"**
   - Check build logs for specific error
   - Test build locally: `cd website && npm run build`

## Step 5: Database Migrations

Now that the site is deployed, run database migrations to create tables.

### 5.1 Run Migrations

You can run migrations in two ways:

**Option 1: Locally (Recommended for first time)**

```bash
cd website

# Set DATABASE_URL temporarily (don't commit!)
export DATABASE_URL="postgresql://user:password@host/database"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database with initial data
npx prisma db seed
```

**Option 2: Via Netlify Functions (Advanced)**

Create a one-time function to run migrations (not covered in MVP).

### 5.2 Verify Database

```bash
# Open Prisma Studio to view data
npx prisma studio
```

You should see:
- `Project` table with 10 projects
- `Post` table with 3 blog posts
- `MetricsHistory` table (empty initially)

## Step 6: Custom Domain Setup

### 6.1 Add Domain in Netlify

1. In Netlify dashboard: **Site settings → Domain management**
2. Click "Add custom domain"
3. Enter: `jamiewatters.work`
4. Click "Verify"
5. Netlify checks if you own the domain

### 6.2 Configure DNS

You have two options:

**Option A: Netlify DNS (Recommended - Easier)**

1. Follow Netlify's instructions to change nameservers at your registrar
2. Point nameservers to Netlify's:
   - `dns1.p0X.nsone.net`
   - `dns2.p0X.nsone.net`
   - `dns3.p0X.nsone.net`
   - `dns4.p0X.nsone.net`
3. Wait for DNS propagation (~5 minutes to 24 hours)

**Option B: External DNS (Use existing DNS provider)**

Add these DNS records at your registrar:

| Type  | Name | Value                        | TTL  |
|-------|------|------------------------------|------|
| CNAME | www  | random-name-12345.netlify.app | 3600 |
| A     | @    | 75.2.60.5                    | 3600 |

*(Replace `random-name-12345.netlify.app` with your actual Netlify URL)*

### 6.3 Enable HTTPS

1. In Netlify: **Site settings → Domain management → HTTPS**
2. Click "Verify DNS configuration"
3. Once verified, click "Provision certificate"
4. Wait ~1 minute for Let's Encrypt certificate
5. Enable "Force HTTPS" (redirect HTTP to HTTPS)

### 6.4 Verify Custom Domain

1. Open https://jamiewatters.work in browser
2. Verify SSL certificate (lock icon in address bar)
3. Test all pages:
   - [ ] Home page
   - [ ] Portfolio listing
   - [ ] Individual projects
   - [ ] Blog listing
   - [ ] Individual posts
   - [ ] About page
   - [ ] Admin login

## Step 7: Configure Branch Deploys (Optional)

Enable automatic deploys for every branch push.

### 7.1 Branch Deploy Settings

1. **Site settings → Build & deploy → Deploy contexts**
2. Configure:
   - **Production branch**: `main`
   - **Branch deploys**: All (or select specific branches)
   - **Deploy previews**: Pull requests

### 7.2 Preview Deployments

Every pull request gets a unique URL for testing:
- Format: `https://deploy-preview-123--random-name.netlify.app`
- Allows testing changes before merging to main
- Perfect for design reviews and QA

### 7.3 Branch Databases (Neon)

For complete isolation, create branch databases:

1. In Neon dashboard: **Branches → Create branch**
2. Name: `preview` or `development`
3. Update Netlify environment variables:
   - Add `DATABASE_URL` for "Deploy Preview" context
   - Use the branch database connection string

## Step 8: Post-Deployment Verification

After everything is set up, verify the full stack:

### 8.1 Site Functionality
- [ ] All pages load without errors
- [ ] Navigation works across all pages
- [ ] Images load (even if placeholders)
- [ ] Links don't break (no 404s)

### 8.2 Admin Dashboard
- [ ] Login page loads
- [ ] Correct password authenticates
- [ ] Project selector shows all 10 projects
- [ ] Metrics update form works
- [ ] Save button updates data
- [ ] Logout returns to login

### 8.3 Database Persistence
- [ ] Update a project's MRR in admin
- [ ] Reload page - change persists
- [ ] View portfolio page - updated metric shows
- [ ] Check Neon dashboard - `MetricsHistory` table has new entry

### 8.4 Performance
- [ ] Run Lighthouse audit on https://jamiewatters.work
- [ ] Performance > 90
- [ ] Accessibility > 90
- [ ] Best Practices > 90
- [ ] SEO > 95

### 8.5 Security
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers present (check DevTools → Network)
- [ ] Admin password not visible in source code
- [ ] Environment variables not exposed in client

## Step 9: Monitoring & Maintenance

### 9.1 Netlify Analytics (Optional)

1. **Site settings → Analytics**
2. Enable server-side analytics ($9/month)
3. Track: Page views, top pages, traffic sources

### 9.2 Uptime Monitoring

Free options:
- **UptimeRobot**: https://uptimerobot.com (free tier: 50 monitors)
- **Pingdom**: https://pingdom.com (free tier available)
- **StatusCake**: https://statuscake.com (free tier available)

Monitor:
- `https://jamiewatters.work` (200 status)
- Check every 5 minutes
- Alert via email if down

### 9.3 Error Tracking (Optional)

1. **Sentry** (free tier: 5K events/month)
   - Tracks JavaScript errors
   - Server-side errors
   - Performance monitoring

2. **LogRocket** (free tier: 1K sessions/month)
   - Session replay
   - Error tracking
   - Performance monitoring

## Step 10: Continuous Deployment

Now that everything is set up, your workflow is:

```bash
# Make changes locally
git checkout -b feature/new-feature

# Test changes
cd website
npm run dev
# Verify in browser: http://localhost:3000

# Commit changes
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
# Netlify automatically creates deploy preview

# Review deploy preview URL (in PR checks)
# https://deploy-preview-X--yoursite.netlify.app

# Merge PR when ready
# Netlify automatically deploys to production
# https://jamiewatters.work updates in ~2 minutes
```

## Troubleshooting

### Site Not Loading After Deploy

1. **Check build logs** in Netlify dashboard
2. **Verify environment variables** (typos, missing values)
3. **Test locally**: `npm run build && npm start`
4. **Check DNS** with: `dig jamiewatters.work` or `nslookup jamiewatters.work`

### Database Connection Errors

1. **Verify DATABASE_URL** format: `postgresql://user:password@host/database`
2. **Check Neon dashboard** - database running?
3. **Test connection** locally:
   ```bash
   export DATABASE_URL="your-connection-string"
   npx prisma db push
   ```
4. **Verify SSL mode**: Neon requires `?sslmode=require` in connection string

### Admin Login Not Working

1. **Verify password hash** in environment variables
2. **Test hash generation**:
   ```bash
   node -e "console.log(require('bcrypt').compareSync('your-password', '$2b$12$...'))"
   ```
   Should return `true`
3. **Check browser console** for API errors
4. **Verify API route**: `curl -X POST https://jamiewatters.work/api/auth -d '{"password":"test"}'`

### ISR Not Revalidating

1. **Check revalidate config** in page files: `export const revalidate = 3600`
2. **Verify Netlify plugin**: `@netlify/plugin-nextjs` installed
3. **Force revalidation** via API: `/api/revalidate` endpoint (if implemented)

### Images Not Loading

1. **Verify image paths** in `public/images/`
2. **Check Next.js image config** in `next.config.js`
3. **Test image URL** directly: `https://jamiewatters.work/images/test.png`
4. **Check Netlify logs** for 404s

## Production Checklist

Before announcing launch:

- [ ] Custom domain working (jamiewatters.work)
- [ ] HTTPS enabled and forced
- [ ] All pages load without errors
- [ ] Admin dashboard functional
- [ ] Database connected and migrations run
- [ ] Lighthouse scores > 90 (all categories)
- [ ] Tested on mobile devices
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Social media preview working (Open Graph image)
- [ ] Favicon visible in browser tab
- [ ] 404 page displays correctly
- [ ] robots.txt allows indexing
- [ ] Google Search Console configured
- [ ] Analytics tracking (if using)
- [ ] Uptime monitoring configured
- [ ] Backup strategy for database (Neon's built-in backups)

## Next Steps

After successful deployment:

1. **Submit sitemap to Google Search Console**
   - Generate sitemap: `/sitemap.xml`
   - Add in Search Console

2. **Share on social media**
   - Verify Open Graph preview looks good
   - Share on Twitter, LinkedIn

3. **Monitor first week**
   - Check uptime daily
   - Review Netlify analytics
   - Fix any bugs reported

4. **Plan v2 features**
   - User feedback
   - Additional projects
   - Blog automation
   - RSS feed

---

**Deployment complete! 🚀**

Your site is now live at https://jamiewatters.work

For support:
- Netlify Docs: https://docs.netlify.com
- Neon Docs: https://neon.tech/docs
- Next.js Docs: https://nextjs.org/docs
