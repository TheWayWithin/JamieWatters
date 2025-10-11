# Database Setup - Step by Step Guide

## What We're Doing
Your website currently shows placeholder data. We need to connect it to a real database so your content persists and you can update it through the admin panel.

## Before Starting
- You already have a Neon account ✓
- Your code is ready to connect to a database ✓
- This will take about 15 minutes total

---

## Step 1: Create a New Database Project in Neon

### What This Does
Creates a new PostgreSQL database that your website will use to store projects and blog posts.

### Steps
1. **Go to Neon Console**: Open https://console.neon.tech in your browser
2. **Create New Project**: Click the "New Project" button (usually green/blue button)
3. **Name Your Project**: 
   - Project name: `jamiewatters-website`
   - Region: Leave as default (usually US East)
   - PostgreSQL version: Leave as default (16)
4. **Click "Create Project"** - Wait 30 seconds for it to initialize

### What You'll See
- A dashboard showing your new database
- Connection details (we need these next)

---

## Step 2: Get Your Database Connection String

### What This Does
Gets the special URL that tells your website how to connect to your new database.

### Steps
1. **In your new project dashboard**, look for "Connection string" or "Connect"
2. **Select "Prisma" tab** (not psql or other options)
3. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@host/database?sslmode=require
   ```
4. **Keep this tab open** - you'll need this string in the next step

---

## Step 3: Update Your Local Environment File

### What This Does
Tells your local website where to find your database.

### Steps
1. **Open your project in VS Code** (or your code editor)
2. **Find the file `.env.local`** in the root folder
3. **Look for this line**:
   ```
   DATABASE_URL="your-database-url-here"
   ```
4. **Replace everything between the quotes** with your connection string from Step 2:
   ```
   DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
   ```
5. **Save the file** (Cmd+S or Ctrl+S)

### Check Your Work
The line should look something like:
```
DATABASE_URL="postgresql://alex_123:abc123xyz@ep-cool-bird-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## Step 4: Create Database Tables

### What This Does
Sets up the empty tables where your projects and blog posts will be stored.

### Steps
1. **Open Terminal** in VS Code (Terminal → New Terminal)
2. **Make sure you're in the right folder**:
   ```bash
   cd /Users/jamiewatters/DevProjects/JamieWatters/website
   ```
3. **Run this command**:
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Wait for success message** - should say "Migration applied" or similar

### What You'll See
- Some output about creating tables
- Maybe some warnings (that's normal)
- Should end with "✓" or "Done"

---

## Step 5: Add Your Content to the Database

### What This Does
Copies all your current projects and blog posts from placeholder files into the real database.

### Steps
1. **In the same terminal**, run:
   ```bash
   npm run prisma:seed
   ```
2. **Wait for completion** - should take 10-30 seconds

### What You'll See
- Messages about creating projects and posts
- Should end with "Seeded database successfully"

---

## Step 6: Test It Works

### What This Does
Verifies your website can now read from the database instead of placeholder files.

### Steps
1. **Start your development server**:
   ```bash
   npm run dev
   ```
2. **Open your website**: http://localhost:3000
3. **Check these pages work**:
   - Home page shows your projects
   - Portfolio page (/portfolio) shows all projects
   - Journey page (/journey) shows blog posts
   - Individual project pages (click any project)

### Success Indicators
- All your content appears normally
- No error messages in browser console
- Pages load without "placeholder" in URLs

---

## If Something Goes Wrong

### Common Issues

**"Connection refused" or database error**:
- Double-check your DATABASE_URL in .env.local
- Make sure you copied the full connection string from Neon

**"Command not found: npx"**:
- Make sure Node.js is installed
- Try `npm run prisma:migrate` instead

**"Migration failed"**:
- Check your internet connection
- Try running the command again

### Get Help
If stuck, share the exact error message - I can help debug the specific issue.

---

## What Happens Next

Once this works:
- Your admin panel will save changes to the database
- You can add new projects through the admin interface  
- Your content persists between deployments
- Ready for production deployment