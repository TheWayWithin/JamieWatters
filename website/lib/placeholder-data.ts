/**
 * Placeholder Data for JamieWatters.work
 *
 * This file contains mock data for development and initial deployment
 * before the database is fully connected and seeded.
 */

export interface PlaceholderProject {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: 'active' | 'beta' | 'planning' | 'archived';
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  techStack: string[];
  category: 'AI_TOOLS' | 'FRAMEWORKS' | 'EDUCATION' | 'MARKETPLACE' | 'OTHER';
  metrics: {
    mrr: number;
    users: number;
  };
  launchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceholderPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  tags: string[];
  readTime: number;
}

export interface PlaceholderMetrics {
  totalMRR: number;
  totalUsers: number;
  activeProjects: number;
  portfolioValue: number;
}

// All 10 projects from Jamie's portfolio
export const placeholderProjects: PlaceholderProject[] = [
  {
    id: "1",
    slug: "aimpact-scanner",
    name: "AimpactScanner.com",
    tagline: "AI Search Optimization Analyzer",
    description: "Analyze how your content performs in AI search results. Get actionable insights to optimize for ChatGPT, Perplexity, and other AI-powered search engines.",
    status: "active",
    liveUrl: "https://aimpactscanner.com",
    githubUrl: null,
    featured: true,
    techStack: ["Next.js", "OpenAI", "Tailwind CSS", "Neon", "Netlify"],
    category: "AI_TOOLS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-01-15"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "2",
    slug: "master-ai-framework",
    name: "Master-ai Framework",
    tagline: "AI SEO/GEO Optimization Framework",
    description: "Open-source framework for optimizing content for AI-powered search engines. Built for developers and SEO professionals.",
    status: "active",
    liveUrl: "https://github.com/TheWayWithin/master-ai",
    githubUrl: "https://github.com/TheWayWithin/master-ai",
    featured: true,
    techStack: ["TypeScript", "Node.js", "Anthropic", "OpenAI"],
    category: "FRAMEWORKS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-02-01"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "3",
    slug: "aisearchmastery",
    name: "Aisearchmastery.com",
    tagline: "AI Search Education Platform",
    description: "Learn how to optimize your content for AI-powered search engines. Courses, guides, and templates for content creators and marketers.",
    status: "active",
    liveUrl: "https://aisearchmastery.com",
    githubUrl: null,
    featured: false,
    techStack: ["Next.js", "MDX", "Tailwind CSS", "Stripe"],
    category: "EDUCATION",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-03-01"),
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "4",
    slug: "seo-agent",
    name: "SEO-Agent",
    tagline: "Traditional SEO Suite",
    description: "Comprehensive SEO toolset for traditional search optimization. Keyword research, competitor analysis, rank tracking, and more.",
    status: "active",
    liveUrl: null,
    githubUrl: "https://github.com/TheWayWithin/seo-agent",
    featured: false,
    techStack: ["Python", "FastAPI", "PostgreSQL", "Redis"],
    category: "AI_TOOLS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-04-01"),
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "5",
    slug: "agent-11",
    name: "Agent-11.com",
    tagline: "Dev Agent Library for Claude Automation",
    description: "Deploy specialized AI agents in Claude Code to form an elite development squad. Templates and documentation for 11 specialized agents.",
    status: "active",
    liveUrl: "https://agent-11.com",
    githubUrl: "https://github.com/TheWayWithin/agent-11",
    featured: true,
    techStack: ["Markdown", "Claude Code", "Documentation"],
    category: "FRAMEWORKS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-05-01"),
    createdAt: new Date("2024-04-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "6",
    slug: "bos-ai",
    name: "BOS-AI",
    tagline: "Business Agent Library",
    description: "AI agent framework for business operations. Automate customer support, sales, marketing, and operations with specialized agents.",
    status: "beta",
    liveUrl: null,
    githubUrl: "https://github.com/TheWayWithin/bos-ai",
    featured: false,
    techStack: ["TypeScript", "Anthropic", "LangChain", "Vector DB"],
    category: "FRAMEWORKS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-06-01"),
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "7",
    slug: "llmtxtmastery",
    name: "Llmtxtmastery.com",
    tagline: "LLMS.TXT Generator",
    description: "Generate optimized llms.txt files for your website. Help AI models understand your content structure and purpose.",
    status: "active",
    liveUrl: "https://llmtxtmastery.com",
    githubUrl: null,
    featured: false,
    techStack: ["Next.js", "OpenAI", "Tailwind CSS"],
    category: "AI_TOOLS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-07-01"),
    createdAt: new Date("2024-06-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "8",
    slug: "evolve-7",
    name: "Evolve-7.com",
    tagline: "Multi-Model Collaborative AI",
    description: "Orchestrate multiple AI models to solve complex problems. Claude, GPT-4, Gemini, and more working together seamlessly.",
    status: "planning",
    liveUrl: null,
    githubUrl: null,
    featured: false,
    techStack: ["Next.js", "TypeScript", "Multi-LLM APIs"],
    category: "AI_TOOLS",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: null,
    createdAt: new Date("2024-08-01"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "9",
    slug: "freecalchub",
    name: "Freecalchub.com",
    tagline: "Free Calculator Tools",
    description: "Collection of free online calculators for finance, health, fitness, and productivity. SEO-optimized for organic traffic.",
    status: "active",
    liveUrl: "https://freecalchub.com",
    githubUrl: null,
    featured: false,
    techStack: ["Next.js", "React", "Tailwind CSS"],
    category: "OTHER",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: new Date("2024-09-01"),
    createdAt: new Date("2024-08-15"),
    updatedAt: new Date("2025-10-08"),
  },
  {
    id: "10",
    slug: "solomarketwork",
    name: "SoloMarket.work",
    tagline: "SAAS Marketplace and Build-in-Public Platform",
    description: "Marketplace for solo-built SaaS products. Share your journey, connect with customers, and grow your solopreneur business.",
    status: "planning",
    liveUrl: null,
    githubUrl: null,
    featured: false,
    techStack: ["Next.js", "Stripe", "Neon", "Netlify"],
    category: "MARKETPLACE",
    metrics: {
      mrr: 0,
      users: 0,
    },
    launchedAt: null,
    createdAt: new Date("2024-09-15"),
    updatedAt: new Date("2025-10-08"),
  },
];

// Featured projects for home page (top 3)
export const featuredProjects = placeholderProjects.filter(p => p.featured).slice(0, 3);

// Placeholder blog posts
export const placeholderPosts: PlaceholderPost[] = [
  {
    id: "1",
    slug: "week-1-building-jamiewatters",
    title: "Week 1: Building JamieWatters.work",
    excerpt: "The journey of building a personal brand website begins. Why I'm building in public and what I hope to achieve by documenting this journey to billion-dollar solopreneur.",
    content: `# Week 1: Building JamieWatters.work

The journey begins. This week marks the start of documenting my path from zero to building a billion-dollar portfolio of AI-powered SaaS products—completely solo.

## Why Build in Public?

Building in public isn't just about transparency. It's about accountability, learning, and connecting with others on similar journeys. By sharing everything—successes, failures, metrics, and decisions—I'm creating a resource for aspiring solopreneurs.

## What I'm Building

JamieWatters.work is more than a portfolio site. It's:
- A transparent view into my 10+ active projects
- Real metrics and honest updates
- A platform to share frameworks and learnings
- Proof that one person can build something massive

## This Week's Progress

- ✅ Completed strategic analysis with AI agents
- ✅ Finalized technical architecture (Next.js + Neon + Netlify)
- ✅ Designed complete UI/UX system
- 🚧 Started implementation (currently in progress)

## Next Steps

Phase 4 continues with building out the home page, portfolio pages, and blog system. The goal is to launch the MVP within 4-6 weeks and start sharing weekly updates.

Stay tuned for Week 2 updates!`,
    publishedAt: new Date("2025-10-08"),
    tags: ["build-in-public", "web-development", "solopreneur"],
    readTime: 5,
  },
  {
    id: "2",
    slug: "choosing-tech-stack-2025",
    title: "Choosing the Right Tech Stack for Solo Founders in 2025",
    excerpt: "Why I chose Next.js, Neon, and Netlify for my personal brand website. A practical guide to making technology decisions as a solo founder.",
    content: `# Choosing the Right Tech Stack for Solo Founders in 2025

Technology decisions can make or break a solo project. Here's how I chose my stack and what I learned in the process.

## The Framework Decision: Next.js

After evaluating Astro, Remix, and plain React, I chose Next.js 14 with App Router because:
- **Performance**: Built-in ISR and edge caching
- **Developer Experience**: Excellent TypeScript support and conventions
- **Ecosystem**: Massive community and plugin ecosystem
- **SEO**: Server-side rendering and static generation out of the box

## Database: Neon over Supabase

While Supabase is popular, I chose Neon for:
- **Branch databases**: Git-like branching for preview deployments
- **Serverless**: Pay-per-use with built-in connection pooling
- **Simplicity**: Just Postgres, no extra features I don't need yet
- **Developer experience**: Instant provisioning and great CLI

## Deployment: Netlify vs Vercel

Both are excellent, but Netlify won because:
- **Branch deploys**: Automatic preview deployments
- **Build plugins**: Flexibility for custom build steps
- **Pricing**: Better free tier for getting started

## Lessons Learned

1. **Choose boring technology**: Next.js and Postgres are proven
2. **Optimize for solo speed**: Avoid complex setups
3. **Start simple**: Can always add complexity later

Ship fast, iterate based on real usage.`,
    publishedAt: new Date("2025-10-07"),
    tags: ["tech-stack", "nextjs", "architecture"],
    readTime: 7,
  },
  {
    id: "3",
    slug: "ai-agents-development-workflow",
    title: "Using AI Agents to 10x Your Development Workflow",
    excerpt: "How I use AGENT-11 to orchestrate development with specialized AI agents. A practical guide to AI-assisted development in 2025.",
    content: `# Using AI Agents to 10x Your Development Workflow

AI agents aren't just for chatbots. They're now essential tools for solo developers who want to move fast and ship quality products.

## What is AGENT-11?

AGENT-11 is a framework I built for deploying specialized AI agents in Claude Code. It includes:
- The Strategist (product strategy)
- The Architect (system design)
- The Designer (UI/UX)
- The Developer (implementation)
- The Tester (quality assurance)
- The Operator (DevOps)
- ...and 5 more specialized roles

## Real Results

Building JamieWatters.work with AGENT-11:
- **Strategic analysis**: 2 hours (vs 2 days manually)
- **Architecture design**: 3 hours (vs 1 week manually)
- **UI/UX design**: 4 hours (vs 2 weeks with designer)
- **Implementation**: In progress (estimated 50% faster)

## How It Works

Each agent is a specialized Claude instance with:
1. Specific role and capabilities
2. Access to relevant tools (code, database, deployment)
3. Context preservation between handoffs
4. Clear delegation protocols

The Coordinator orchestrates multi-agent workflows, ensuring zero context loss and efficient collaboration.

## Key Takeaways

- AI agents can handle 80% of routine development tasks
- Critical thinking still requires human oversight
- Context preservation is essential for quality
- Specialized agents > generalist chatbots

Try AGENT-11 at [agent-11.com](https://agent-11.com)`,
    publishedAt: new Date("2025-10-06"),
    tags: ["ai", "productivity", "agent-11", "development"],
    readTime: 6,
  },
];

// Aggregate metrics for home page dashboard
export const placeholderMetrics: PlaceholderMetrics = {
  totalMRR: 0, // Will be populated with real data
  totalUsers: 0, // Will be populated with real data
  activeProjects: 10,
  portfolioValue: 0, // Calculated from individual project valuations
};

// Helper functions
export function getFeaturedProjects() {
  return featuredProjects;
}

export function getRecentPosts(limit: number = 3) {
  return placeholderPosts
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, limit);
}

export function getAllProjects() {
  return placeholderProjects;
}

export function getActiveProjects() {
  return placeholderProjects.filter(p => p.status === 'active');
}

export function getProjectBySlug(slug: string) {
  return placeholderProjects.find(p => p.slug === slug);
}

export function getPostBySlug(slug: string) {
  return placeholderPosts.find(p => p.slug === slug);
}

export function getMetrics(): PlaceholderMetrics {
  // Calculate aggregate metrics from projects
  const activeProjects = getActiveProjects();
  const totalMRR = activeProjects.reduce((sum, p) => sum + p.metrics.mrr, 0);
  const totalUsers = activeProjects.reduce((sum, p) => sum + p.metrics.users, 0);

  return {
    totalMRR,
    totalUsers,
    activeProjects: activeProjects.length,
    portfolioValue: totalMRR * 36, // Simple 3-year revenue multiple
  };
}
