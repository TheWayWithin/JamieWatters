# JamieWatters.work - Page Mockup Specifications

**Version:** 1.0
**Date:** 2025-10-08
**Status:** Ready for Development
**Design System:** See design-system.md for component specs

---

## Overview

This document provides detailed text-based layout specifications for all 7 pages of JamieWatters.work. Each page includes desktop and mobile layouts, component placement, content hierarchy, and interaction patterns.

**Pages Documented:**
1. Home Page
2. Portfolio Listing Page
3. Individual Project Page
4. Blog Listing Page ("The Journey")
5. Individual Blog Post Page
6. About Page
7. Admin Dashboard (Protected)

**Design Principles Applied:**
- Mobile-first responsive design
- Dark theme (Deep Space #0F172A background)
- Brand colors (Visionary Purple, Execution Blue, Proof Gold)
- Performance-optimized (< 1MB page weight, < 2s load)
- WCAG AA accessible

---

## 1. Home Page

### Purpose
First impression, value proposition, portfolio snapshot, recent updates, CTA to explore further.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky)                                             │
│ [Logo]  Home  Portfolio  The Journey  About     [Contact]   │
│ 64px height, Deep Space bg, subtle bottom border           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ HERO SECTION (Full viewport height - 90vh)                  │
│                                                             │
│   Building $1B Solo by 2030                                 │
│   (Inter Bold 56px, Visionary Purple)                       │
│                                                             │
│   AI-powered solopreneur building 10+ products              │
│   simultaneously. Follow the journey from zero to           │
│   billion in public.                                        │
│   (Inter Regular 24px, Cloud color, max-width 600px)       │
│                                                             │
│   [View Portfolio] [Follow Journey]                         │
│   (Primary button: Visionary Purple, Secondary: Ghost)     │
│                                                             │
│   Subtle geometric background pattern (opacity 5%)         │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ METRICS DASHBOARD SECTION                                   │
│                                                             │
│   Current Progress                                          │
│   (Inter Semibold 40px, Cloud)                             │
│                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   │  $12.5K  │ │  8,420   │ │    10    │ │   +42%   │     │
│   │   MRR    │ │  Users   │ │ Projects │ │  Growth  │     │
│   │  (Proof  │ │          │ │          │ │          │     │
│   │   Gold)  │ │          │ │          │ │          │     │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│   (4 cards, 24px gap, surface bg, 8px radius)              │
│                                                             │
│   Last updated: October 5, 2025                             │
│   (Caption text, tertiary color)                            │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FEATURED PROJECTS SECTION                                   │
│                                                             │
│   Featured Projects                                         │
│   (Inter Semibold 40px, Cloud)                             │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ [Screenshot]│ │ [Screenshot]│ │ [Screenshot]│         │
│   │             │ │             │ │             │         │
│   │ AimpactScanner│ SoloMarket  │ AGENT-11    │         │
│   │ (H3 24px)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ AI-powered  │ │ Marketplace │ │ Claude Code │         │
│   │ ESG...      │ │ for solo... │ │ framework...│         │
│   │ (Body 16px) │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ $4.2K MRR   │ │ $3.8K MRR   │ │ $2.1K MRR   │         │
│   │ 2.8K users  │ │ 1.2K users  │ │ 850 users   │         │
│   │ (Proof Gold)│ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ [React] [AI]│ │ [Next.js]   │ │ [AI] [Dev]  │         │
│   │ [Postgres]  │ │ [Stripe]    │ │ [Framework] │         │
│   │ (Badges)    │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ [View Case] │ │ [View Case] │ │ [View Case] │         │
│   │ [Live Site]→│ │ [Live Site]→│ │ [Live Site]→│         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│   (3 columns, 24px gap, surface bg cards)                  │
│                                                             │
│   [View All Projects →]                                     │
│   (Tertiary button, Execution Blue)                        │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ RECENT BLOG POSTS SECTION                                   │
│                                                             │
│   Latest from The Journey                                   │
│   (Inter Semibold 40px, Cloud)                             │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Week 42: AI │ │ Metrics...  │ │ Building... │         │
│   │ Breakthrough│ │             │ │             │         │
│   │ (H4 20px)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ This week I │ │ Finally hit │ │ Three new   │         │
│   │ discovered  │ │ $10K MRR... │ │ projects... │         │
│   │ a new...    │ │             │ │             │         │
│   │ (Excerpt)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ Oct 7, 2025 │ │ Oct 4, 2025 │ │ Sep 30,2025 │         │
│   │ 5 min read  │ │ 7 min read  │ │ 6 min read  │         │
│   │ (Caption)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ [Read More] │ │ [Read More] │ │ [Read More] │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│   (3 columns, 24px gap, flat cards)                        │
│                                                             │
│   [View All Posts →]                                        │
│   (Tertiary button, Execution Blue)                        │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ ABOUT PREVIEW / CTA SECTION                                 │
│                                                             │
│   Who is Jamie Watters?                                     │
│   (Inter Semibold 32px, Cloud)                             │
│                                                             │
│   Solo entrepreneur on a mission to build a billion-dollar │
│   portfolio by 2030 using AI agents. Former corporate      │
│   strategist turned solopreneur, now building in public.   │
│   (Body 18px, Cloud, max-width 700px, centered)            │
│                                                             │
│   [Learn More About My Journey →]                           │
│   (Secondary button, Visionary Purple border)              │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER                                                      │
│ [Logo White]            Quick Links         Connect         │
│ Building $1B            • Home              [Twitter]       │
│ Solo by 2030            • Portfolio         [LinkedIn]      │
│                         • Journey           [GitHub]        │
│                         • About             [Email]         │
│                                                             │
│ © 2025 Jamie Watters. All rights reserved.                 │
│ (64px padding vertical, subtle top border)                 │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
│ [Logo]         [Menu ☰] │
│ 56px height             │
└─────────────────────────┘

┌─────────────────────────┐
│ HERO SECTION            │
│                         │
│ Building $1B Solo       │
│ by 2030                 │
│ (Bold 40px, Purple)     │
│                         │
│ AI-powered solo...      │
│ Follow the journey...   │
│ (Body 16px, max-width   │
│ 90%)                    │
│                         │
│ [View Portfolio]        │
│ [Follow Journey]        │
│ (Stacked buttons)       │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ METRICS DASHBOARD       │
│                         │
│ Current Progress        │
│ (H2 32px)               │
│                         │
│ ┌─────────┐ ┌─────────┐│
│ │ $12.5K  │ │ 8,420   ││
│ │  MRR    │ │ Users   ││
│ └─────────┘ └─────────┘│
│ ┌─────────┐ ┌─────────┐│
│ │   10    │ │  +42%   ││
│ │Projects │ │ Growth  ││
│ └─────────┘ └─────────┘│
│ (2x2 grid, 16px gap)    │
│                         │
│ Last updated: Oct 5     │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ FEATURED PROJECTS       │
│                         │
│ Featured Projects       │
│ (H2 32px)               │
│                         │
│ ┌─────────────────────┐ │
│ │ [Screenshot]        │ │
│ │ AimpactScanner      │ │
│ │ AI-powered ESG...   │ │
│ │ $4.2K MRR, 2.8K...  │ │
│ │ [Badges]            │ │
│ │ [View] [Live →]     │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ SoloMarket          │ │
│ │ (Card 2)            │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ AGENT-11            │ │
│ │ (Card 3)            │ │
│ └─────────────────────┘ │
│ (Stacked, single col)   │
│                         │
│ [View All Projects →]   │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ RECENT BLOG POSTS       │
│                         │
│ Latest from Journey     │
│ (H2 32px)               │
│                         │
│ ┌─────────────────────┐ │
│ │ Week 42: AI Break   │ │
│ │ This week...        │ │
│ │ Oct 7 • 5 min       │ │
│ │ [Read More]         │ │
│ └─────────────────────┘ │
│ (3 stacked cards)       │
│                         │
│ [View All Posts →]      │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ ABOUT PREVIEW           │
│                         │
│ Who is Jamie?           │
│ (H3 24px)               │
│                         │
│ Solo entrepreneur...    │
│ (Body 16px)             │
│                         │
│ [Learn More →]          │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
│ [Logo White]            │
│                         │
│ Quick Links             │
│ • Home                  │
│ • Portfolio             │
│ • Journey               │
│ • About                 │
│                         │
│ Connect                 │
│ [Twitter] [LinkedIn]    │
│ [GitHub] [Email]        │
│                         │
│ © 2025 Jamie Watters    │
└─────────────────────────┘
```

### Interaction Specifications

**Hero CTA Buttons:**
- Primary button: Visionary Purple background, scales on hover (1.02), 200ms transition
- Secondary button: Ghost with purple border, background tint on hover

**Metric Cards:**
- Static (no hover effect)
- Large numbers in Proof Gold (#F59E0B)
- Labels in secondary text color

**Project Cards:**
- Hover: Scale 1.02, shadow-lg, 300ms ease-out
- Click on card: Navigate to project detail page
- "Live Site" button: External link icon, opens new tab

**Blog Post Cards:**
- Hover: Title underlines, subtle scale 1.01
- Click: Navigate to blog post page

---

## 2. Portfolio Listing Page

### Purpose
Browse all 10 projects, filter by category, assess portfolio diversity.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky) - Same as home page                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                 │
│                                                             │
│   Portfolio                                                 │
│   (Inter Bold 56px, Visionary Purple)                       │
│                                                             │
│   10 AI-powered products built as a solo operator.          │
│   From idea to execution, all tracked in public.            │
│   (Body 18px, secondary color, max-width 600px)            │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ AGGREGATE METRICS BAR                                       │
│                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   │ $12.5K   │ │  8,420   │ │    10    │ │ Last Upd │     │
│   │ Total MRR│ │  Users   │ │ Projects │ │ Oct 5    │     │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│   (Horizontal metrics strip, smaller cards than home)      │
└─────────────────────────────────────────────────────────────┘
            ↓ 48px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ CATEGORY FILTER (Optional for MVP - can defer)             │
│                                                             │
│   [All] [AI Tools] [Frameworks] [Education] [Marketplace]  │
│   (Badge-style buttons, purple = active, ghost = inactive) │
└─────────────────────────────────────────────────────────────┘
            ↓ 32px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ PROJECT GRID (All 10 projects)                              │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Project 1   │ │ Project 2   │ │ Project 3   │         │
│   │ (Same card  │ │ (Same card  │ │ (Same card  │         │
│   │  as home    │ │  as home    │ │  as home    │         │
│   │  featured)  │ │  featured)  │ │  featured)  │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Project 4   │ │ Project 5   │ │ Project 6   │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Project 7   │ │ Project 8   │ │ Project 9   │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│   ┌─────────────┐                                          │
│   │ Project 10  │                                          │
│   └─────────────┘                                          │
│   (3 columns, 24px gap, responsive)                        │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Same as home page                                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
└─────────────────────────┘

┌─────────────────────────┐
│ PAGE HEADER             │
│                         │
│ Portfolio               │
│ (Bold 40px, Purple)     │
│                         │
│ 10 AI-powered...        │
│ (Body 16px)             │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ METRICS BAR             │
│ ┌─────────┐ ┌─────────┐│
│ │ $12.5K  │ │ 8,420   ││
│ │ MRR     │ │ Users   ││
│ └─────────┘ └─────────┘│
│ (2 columns, compact)    │
└─────────────────────────┘
       ↓ 32px ↓

┌─────────────────────────┐
│ CATEGORY FILTER         │
│ (Horizontal scroll)     │
│ [All] [AI] [Framework]→ │
└─────────────────────────┘
       ↓ 24px ↓

┌─────────────────────────┐
│ PROJECT GRID            │
│                         │
│ ┌─────────────────────┐ │
│ │ Project 1           │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Project 2           │ │
│ └─────────────────────┘ │
│ (Single column stacked) │
│ [... 8 more projects]   │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Category Filter:**
- Active category: Visionary Purple background, white text
- Inactive: Ghost button with purple text
- Click: Filter projects by category, smooth fade transition

**Project Cards:**
- Same hover effects as home page
- Sort order: Featured first, then by MRR descending

---

## 3. Individual Project Page

### Purpose
Detailed case study for each project with metrics, tech stack, problem/solution, lessons learned.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky) - Same as all pages                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PROJECT HEADER                                              │
│                                                             │
│   AimpactScanner                                            │
│   (Inter Bold 56px, Visionary Purple)                       │
│                                                             │
│   AI-powered ESG compliance scanner for financial           │
│   institutions. Automated report generation with 95%        │
│   accuracy.                                                 │
│   (Body 18px, secondary color, max-width 700px)            │
│                                                             │
│   [Visit Live Site →]  [GitHub →]                           │
│   (Primary button + secondary button, 16px gap)            │
│                                                             │
│   Launched: March 2024 • Status: [Active]                   │
│   (Caption, green badge for active)                         │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ METRICS DISPLAY                                             │
│                                                             │
│   Current Metrics                                           │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│   │   $4,200     │ │    2,840     │ │   Active     │       │
│   │   Monthly    │ │    Active    │ │   Status     │       │
│   │   Recurring  │ │    Users     │ │              │       │
│   │   Revenue    │ │              │ │   [Badge]    │       │
│   │   (Proof     │ │              │ │              │       │
│   │    Gold)     │ │              │ │              │       │
│   └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                             │
│   Last updated: October 5, 2025                             │
│   (Caption, tertiary color)                                 │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ TECH STACK SECTION                                          │
│                                                             │
│   Technology Stack                                          │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   [React]  [Next.js]  [TypeScript]  [Tailwind CSS]         │
│   [Node.js]  [Postgres]  [OpenAI API]  [Vercel]            │
│   (Color-coded badges - blue frontend, purple backend...)  │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ HERO SCREENSHOT                                             │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │                                                       │ │
│   │   [Project Screenshot - Full width, 16:9 ratio]      │ │
│   │   (1200px max width, WebP format, lazy loaded)       │ │
│   │                                                       │ │
│   └───────────────────────────────────────────────────────┘ │
│   Caption: AimpactScanner dashboard showing ESG metrics    │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ CASE STUDY CONTENT (Single column, max-width 800px)        │
│                                                             │
│   Problem Statement                                         │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   Financial institutions face increasing pressure to        │
│   comply with ESG regulations. Manual compliance audits     │
│   take weeks and cost $50K+ per report. Accuracy varies... │
│   (Body 18px, line-height 1.6, Cloud color)                │
│                                                             │
│   [Bullet points and paragraphs in markdown format]        │
│                                                             │
│            ↓ 48px spacing ↓                                 │
│                                                             │
│   Solution Approach                                         │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   Built an AI agent that ingests company documents,         │
│   analyzes against ESG frameworks, and generates            │
│   compliance reports in minutes instead of weeks...        │
│   (Body text with paragraphs, lists, emphasis)             │
│                                                             │
│            ↓ 48px spacing ↓                                 │
│                                                             │
│   Implementation Details                                    │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   Used GPT-4 for document analysis with custom prompt      │
│   engineering. Built vector database for regulation         │
│   lookup. Implemented streaming responses...               │
│                                                             │
│   [Code snippet with syntax highlighting - JetBrains Mono]  │
│   ```typescript                                            │
│   const analyzeDocument = async (doc: Document) => {       │
│     // Implementation                                      │
│   }                                                        │
│   ```                                                      │
│                                                             │
│            ↓ 48px spacing ↓                                 │
│                                                             │
│   Lessons Learned                                           │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   • Prompt engineering is 80% of the work                   │
│   • Vector databases are critical for accuracy              │
│   • Users want explainability over raw speed                │
│   (Bulleted list, body text)                                │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ RELATED PROJECTS SECTION                                    │
│                                                             │
│   More Projects                                             │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ SoloMarket  │ │ AGENT-11    │ │ Another...  │         │
│   │ (Related    │ │ (Related    │ │ (Related    │         │
│   │  project    │ │  project    │ │  project    │         │
│   │  card)      │ │  card)      │ │  card)      │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│   (3 project cards, same style as home page)               │
│                                                             │
│   [View All Projects →]                                     │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Same as all pages                                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
└─────────────────────────┘

┌─────────────────────────┐
│ PROJECT HEADER          │
│                         │
│ AimpactScanner          │
│ (Bold 40px, Purple)     │
│                         │
│ AI-powered ESG...       │
│ (Body 16px)             │
│                         │
│ [Visit Site →]          │
│ [GitHub →]              │
│ (Stacked buttons)       │
│                         │
│ Launched: Mar 2024      │
│ Status: [Active]        │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ METRICS DISPLAY         │
│                         │
│ Current Metrics         │
│ (H2 32px)               │
│                         │
│ ┌─────────┐ ┌─────────┐│
│ │ $4,200  │ │ 2,840   ││
│ │  MRR    │ │ Users   ││
│ └─────────┘ └─────────┘│
│ ┌─────────┐             │
│ │ Active  │             │
│ │ Status  │             │
│ └─────────┘             │
│                         │
│ Last updated: Oct 5     │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ TECH STACK              │
│                         │
│ Technology Stack        │
│ (H2 32px)               │
│                         │
│ [React] [Next.js]       │
│ [TypeScript] [Tailwind] │
│ [Node.js] [Postgres]    │
│ [OpenAI] [Vercel]       │
│ (Wrapped badges)        │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ SCREENSHOT              │
│ [Full-width image]      │
│ 16:9 ratio, responsive  │
│                         │
│ Caption text below      │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ CASE STUDY CONTENT      │
│ (Single column, 90%)    │
│                         │
│ Problem Statement       │
│ (H2 32px)               │
│                         │
│ Financial institutions  │
│ face increasing...      │
│ (Body 16px, 1.6 line)   │
│                         │
│ [Continue with all      │
│  sections: Solution,    │
│  Implementation,        │
│  Lessons Learned]       │
│                         │
│ Code blocks: Horizontal │
│ scroll if needed        │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ RELATED PROJECTS        │
│                         │
│ More Projects           │
│ (H2 32px)               │
│                         │
│ ┌─────────────────────┐ │
│ │ SoloMarket          │ │
│ │ (Card)              │ │
│ └─────────────────────┘ │
│ (Stacked, 2-3 projects) │
│                         │
│ [View All Projects →]   │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Live Site Button:**
- Primary button (Visionary Purple)
- External link icon (Lucide `ExternalLink`)
- Opens in new tab (`target="_blank" rel="noopener"`)

**Case Study Content:**
- Markdown rendered with `remark` + `rehype-highlight`
- Code blocks: JetBrains Mono, syntax highlighting, copy button
- Images: Lazy loaded, WebP format, responsive sizing

**Related Projects:**
- Hover effects same as homepage project cards
- Algorithm: Show 3 projects from same category or similar tech stack

---

## 4. Blog Listing Page ("The Journey")

### Purpose
Browse all blog posts reverse chronologically, understand build-in-public narrative.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky) - Same as all pages                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER                                                 │
│                                                             │
│   The Journey                                               │
│   (Inter Bold 56px, Visionary Purple)                       │
│                                                             │
│   Weekly updates on building a billion-dollar portfolio     │
│   as a solo operator. Wins, failures, lessons learned—all   │
│   shared transparently.                                     │
│   (Body 18px, secondary color, max-width 700px)            │
│                                                             │
│   [Subscribe via RSS →]                                     │
│   (Tertiary button, Execution Blue, RSS icon)              │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ BLOG POST GRID (Reverse chronological)                      │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Week 42:    │ │ Week 41:    │ │ Week 40:    │         │
│   │ AI Break-   │ │ Metrics...  │ │ Building... │         │
│   │ through     │ │             │ │             │         │
│   │ (H3 24px)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ This week I │ │ Finally hit │ │ Launched    │         │
│   │ discovered a│ │ $10K MRR    │ │ three new   │         │
│   │ breakthrough│ │ milestone.  │ │ projects in │         │
│   │ in prompt   │ │ Here's what │ │ one week... │         │
│   │ engineering │ │ changed and │ │             │         │
│   │ that...     │ │ what I...   │ │             │         │
│   │ (Excerpt    │ │             │ │             │         │
│   │  3-4 lines) │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ Oct 7, 2025 │ │ Oct 4, 2025 │ │ Sep 30,2025 │         │
│   │ 5 min read  │ │ 7 min read  │ │ 6 min read  │         │
│   │ (Caption)   │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ #AI #Growth │ │ #Milestone  │ │ #Build      │         │
│   │ (Small      │ │             │ │             │         │
│   │  badges)    │ │             │ │             │         │
│   │             │ │             │ │             │         │
│   │ [Read More] │ │ [Read More] │ │ [Read More] │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│   │ Post 4      │ │ Post 5      │ │ Post 6      │         │
│   └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                             │
│   (Continue for 10 posts per page)                         │
│   (3 columns, 32px gap between rows, 24px gap cols)        │
└─────────────────────────────────────────────────────────────┘
            ↓ 48px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ PAGINATION                                                  │
│                                                             │
│   [← Previous]        Page 1 of 5        [Next →]          │
│   (Tertiary buttons, centered, Execution Blue)             │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Same as all pages                                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
└─────────────────────────┘

┌─────────────────────────┐
│ PAGE HEADER             │
│                         │
│ The Journey             │
│ (Bold 40px, Purple)     │
│                         │
│ Weekly updates on...    │
│ (Body 16px)             │
│                         │
│ [Subscribe RSS →]       │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ BLOG POST LIST          │
│                         │
│ ┌─────────────────────┐ │
│ │ Week 42: AI Break   │ │
│ │ This week I...      │ │
│ │ Oct 7 • 5 min       │ │
│ │ #AI #Growth         │ │
│ │ [Read More]         │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Week 41: Metrics    │ │
│ │ (Post 2)            │ │
│ └─────────────────────┘ │
│                         │
│ (Stacked, single col)   │
│ [... 8 more posts]      │
└─────────────────────────┘
       ↓ 32px ↓

┌─────────────────────────┐
│ PAGINATION              │
│ [← Prev] Page 1 [Next →]│
│ (Stacked on very small) │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Post Cards:**
- Hover: Title underlines, slight scale 1.01, 200ms transition
- Click on card: Navigate to full post
- Tags: Not clickable in MVP (filtering deferred to v2)

**Pagination:**
- Previous/Next buttons: Tertiary style, Execution Blue
- Disabled state: Opacity 0.4, cursor not-allowed
- URL pattern: `/journey?page=2`

**RSS Link:**
- Icon: Lucide `Rss` icon
- Link to `/api/rss` endpoint

---

## 5. Individual Blog Post Page

### Purpose
Read full post with syntax highlighting, share socially, navigate to adjacent posts.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky) - Same as all pages                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ POST HEADER (Single column, max-width 800px, centered)     │
│                                                             │
│   Week 42: AI Breakthrough in Prompt Engineering            │
│   (Inter Bold 56px, Visionary Purple)                       │
│                                                             │
│   Published: October 7, 2025  •  5 min read                 │
│   (Caption, secondary color)                                │
│                                                             │
│   [#AI]  [#PromptEngineering]  [#BuildInPublic]            │
│   (Small tag badges, inline)                                │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ POST CONTENT (Single column, max-width 800px, centered)    │
│ (Markdown rendered with typography styles)                 │
│                                                             │
│   This week I made a significant breakthrough in how I      │
│   structure prompts for AI agents. After experimenting      │
│   with dozens of approaches, I discovered a pattern...      │
│   (Body 18px, line-height 1.6, Cloud color)                │
│                                                             │
│   ## The Problem                                            │
│   (H2 40px, Semibold, 48px margin-top, 24px margin-bottom) │
│                                                             │
│   Most AI responses were generic and lacked the specific... │
│   (Paragraphs with 1.6 line-height, 24px margin-bottom)    │
│                                                             │
│   - First key insight                                       │
│   - Second key insight                                      │
│   - Third key insight                                       │
│   (Bulleted lists, 16px left padding)                      │
│                                                             │
│   ### Sub-section Heading                                   │
│   (H3 32px, Semibold)                                       │
│                                                             │
│   Text with **bold emphasis** and *italic* for variety.    │
│                                                             │
│   > Blockquote for important callouts or quotes.           │
│   > Styled with subtle left border in Visionary Purple.    │
│   (Blockquote: italic, 16px left border, 24px left pad)    │
│                                                             │
│   ```typescript                                            │
│   // Code block with syntax highlighting                   │
│   const prompt = `You are an expert ${role}...`;           │
│   const response = await openai.complete(prompt);          │
│   ```                                                      │
│   (Code block: JetBrains Mono 14px, surface bg, 8px        │
│    radius, 16px padding, syntax highlighting via rehype)   │
│                                                             │
│   Here's an inline code snippet: `const x = 10;`           │
│   (Inline code: surface bg, 2px padding, 4px radius)       │
│                                                             │
│   [Continue with full post content...]                     │
│                                                             │
│   ## Conclusion                                             │
│                                                             │
│   This breakthrough reduced my prompt engineering time      │
│   by 60% and increased response quality significantly...   │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ SOCIAL SHARE SECTION (Centered)                            │
│                                                             │
│   Share this post                                           │
│   (H3 32px, Semibold, centered)                            │
│                                                             │
│   [Share on Twitter] [Share on LinkedIn] [Copy Link]       │
│   (Secondary buttons with icons, 16px gap, centered)       │
└─────────────────────────────────────────────────────────────┘
            ↓ 64px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ POST NAVIGATION (Max-width 800px, centered)                │
│                                                             │
│   ┌─────────────────────────┐ ┌─────────────────────────┐  │
│   │ ← Previous Post         │ │         Next Post →     │  │
│   │                         │ │                         │  │
│   │ Week 41: Hitting $10K   │ │ Week 43: Three New...   │  │
│   │ (H4 20px, Execution Blu)│ │                         │  │
│   │                         │ │                         │  │
│   │ Brief excerpt of prev   │ │ Brief excerpt of next   │  │
│   │ post for context...     │ │ post for context...     │  │
│   │ (Body-sm, 2 lines max)  │ │                         │  │
│   └─────────────────────────┘ └─────────────────────────┘  │
│   (2 columns, 24px gap, surface bg cards, hover effect)   │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Same as all pages                                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
└─────────────────────────┘

┌─────────────────────────┐
│ POST HEADER             │
│ (90% width, centered)   │
│                         │
│ Week 42: AI Break       │
│ through in Prompt...    │
│ (Bold 32px, Purple)     │
│                         │
│ Oct 7, 2025 • 5 min     │
│                         │
│ [#AI] [#Prompt]         │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ POST CONTENT            │
│ (90% width)             │
│                         │
│ This week I made...     │
│ (Body 16px, 1.6 line)   │
│                         │
│ ## The Problem          │
│ (H2 28px)               │
│                         │
│ Most AI responses...    │
│                         │
│ - Key insight           │
│ - Second insight        │
│                         │
│ > Blockquote styled     │
│ > with purple border    │
│                         │
│ ```typescript           │
│ const prompt = ...      │
│ ```                     │
│ (Horizontal scroll for  │
│  long code lines)       │
│                         │
│ [Full post content]     │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ SOCIAL SHARE            │
│                         │
│ Share this post         │
│ (H3 24px, centered)     │
│                         │
│ [Twitter] [LinkedIn]    │
│ [Copy Link]             │
│ (Stacked buttons, full) │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ POST NAVIGATION         │
│                         │
│ ┌─────────────────────┐ │
│ │ ← Previous          │ │
│ │ Week 41: $10K...    │ │
│ │ Brief excerpt...    │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Next →              │ │
│ │ Week 43: Three...   │ │
│ │ Brief excerpt...    │ │
│ └─────────────────────┘ │
│ (Stacked, single col)   │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Social Share Buttons:**
- Twitter: Opens share dialog with post title + URL
- LinkedIn: Opens share dialog with post URL
- Copy Link: Copies URL to clipboard, shows "Copied!" toast notification

**Markdown Rendering:**
- Syntax highlighting: `rehype-highlight` with dark theme
- Code block copy button: Appears on hover (desktop), always visible (mobile)
- Images: Full-width within content column, lazy loaded
- Links: Execution Blue, underline on hover, external links open new tab

**Post Navigation Cards:**
- Hover: Slight scale 1.01, shadow increases
- Click: Navigate to adjacent post
- Show "No previous/next post" if first/last

---

## 6. About Page

### Purpose
Personal story, vision, current focus, contact information, profile photo.

### Desktop Layout (1440px)

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Sticky) - Same as all pages                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PAGE HEADER (Centered, max-width 900px)                     │
│                                                             │
│   About Jamie                                               │
│   (Inter Bold 56px, Visionary Purple, centered)            │
│                                                             │
│   ┌─────────────────────────────────────────┐               │
│   │                                         │               │
│   │      [Profile Photo 400x400px]          │               │
│   │      Square with 8px radius or          │               │
│   │      circular with 50% radius           │               │
│   │      Optional: 4px Visionary Purple     │               │
│   │      border for accent                  │               │
│   │                                         │               │
│   └─────────────────────────────────────────┘               │
│   (Centered, 48px margin-bottom)                            │
└─────────────────────────────────────────────────────────────┘
            ↓ 48px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ CONTENT SECTIONS (Single column, max-width 800px, centered)│
│                                                             │
│   Background                                                │
│   (H2 40px, Semibold, left-aligned)                        │
│                                                             │
│   I'm Jamie Watters, a solo entrepreneur on a mission to   │
│   build a billion-dollar portfolio by 2030 using AI agents.│
│   Before going solo, I spent 15 years in corporate strategy│
│   consulting, helping Fortune 500 companies transform...   │
│   (Body 18px, line-height 1.6, Cloud color)                │
│                                                             │
│   In 2023, I left my six-figure job to pursue the most     │
│   ambitious bet of my life: proving that one person armed  │
│   with AI can build and operate multiple profitable        │
│   businesses simultaneously. No team. No employees. Just   │
│   me and intelligent agents working 24/7.                  │
│   (Multiple paragraphs, 24px margin-bottom each)           │
│                                                             │
│            ↓ 64px spacing ↓                                 │
│                                                             │
│   Vision                                                    │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   My goal is simple but audacious: reach $1 billion in     │
│   portfolio value by 2030. Not through a single unicorn    │
│   startup, but through a diversified portfolio of 10-20    │
│   AI-powered businesses, each generating $5-50M ARR.       │
│   (Body text, multiple paragraphs)                          │
│                                                             │
│   This isn't just about the money. It's about proving a    │
│   new model of entrepreneurship is possible. We're at the  │
│   dawn of the AI era, and I believe the future belongs to  │
│   solo operators who can orchestrate intelligent systems.  │
│                                                             │
│            ↓ 64px spacing ↓                                 │
│                                                             │
│   Current Focus                                             │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   Right now, I'm actively building and operating 10         │
│   products across four categories:                          │
│   (Body text)                                               │
│                                                             │
│   • **AI Tools:** Automated workflows for businesses       │
│   • **Frameworks:** Developer tools and open-source        │
│   • **Education:** Courses and content for builders        │
│   • **Marketplaces:** Platforms connecting buyers/sellers  │
│   (Bulleted list with bold category names)                 │
│                                                             │
│   Each project is instrumented with real-time metrics, and  │
│   I share progress transparently through weekly updates.    │
│   Every win, every failure, every lesson learned—all       │
│   documented publicly.                                      │
│                                                             │
│            ↓ 64px spacing ↓                                 │
│                                                             │
│   Why Build in Public?                                      │
│   (H2 40px, Semibold)                                       │
│                                                             │
│   Building in public holds me accountable and creates a     │
│   feedback loop with the community. Transparency isn't just│
│   a marketing strategy—it's core to how I learn and        │
│   improve. Sharing both successes and struggles attracts   │
│   the right people and opportunities.                       │
│   (Body text, multiple paragraphs)                          │
│                                                             │
│   Plus, I want to inspire other builders. If I can show    │
│   the playbook—the tools, strategies, and mindset required │
│   to build at scale as a solo operator—then others can     │
│   replicate and surpass what I'm doing.                     │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ CONTACT SECTION (Centered card, max-width 600px)           │
│                                                             │
│   Get in Touch                                              │
│   (H2 40px, Semibold, centered)                            │
│                                                             │
│   Interested in collaborating, have questions, or just     │
│   want to say hi? I'd love to hear from you.               │
│   (Body 18px, centered)                                     │
│                                                             │
│   📧 Email: jamie@jamiewatters.work                         │
│   (Body 18px, Execution Blue, clickable)                   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Social Media                                        │   │
│   │                                                     │   │
│   │ [Twitter/X]  [LinkedIn]  [GitHub]                  │   │
│   │ (Large icon buttons, 48px size, Visionary Purple)  │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   [Follow My Journey →]                                     │
│   (Primary button, Visionary Purple, link to blog)         │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Same as all pages                                  │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (Sticky)         │
└─────────────────────────┘

┌─────────────────────────┐
│ PAGE HEADER             │
│                         │
│ About Jamie             │
│ (Bold 40px, Purple)     │
│                         │
│ ┌───────────────────┐   │
│ │                   │   │
│ │ [Profile Photo]   │   │
│ │ 300x300px         │   │
│ │ (Responsive)      │   │
│ │                   │   │
│ └───────────────────┘   │
│ (Centered, 32px margin) │
└─────────────────────────┘
       ↓ 32px ↓

┌─────────────────────────┐
│ CONTENT SECTIONS        │
│ (90% width, centered)   │
│                         │
│ Background              │
│ (H2 32px, Semibold)     │
│                         │
│ I'm Jamie Watters, a    │
│ solo entrepreneur...    │
│ (Body 16px, 1.6 line)   │
│                         │
│ [Multiple paragraphs]   │
│                         │
│      ↓ 48px ↓           │
│                         │
│ Vision                  │
│ (H2 32px)               │
│                         │
│ My goal is simple...    │
│ (Body text)             │
│                         │
│      ↓ 48px ↓           │
│                         │
│ Current Focus           │
│ (H2 32px)               │
│                         │
│ Right now, I'm...       │
│                         │
│ • AI Tools: Auto...     │
│ • Frameworks: Dev...    │
│ • Education: Cou...     │
│ • Marketplaces: Pla...  │
│                         │
│      ↓ 48px ↓           │
│                         │
│ Why Build in Public?    │
│ (H2 32px)               │
│                         │
│ Building in public...   │
│ (Body text)             │
└─────────────────────────┘
       ↓ 64px ↓

┌─────────────────────────┐
│ CONTACT SECTION         │
│ (Card, 90% width)       │
│                         │
│ Get in Touch            │
│ (H2 32px, centered)     │
│                         │
│ Interested in...        │
│ (Body 16px, centered)   │
│                         │
│ 📧 jamie@jamiewatt...   │
│ (Clickable email)       │
│                         │
│ Social Media            │
│ [Twitter] [LinkedIn]    │
│ [GitHub]                │
│ (Large icons, stacked)  │
│                         │
│ [Follow Journey →]      │
│ (Primary button, full)  │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Profile Photo:**
- Hover: Subtle scale 1.03, 300ms transition (desktop only)
- Alt text: "Jamie Watters smiling at South Street Seaport"
- Optimization: WebP format, 400px max width, 85% quality

**Email Link:**
- Color: Execution Blue
- Hover: Underline, slight color shift
- Click: Opens default email client (`mailto:jamie@jamiewatters.work`)

**Social Media Icons:**
- Size: 48px (desktop), 40px (mobile)
- Color: Visionary Purple with subtle hover effect (lighter tint)
- Click: Opens profile in new tab

---

## 7. Admin Dashboard (Protected Page)

### Purpose
Simple password-protected form for Jamie to update project metrics weekly.

### Desktop Layout (1440px)

**UNAUTHENTICATED STATE:**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (No navigation, logo only)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGIN FORM (Centered card, max-width 400px)                 │
│                                                             │
│   Admin Access                                              │
│   (H2 40px, Semibold, centered)                            │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ Password                                              │ │
│   │ ┌─────────────────────────────────────────────────┐   │ │
│   │ │ [Password Input Field]                          │   │ │
│   │ │ type="password", autofocus                      │   │ │
│   │ └─────────────────────────────────────────────────┘   │ │
│   │ (Input: surface bg, 12px padding, 6px radius)         │ │
│   │                                                       │ │
│   │ [Login Button]                                        │ │
│   │ (Primary button, full-width, Visionary Purple)        │ │
│   │                                                       │ │
│   │ [Error Message: "Invalid password"]                  │ │
│   │ (Error Red, 14px, only shown on failed login)         │ │
│   └───────────────────────────────────────────────────────┘ │
│   (Card: surface bg, 32px padding, 8px radius)             │
└─────────────────────────────────────────────────────────────┘
```

**AUTHENTICATED STATE:**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [Logo]  Admin Dashboard                  [Logout]          │
│ (Logout button: tertiary style, Execution Blue)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD HEADER                                            │
│                                                             │
│   Admin Dashboard                                           │
│   (H1 56px, Bold, Visionary Purple)                        │
│                                                             │
│   Update project metrics. Changes go live immediately.      │
│   (Body 18px, secondary color)                             │
└─────────────────────────────────────────────────────────────┘
            ↓ 48px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ PROJECT SELECTOR (Dropdown, max-width 400px)               │
│                                                             │
│   Select Project                                            │
│   (Label, 14px, Medium)                                     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ AimpactScanner ▼                                    │   │
│   │ (Dropdown: All 10 projects)                         │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            ↓ 32px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ CURRENT METRICS DISPLAY                                     │
│                                                             │
│   Current Metrics for AimpactScanner                        │
│   (H2 32px, Semibold)                                       │
│                                                             │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│   │   $4,200     │ │    2,840     │ │   Active     │       │
│   │   MRR        │ │    Users     │ │   Status     │       │
│   └──────────────┘ └──────────────┘ └──────────────┘       │
│   (Read-only display, Proof Gold for numbers)              │
│                                                             │
│   Last updated: October 5, 2025 at 10:32 AM                │
│   (Caption, tertiary color)                                 │
└─────────────────────────────────────────────────────────────┘
            ↓ 32px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ UPDATE FORM (Max-width 600px)                               │
│                                                             │
│   Update Metrics                                            │
│   (H2 32px, Semibold)                                       │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ Monthly Recurring Revenue (MRR)                       │ │
│   │ ┌─────────────────────────────────────────────────┐   │ │
│   │ │ $ [4200]                                        │   │ │
│   │ │ type="number", step="0.01"                      │   │ │
│   │ └─────────────────────────────────────────────────┘   │ │
│   │ (Number input, $ prefix visible)                      │ │
│   │                                                       │ │
│   │ Active Users                                          │ │
│   │ ┌─────────────────────────────────────────────────┐   │ │
│   │ │ [2840]                                          │   │ │
│   │ │ type="number", step="1"                         │   │ │
│   │ └─────────────────────────────────────────────────┘   │ │
│   │                                                       │ │
│   │ Project Status                                        │ │
│   │ ┌─────────────────────────────────────────────────┐   │ │
│   │ │ Active ▼                                        │   │ │
│   │ │ (Dropdown: Active, Beta, Planning, Archived)    │   │ │
│   │ └─────────────────────────────────────────────────┘   │ │
│   │                                                       │ │
│   │ [Save Changes]                                        │ │
│   │ (Primary button, full-width, Visionary Purple)        │ │
│   │                                                       │ │
│   │ [Success Message: "Metrics updated successfully!"]    │ │
│   │ (Success Green, 14px, only shown after save)          │ │
│   │                                                       │ │
│   │ [Error Message: "Failed to update metrics"]          │ │
│   │ (Error Red, 14px, only shown on error)                │ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            ↓ 96px spacing ↓

┌─────────────────────────────────────────────────────────────┐
│ FOOTER - Minimal version                                    │
│ © 2025 Jamie Watters • Admin Dashboard                     │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌─────────────────────────┐
│ HEADER (if logged in)   │
│ [Logo]         [Logout] │
└─────────────────────────┘

┌─────────────────────────┐
│ DASHBOARD HEADER        │
│                         │
│ Admin Dashboard         │
│ (Bold 32px, Purple)     │
│                         │
│ Update project metrics  │
│ (Body 16px)             │
└─────────────────────────┘
       ↓ 32px ↓

┌─────────────────────────┐
│ PROJECT SELECTOR        │
│ (Full-width dropdown)   │
│                         │
│ Select Project          │
│ ┌───────────────────┐   │
│ │ AimpactScanner ▼  │   │
│ └───────────────────┘   │
└─────────────────────────┘
       ↓ 24px ↓

┌─────────────────────────┐
│ CURRENT METRICS         │
│                         │
│ Current Metrics         │
│ (H2 28px)               │
│                         │
│ ┌─────────┐ ┌─────────┐│
│ │ $4,200  │ │ 2,840   ││
│ │  MRR    │ │ Users   ││
│ └─────────┘ └─────────┘│
│ ┌─────────┐             │
│ │ Active  │             │
│ │ Status  │             │
│ └─────────┘             │
│                         │
│ Last updated: Oct 5     │
└─────────────────────────┘
       ↓ 24px ↓

┌─────────────────────────┐
│ UPDATE FORM             │
│ (90% width)             │
│                         │
│ Update Metrics          │
│ (H2 24px)               │
│                         │
│ MRR                     │
│ ┌───────────────────┐   │
│ │ $ [4200]          │   │
│ └───────────────────┘   │
│                         │
│ Active Users            │
│ ┌───────────────────┐   │
│ │ [2840]            │   │
│ └───────────────────┘   │
│                         │
│ Status                  │
│ ┌───────────────────┐   │
│ │ Active ▼          │   │
│ └───────────────────┘   │
│                         │
│ [Save Changes]          │
│ (Full-width button)     │
│                         │
│ [Success/Error Message] │
└─────────────────────────┘
       ↓ 48px ↓

┌─────────────────────────┐
│ FOOTER                  │
└─────────────────────────┘
```

### Interaction Specifications

**Login Form:**
- Password input: Focus state with Visionary Purple border
- Enter key: Submits form
- Failed login: Error message appears, input border turns red
- Success: Redirect to dashboard

**Project Selector:**
- Dropdown: All 10 projects alphabetically
- Change: Immediately loads that project's metrics (no save needed)

**Metrics Update Form:**
- Input validation: Numbers only, min/max constraints
- Save button: Disabled until form is modified
- Success: Green toast notification, metrics refresh
- Error: Red toast notification, form remains editable
- API call: POST /api/metrics with projectId + new metrics

**Logout:**
- Click: Clears authentication, redirects to login screen

---

## Design Handoff Summary

### All Mockups Complete
- [x] Home Page (desktop + mobile)
- [x] Portfolio Listing Page (desktop + mobile)
- [x] Individual Project Page (desktop + mobile)
- [x] Blog Listing Page (desktop + mobile)
- [x] Individual Blog Post Page (desktop + mobile)
- [x] About Page (desktop + mobile)
- [x] Admin Dashboard (desktop + mobile)

### Key Design Decisions Documented
- Mobile-first responsive breakpoints
- Component reuse across pages
- Interaction patterns (hover, focus, loading states)
- Content max-widths for readability (800px posts, 900px about)
- Grid layouts (3-column desktop, stacked mobile)
- Spacing rhythm (96px major sections, 48-64px subsections)

### Ready for Developer Implementation
All specifications are developer-ready with:
- Exact px/rem values
- Color hex codes from design system
- Component hierarchy clear
- Responsive behavior defined
- Accessibility requirements noted
- Performance considerations included

---

**Mockups Version:** 1.0
**Last Updated:** 2025-10-08
**Status:** Ready for Development
**Next Step:** Phase 4 - Developer Implementation
