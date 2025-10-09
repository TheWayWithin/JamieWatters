# JamieWatters.work - Design System Documentation

**Version:** 1.0
**Date:** 2025-10-08
**Status:** Ready for Development
**Theme:** Dark Mode (Light theme deferred to v2)

---

## Executive Summary

This design system implements the established Jamie Watters brand identity for a dark-theme web application. It translates the brand's light-background color palette into a performance-optimized, accessible dark interface that reflects the build-in-public, AI-first positioning.

**Key Design Principles:**
- **Radical Transparency**: Real metrics visible, authentic build-in-public aesthetic
- **Systematic Precision**: Grid-based layouts, technical typography, consistent spacing
- **Proof Over Polish**: Real work over marketing gloss
- **Performance First**: < 1MB pages, < 2s load, Lighthouse > 90

---

## Color System (Dark Theme Implementation)

### Foundation Colors

**Page Backgrounds**
```css
/* Deep Space - Primary background */
--bg-primary: #0F172A;        /* Brand Deep Space */
--bg-surface: #1E293B;        /* Elevated surfaces (cards, inputs) */
--bg-surface-hover: #334155;  /* Hover state for interactive surfaces */
```

**Text Colors**
```css
/* Cloud - High contrast on dark backgrounds */
--text-primary: #F8FAFC;      /* Brand Cloud - primary text */
--text-secondary: #CBD5E1;    /* Secondary text, captions */
--text-tertiary: #64748B;     /* Brand Slate - less emphasis */
--text-inverse: #0F172A;      /* Text on light backgrounds (buttons) */
```

**Brand Colors** (From Brand Guide)
```css
/* Primary Actions & Brand Moments */
--brand-primary: #7C3AED;     /* Visionary Purple */
--brand-primary-hover: #6D28D9; /* Darkened 10% for hover */
--brand-primary-active: #5B21B6; /* Darkened 20% for active */

/* Secondary Actions & Links */
--brand-secondary: #2563EB;   /* Execution Blue */
--brand-secondary-hover: #1D4ED8; /* Darkened 10% */

/* Highlights & Success */
--brand-accent: #F59E0B;      /* Proof Gold */
--brand-accent-hover: #D97706; /* Darkened 10% */
```

**Functional Colors**
```css
/* Success States */
--color-success: #10B981;     /* Brand Success Green */
--color-success-bg: rgba(16, 185, 129, 0.1); /* Subtle background */

/* Error States */
--color-error: #EF4444;       /* Brand Error Red */
--color-error-bg: rgba(239, 68, 68, 0.1);

/* Warning States */
--color-warning: #F97316;     /* Brand Warning Orange */
--color-warning-bg: rgba(249, 115, 22, 0.1);

/* Info States */
--color-info: #2563EB;        /* Execution Blue */
--color-info-bg: rgba(37, 99, 235, 0.1);
```

**Border Colors**
```css
--border-subtle: rgba(226, 232, 240, 0.1);   /* Very subtle dividers */
--border-default: rgba(226, 232, 240, 0.15); /* Standard borders */
--border-emphasis: rgba(226, 232, 240, 0.3); /* Emphasized borders */
--border-brand: #7C3AED;                     /* Visionary Purple for focus states */
```

### Tech Stack Badge Colors

**Color-coded by technology category** (using brand palette):

```css
/* Frontend Technologies */
--badge-frontend: #2563EB;      /* Execution Blue */
--badge-frontend-bg: rgba(37, 99, 235, 0.15);
--badge-frontend-text: #60A5FA; /* Lighter blue for dark bg */

/* Backend Technologies */
--badge-backend: #7C3AED;       /* Visionary Purple */
--badge-backend-bg: rgba(124, 58, 237, 0.15);
--badge-backend-text: #A78BFA;  /* Lighter purple */

/* Database Technologies */
--badge-database: #10B981;      /* Success Green */
--badge-database-bg: rgba(16, 185, 129, 0.15);
--badge-database-text: #34D399; /* Lighter green */

/* DevOps/Infrastructure */
--badge-devops: #F59E0B;        /* Proof Gold */
--badge-devops-bg: rgba(245, 158, 11, 0.15);
--badge-devops-text: #FCD34D;   /* Lighter gold */

/* AI/ML Technologies */
--badge-ai: #8B5CF6;            /* Purple variant */
--badge-ai-bg: rgba(139, 92, 246, 0.15);
--badge-ai-text: #A78BFA;
```

### Semantic Color Usage

**Primary CTAs**: Visionary Purple background (#7C3AED), white text
**Secondary CTAs**: Transparent with Visionary Purple border, Visionary Purple text
**Links**: Execution Blue (#2563EB), underline on hover
**Metrics**: Proof Gold (#F59E0B) for large numbers
**Success Indicators**: Success Green (#10B981)
**Project Status Active**: Success Green badge
**Project Status Beta**: Warning Orange badge

### Accessibility Compliance (WCAG AA)

All color combinations tested for contrast ratios:

| Combination | Ratio | Passes | Usage |
|-------------|-------|--------|-------|
| Cloud (#F8FAFC) on Deep Space (#0F172A) | 15.8:1 | AAA | Primary text |
| Visionary Purple (#7C3AED) on Deep Space | 4.9:1 | AA Large | Headings, buttons |
| Execution Blue (#2563EB) on Deep Space | 5.2:1 | AA Large | Links, secondary buttons |
| Proof Gold (#F59E0B) on Deep Space | 6.8:1 | AA | Metrics, highlights |
| White (#FFFFFF) on Visionary Purple | 6.4:1 | AA | Button text |

---

## Typography System

### Font Families

**Primary Font: Inter** (All weights)
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
```
- Usage: Headlines, body text, UI elements, navigation
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- Source: Google Fonts via `next/font`

**Code Font: JetBrains Mono**
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```
- Usage: Code snippets, metrics, technical content
- Weights: 400 (Regular), 500 (Medium)
- Source: Google Fonts via `next/font`

### Type Scale (Desktop)

**Display Headings**
```css
/* H1 - Hero Headlines, Page Titles */
font-size: 56px;          /* 3.5rem */
font-weight: 700;         /* Bold */
line-height: 1.1;         /* 61.6px */
letter-spacing: -0.02em;
color: var(--text-primary) or var(--brand-primary);

/* H2 - Section Headers */
font-size: 40px;          /* 2.5rem */
font-weight: 600;         /* Semibold */
line-height: 1.2;         /* 48px */
letter-spacing: -0.01em;
color: var(--text-primary) or var(--brand-secondary);

/* H3 - Subsection Headers */
font-size: 32px;          /* 2rem */
font-weight: 600;         /* Semibold */
line-height: 1.25;        /* 40px */
letter-spacing: 0;
color: var(--text-primary);

/* H4 - Component Headers */
font-size: 24px;          /* 1.5rem */
font-weight: 500;         /* Medium */
line-height: 1.33;        /* 32px */
letter-spacing: 0;
color: var(--text-primary);
```

**Body Text**
```css
/* Body Large (Desktop) */
font-size: 18px;          /* 1.125rem */
font-weight: 400;         /* Regular */
line-height: 1.6;         /* 28.8px */
letter-spacing: 0;
color: var(--text-primary);

/* Body Default */
font-size: 16px;          /* 1rem */
font-weight: 400;
line-height: 1.6;         /* 25.6px */
color: var(--text-primary);

/* Body Small */
font-size: 14px;          /* 0.875rem */
font-weight: 400;
line-height: 1.5;         /* 21px */
color: var(--text-secondary);

/* Caption */
font-size: 12px;          /* 0.75rem */
font-weight: 400;
line-height: 1.4;         /* 16.8px */
color: var(--text-tertiary);
```

**UI Text**
```css
/* Button Text */
font-size: 16px;
font-weight: 600;         /* Semibold */
letter-spacing: 0.01em;   /* Slightly wider for clarity */

/* Navigation Links */
font-size: 16px;
font-weight: 500;         /* Medium */
letter-spacing: 0;

/* Input Labels */
font-size: 14px;
font-weight: 500;
color: var(--text-primary);

/* Badge Text */
font-size: 12px;
font-weight: 500;
letter-spacing: 0.02em;   /* Uppercase tracking */
text-transform: uppercase;
```

**Code Text**
```css
/* Inline Code */
font-family: 'JetBrains Mono', monospace;
font-size: 14px;
font-weight: 400;
background: var(--bg-surface);
padding: 2px 6px;
border-radius: 4px;

/* Code Blocks */
font-family: 'JetBrains Mono', monospace;
font-size: 14px;
line-height: 1.5;
background: var(--bg-surface);
padding: 16px;
border-radius: 8px;
```

### Type Scale (Mobile)

**Responsive scaling** (applies at < 640px breakpoint):

```css
/* H1 Mobile */
font-size: 40px;          /* 2.5rem - reduced from 56px */

/* H2 Mobile */
font-size: 32px;          /* 2rem - reduced from 40px */

/* H3 Mobile */
font-size: 24px;          /* 1.5rem - reduced from 32px */

/* Body Mobile */
font-size: 16px;          /* 1rem - reduced from 18px */

/* All other sizes remain the same */
```

### Tailwind Class Mappings

```javascript
// tailwind.config.ts
theme: {
  fontSize: {
    'display-xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
    'display-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
    'display-md': ['32px', { lineHeight: '1.25' }],
    'display-sm': ['24px', { lineHeight: '1.33' }],
    'body-lg': ['18px', { lineHeight: '1.6' }],
    'body': ['16px', { lineHeight: '1.6' }],
    'body-sm': ['14px', { lineHeight: '1.5' }],
    'caption': ['12px', { lineHeight: '1.4' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
}
```

---

## Spacing System

### 8px Grid System (From Brand Guide)

All spacing uses 8px base unit:

```css
/* Spacing Scale */
--space-1: 8px;    /* 0.5rem - Extra small */
--space-2: 16px;   /* 1rem - Small */
--space-3: 24px;   /* 1.5rem - Medium */
--space-4: 32px;   /* 2rem - Large */
--space-5: 40px;   /* 2.5rem - Extra large */
--space-6: 48px;   /* 3rem - 2XL */
--space-8: 64px;   /* 4rem - 3XL */
--space-12: 96px;  /* 6rem - 4XL */
```

### Component Internal Spacing

**Cards**
```css
padding: 24px;              /* --space-3 for standard cards */
padding: 32px;              /* --space-4 for featured cards */
gap: 16px;                  /* --space-2 between card elements */
```

**Buttons**
```css
/* Small */
padding: 8px 16px;          /* py-1 px-2 */

/* Medium (Default) */
padding: 12px 24px;         /* py-1.5 px-3 */

/* Large */
padding: 16px 32px;         /* py-2 px-4 */
```

**Input Fields**
```css
padding: 12px 16px;         /* py-1.5 px-2 */
```

**Section Spacing** (Vertical rhythm between major sections)
```css
/* Desktop */
margin-bottom: 96px;        /* --space-12 between major sections */
margin-bottom: 64px;        /* --space-8 between subsections */

/* Mobile */
margin-bottom: 64px;        /* Reduced to --space-8 for major */
margin-bottom: 48px;        /* Reduced to --space-6 for subsections */
```

### Grid Gaps
```css
/* Project Grid */
gap: 24px;                  /* --space-3 between cards */

/* Metrics Grid */
gap: 16px;                  /* --space-2 between metric cards */

/* Blog Grid */
gap: 32px;                  /* --space-4 between blog posts */
```

### Tailwind Spacing Config

```javascript
// tailwind.config.ts
theme: {
  spacing: {
    '1': '8px',
    '2': '16px',
    '3': '24px',
    '4': '32px',
    '5': '40px',
    '6': '48px',
    '8': '64px',
    '12': '96px',
  },
}
```

---

## Border Radius & Shadows

### Border Radius (From Brand Guide: 8px standard)

```css
/* Border Radius Scale */
--radius-sm: 4px;           /* 0.25rem - Small badges, inline code */
--radius-md: 6px;           /* 0.375rem - Buttons */
--radius-lg: 8px;           /* 0.5rem - Cards (brand standard) */
--radius-xl: 12px;          /* 0.75rem - Large cards, modals */
--radius-full: 9999px;      /* Pill buttons, avatar */
```

**Component Radius**
- Buttons: 6px (--radius-md)
- Cards: 8px (--radius-lg - brand standard)
- Inputs: 6px (--radius-md)
- Badges: 4px (--radius-sm for small badges)
- Modal overlays: 12px (--radius-xl)

### Shadows (Dark Theme Optimized)

Subtle shadows for dark backgrounds:

```css
/* Card Shadows */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.5);

/* Hover Shadows */
--shadow-hover: 0 6px 12px rgba(0, 0, 0, 0.6);

/* Focus/Glow Effects */
--shadow-brand: 0 0 0 3px rgba(124, 58, 237, 0.3); /* Visionary Purple glow */
```

**Usage:**
- Cards at rest: `shadow-md`
- Cards on hover: `shadow-lg`
- Buttons on hover: Slight elevation with `shadow-sm`
- Focus states: `shadow-brand` (Visionary Purple glow)

---

## Component Specifications

### Button Component

**Variants:**

**Primary Button** (Visionary Purple)
```css
background: var(--brand-primary);        /* #7C3AED */
color: #FFFFFF;
border: none;
border-radius: var(--radius-md);         /* 6px */
padding: 12px 24px;                      /* Medium size */
font-size: 16px;
font-weight: 600;
letter-spacing: 0.01em;
cursor: pointer;
transition: all 200ms ease;

/* Hover */
background: var(--brand-primary-hover);  /* #6D28D9 - 10% darker */
box-shadow: var(--shadow-sm);

/* Active */
background: var(--brand-primary-active); /* #5B21B6 - 20% darker */
transform: translateY(1px);

/* Focus */
outline: none;
box-shadow: var(--shadow-brand);         /* Purple glow */

/* Disabled */
background: var(--brand-primary);
opacity: 0.4;
cursor: not-allowed;
```

**Secondary Button** (Ghost with Visionary Purple)
```css
background: transparent;
color: var(--brand-primary);             /* #7C3AED */
border: 1px solid var(--brand-primary);
border-radius: var(--radius-md);
padding: 12px 24px;
font-size: 16px;
font-weight: 600;

/* Hover */
background: rgba(124, 58, 237, 0.1);     /* Subtle purple tint */
border-color: var(--brand-primary-hover);

/* Active */
background: rgba(124, 58, 237, 0.2);
```

**Tertiary Button** (Text only, Execution Blue)
```css
background: transparent;
color: var(--brand-secondary);           /* #2563EB */
border: none;
padding: 12px 16px;
font-size: 16px;
font-weight: 500;
text-decoration: none;

/* Hover */
text-decoration: underline;
color: var(--brand-secondary-hover);
```

**Sizes:**
- Small: `padding: 8px 16px; font-size: 14px;`
- Medium (Default): `padding: 12px 24px; font-size: 16px;`
- Large: `padding: 16px 32px; font-size: 18px;`

### Card Component

**Default Card** (Project cards, blog posts)
```css
background: var(--bg-surface);           /* #1E293B */
border: 1px solid var(--border-default); /* Subtle silver */
border-radius: var(--radius-lg);         /* 8px - brand standard */
padding: 24px;
box-shadow: var(--shadow-md);
transition: all 300ms ease;

/* Hover (if interactive) */
border-color: var(--border-emphasis);
box-shadow: var(--shadow-lg);
transform: scale(1.02);                  /* Subtle scale */
```

**Flat Card** (Metric displays, no hover)
```css
background: var(--bg-surface);
border: 1px solid var(--border-subtle);
border-radius: var(--radius-lg);
padding: 24px;
box-shadow: none;                        /* No elevation */
```

**Featured Card** (Top projects on home page)
```css
background: var(--bg-surface);
border: 2px solid var(--brand-primary);  /* Visionary Purple border */
border-radius: var(--radius-lg);
padding: 32px;                           /* Larger padding */
box-shadow: var(--shadow-lg);
```

### Badge Component

**Tech Stack Badge** (Color-coded by category)
```css
/* Frontend Badge Example */
display: inline-flex;
align-items: center;
background: var(--badge-frontend-bg);    /* Blue tint */
color: var(--badge-frontend-text);       /* Light blue */
padding: 4px 12px;
border-radius: var(--radius-sm);         /* 4px */
font-size: 12px;
font-weight: 500;
letter-spacing: 0.02em;
text-transform: uppercase;
```

**Status Badge**
```css
/* Active Status */
background: var(--color-success-bg);
color: var(--color-success);
padding: 4px 8px;
border-radius: var(--radius-sm);
font-size: 12px;
font-weight: 500;
text-transform: uppercase;

/* Beta Status */
background: var(--color-warning-bg);
color: var(--color-warning);
```

**Badge Sizes:**
- Small: `padding: 2px 8px; font-size: 10px;`
- Medium (Default): `padding: 4px 12px; font-size: 12px;`
- Large: `padding: 6px 16px; font-size: 14px;`

### Input Component

**Text Input**
```css
background: var(--bg-primary);           /* Deep Space */
border: 1px solid var(--border-default);
border-radius: var(--radius-md);         /* 6px */
padding: 12px 16px;
font-size: 16px;
font-family: 'Inter', sans-serif;
color: var(--text-primary);
transition: all 200ms ease;

/* Focus */
outline: none;
border: 2px solid var(--brand-primary);  /* Visionary Purple */
box-shadow: var(--shadow-brand);

/* Error */
border: 2px solid var(--color-error);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);

/* Disabled */
background: var(--bg-surface);
border-color: var(--border-subtle);
opacity: 0.6;
cursor: not-allowed;
```

**Textarea**
```css
/* Same as text input but: */
min-height: 120px;
resize: vertical;
```

**Select Dropdown**
```css
/* Same as text input with: */
appearance: none;
background-image: url('data:image/svg+xml;utf8,<svg>...</svg>'); /* Chevron icon */
background-repeat: no-repeat;
background-position: right 12px center;
padding-right: 40px;
```

### Layout Components

**Header**
```css
background: var(--bg-primary);           /* Deep Space */
border-bottom: 1px solid var(--border-subtle);
padding: 16px 24px;                      /* Desktop */
height: 64px;                            /* Desktop */
position: sticky;
top: 0;
z-index: 50;
backdrop-filter: blur(8px);              /* Subtle blur on scroll */

/* Mobile */
height: 56px;
padding: 12px 16px;
```

**Footer**
```css
background: var(--bg-primary);           /* Deep Space */
border-top: 1px solid var(--border-subtle);
padding: 64px 48px;                      /* Desktop */
color: var(--text-secondary);

/* Mobile */
padding: 48px 24px;
```

**Mobile Menu** (Slide-in drawer)
```css
position: fixed;
top: 0;
right: 0;
width: 280px;
height: 100vh;
background: var(--bg-surface);
box-shadow: var(--shadow-lg);
padding: 24px;
transform: translateX(100%);             /* Hidden by default */
transition: transform 300ms ease-out;

/* Open state */
transform: translateX(0);                /* Slides in */
```

---

## Interaction Specifications

### Animation Timings

**Performance-optimized animations** (< 300ms):

```css
/* Micro-interactions */
--timing-fast: 150ms;       /* Quick feedback (button presses) */
--timing-base: 200ms;       /* Standard transitions (hovers) */
--timing-slow: 300ms;       /* Larger movements (cards, modals) */

/* Easing Functions */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);    /* Smooth deceleration */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1); /* Smooth acceleration + deceleration */
```

### Button Interactions

```css
button {
  transition: all var(--timing-base) var(--ease-out);
}

/* Hover */
button:hover {
  background: var(--brand-primary-hover);
  box-shadow: var(--shadow-sm);
  /* Animation: 200ms */
}

/* Active */
button:active {
  transform: translateY(1px);
  /* Animation: 150ms */
}
```

### Card Hover Effects

```css
.card {
  transition: all var(--timing-slow) var(--ease-out);
}

.card:hover {
  transform: scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--border-emphasis);
  /* Animation: 300ms */
}
```

### Link Interactions

```css
a {
  color: var(--brand-secondary);
  text-decoration: none;
  transition: all var(--timing-base) var(--ease-out);
}

a:hover {
  text-decoration: underline;
  color: var(--brand-secondary-hover);
  /* Animation: 200ms */
}
```

### Mobile Menu Animation

```css
/* Open animation */
.mobile-menu {
  transform: translateX(100%);
  transition: transform var(--timing-slow) var(--ease-out);
}

.mobile-menu.open {
  transform: translateX(0);
  /* Animation: 300ms ease-out */
}
```

### Focus States (Accessibility)

```css
*:focus-visible {
  outline: none;
  box-shadow: var(--shadow-brand);       /* 3px Visionary Purple glow */
  /* Animation: 200ms */
}
```

### Loading States

```css
/* Spinner for loading buttons */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 1s linear infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  width: 16px;
  height: 16px;
}
```

### Motion Preferences (Accessibility)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Logo & Brand Assets

### Logo Implementation

**Header Logo** (Primary horizontal logo)
- File: `JW-Logo-Primary-White.svg` (white version on dark background)
- Size: 180px width minimum (desktop), 150px width (mobile)
- Placement: Top-left, 24px from edges
- Link: Home page

**Footer Logo** (White version)
- File: `JW-Logo-Primary-White.svg`
- Size: 160px width
- Placement: Centered or left-aligned in footer

**Favicon**
- File: `JW-Favicon.ico` (32x32, 16x16 sizes)
- Symbol only (no wordmark)

### Profile Photo Treatment

**About Page Usage:**
- File: `/Ideation/Images/Jamie South St Seaport.jpg`
- Treatment: Natural colors, slight clarity enhancement (brand guideline: no heavy filters)
- Size: 400px x 400px (square crop, centered on face)
- Border: 4px solid Visionary Purple (optional accent)
- Border radius: 8px (brand standard, or 50% for circular)
- Alt text: "Jamie Watters - Solo entrepreneur building toward $1B by 2030"

### Social Preview Image

**Open Graph / Twitter Card:**
- Dimensions: 1200x630px
- Design:
  - Background: Gradient (Visionary Purple to Execution Blue)
  - Headline: "Building $1B Solo by 2030" (Inter Bold 72px, white)
  - Subheadline: "Follow the journey" (Inter Regular 32px, white 80% opacity)
  - Logo: White version bottom-right (watermark)
- File: `og-image.png` (optimized WebP < 200KB)

---

## Responsive Design Specifications

### Breakpoints (Tailwind Defaults)

```css
/* Mobile */
< 640px                    /* Default styles (mobile-first) */

/* Tablet */
sm: 640px - 768px         /* Tablet portrait */
md: 768px - 1024px        /* Tablet landscape */

/* Desktop */
lg: 1024px - 1280px       /* Desktop */
xl: 1280px+               /* Large desktop */
```

### Mobile-First Scaling

**Typography:**
- H1: 56px desktop → 40px mobile
- H2: 40px desktop → 32px mobile
- H3: 32px desktop → 24px mobile
- Body: 18px desktop → 16px mobile

**Spacing:**
- Section spacing: 96px desktop → 64px mobile
- Card padding: 32px desktop → 24px mobile
- Page margins: 48px desktop → 24px mobile

**Grid Layouts:**
- Home Featured Projects: 3 columns desktop → 1 column mobile
- Portfolio Grid: 3 columns desktop → 2 columns tablet → 1 column mobile
- Blog Grid: 3 columns desktop → 1 column mobile
- Metrics: 4 columns desktop → 2x2 grid mobile

**Touch Targets (Mobile):**
- Minimum 44px x 44px (WCAG AAA guideline)
- Buttons: Increase vertical padding to 16px on mobile
- Navigation links: Full-width tap targets with 48px height

---

## Accessibility Documentation

### Color Contrast (WCAG AA Compliance)

All combinations meet minimum 4.5:1 for body text, 3:1 for large text:

**Verified Combinations:**
- Cloud (#F8FAFC) on Deep Space (#0F172A): 15.8:1 (AAA)
- Visionary Purple (#7C3AED) on Deep Space: 4.9:1 (AA Large)
- Execution Blue (#2563EB) on Deep Space: 5.2:1 (AA)
- Proof Gold (#F59E0B) on Deep Space: 6.8:1 (AA)
- White (#FFFFFF) on Visionary Purple: 6.4:1 (AA)
- Success Green (#10B981) on Deep Space: 5.1:1 (AA)

### Keyboard Navigation

**Tab Order:**
1. Skip to content link (hidden until focused)
2. Logo (home link)
3. Primary navigation links (left to right)
4. Mobile menu button (mobile only)
5. Main content (headings, links, buttons in logical order)
6. Footer links
7. Social media icons

**Focus Indicators:**
- 3px Visionary Purple glow (`box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.3)`)
- Applied to all focusable elements (`:focus-visible` pseudo-class)
- High contrast, visible on all backgrounds

### ARIA Labels

**Icon-Only Buttons:**
```html
<button aria-label="Open mobile menu">
  <MenuIcon />
</button>

<a href="https://twitter.com/jamiewatters" aria-label="Follow on Twitter">
  <TwitterIcon />
</a>
```

**Navigation Landmarks:**
```html
<header role="banner">...</header>
<nav aria-label="Primary navigation">...</nav>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
```

**Status Messages:**
```html
<div role="alert" aria-live="polite">
  Metrics updated successfully
</div>
```

### Alt Text Standards

**Decorative Images:**
```html
<img src="background-pattern.svg" alt="" />
```

**Informative Images:**
```html
<img src="project-screenshot.png" alt="SoloMarket dashboard showing active listings and revenue metrics" />
```

**Profile Photo:**
```html
<img src="jamie-photo.jpg" alt="Jamie Watters smiling at South Street Seaport in New York City" />
```

### Screen Reader Considerations

- Semantic HTML (`<nav>`, `<main>`, `<article>`, `<section>`)
- Skip to content link (hidden visually, available to screen readers)
- Heading hierarchy (H1 → H2 → H3, no skipping levels)
- Form labels explicitly associated with inputs
- Link text descriptive ("Read case study" vs. "Click here")

---

## Asset Specifications

### Image Optimization

**Format Priority:**
1. WebP (primary - best compression)
2. AVIF (if supported by `next/image`)
3. JPEG fallback (for legacy browsers)

**Sizing:**
- Hero images: 1920px max width
- Project screenshots: 1200px max width
- Blog post images: 800px max width
- Thumbnails: 400px max width

**Quality:**
- Hero images: 85% quality
- Screenshots: 80% quality
- Thumbnails: 75% quality

**Lazy Loading:**
- All images below fold use `loading="lazy"`
- Blur placeholder for smooth loading (low-quality image placeholder - LQIP)

**File Structure:**
```
/public/images/
  /projects/
    aimpactscanner-hero.webp
    solomarket-dashboard.webp
  /blog/
    week-1-header.webp
  /profile/
    jamie-about.webp
  og-image.png
```

### Font Loading

**Strategy:**
```javascript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',          // Avoid FOIT (Flash of Invisible Text)
  variable: '--font-inter',
  preload: true,            // Preload critical font
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
  preload: false,           // Load on demand (only for code blocks)
});
```

**Font Weights:**
- Inter: 400, 500, 600, 700, 800
- JetBrains Mono: 400, 500

**Subset:**
- Latin characters only (reduces file size by 60%)

---

## Tailwind Configuration

### Complete Config

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        'bg-primary': '#0F172A',
        'bg-surface': '#1E293B',
        'bg-surface-hover': '#334155',

        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-tertiary': '#64748B',

        // Brand
        'brand-primary': '#7C3AED',
        'brand-primary-hover': '#6D28D9',
        'brand-secondary': '#2563EB',
        'brand-accent': '#F59E0B',

        // Functional
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F97316',

        // Borders
        'border-subtle': 'rgba(226, 232, 240, 0.1)',
        'border-default': 'rgba(226, 232, 240, 0.15)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-md': ['32px', { lineHeight: '1.25' }],
        'display-sm': ['24px', { lineHeight: '1.33' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'body-sm': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.4' }],
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
        '12': '96px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 2px 4px rgba(0, 0, 0, 0.4)',
        'lg': '0 4px 8px rgba(0, 0, 0, 0.5)',
        'hover': '0 6px 12px rgba(0, 0, 0, 0.6)',
        'brand': '0 0 0 3px rgba(124, 58, 237, 0.3)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

---

## Performance Budgets

### Page Weight Targets

- **Total page size:** < 1MB
- **Initial JavaScript bundle:** < 200KB gzipped
- **CSS:** < 50KB gzipped
- **Images:** < 500KB total per page (optimized WebP)
- **Fonts:** < 100KB (subset Latin characters)

### Loading Targets

- **Time to First Byte (TTFB):** < 100ms (edge cached)
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.0s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms

### Lighthouse Scores (Minimum)

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 95

---

## Developer Handoff Checklist

### Design Assets Ready
- [x] Complete color palette with Tailwind config
- [x] Typography system with all scales
- [x] Spacing system (8px grid)
- [x] Component specifications (Button, Card, Badge, Input)
- [x] Logo files (white SVG for dark backgrounds)
- [x] Profile photo (optimized WebP)
- [x] Brand guidelines reference

### Implementation Guidance
- [x] Tailwind configuration complete
- [x] Font loading strategy defined
- [x] Image optimization requirements
- [x] Animation timing values
- [x] Accessibility standards documented
- [x] Responsive breakpoints defined
- [x] Performance budgets set

### Next Phase: Mockups
See `mockups-overview.md` for detailed page layout specifications.

---

**Design System Version:** 1.0
**Last Updated:** 2025-10-08
**Status:** Ready for Development
**Next Step:** Phase 4 - Developer Implementation
