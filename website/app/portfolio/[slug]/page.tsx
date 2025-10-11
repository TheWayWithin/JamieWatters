import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';
import { getAllProjects, getProjectBySlug, getProjectSlugs } from '@/lib/database';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/portfolio/ProjectCard';

// Generate static params for all projects (SSG)
export async function generateStaticParams() {
  try {
    const slugs = await getProjectSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  
  // Input validation
  if (!slug || typeof slug !== 'string' || slug.length > 100) {
    notFound();
  }

  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Get related projects (same category, excluding current)
  const allProjects = await getAllProjects();
  const relatedProjects = allProjects
    .filter(p => p.category === project.category && p.id !== project.id)
    .slice(0, 3);

  // Status badge color mapping
  const statusColors: Record<typeof project.status, 'success' | 'warning' | 'info' | 'error'> = {
    ACTIVE: 'success',
    BETA: 'warning',
    PLANNING: 'info',
    ARCHIVED: 'error',
  };

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Project Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-4">
          {project.name}
        </h1>

        <p className="text-body-lg sm:text-body-lg text-text-secondary mb-6 max-w-2xl">
          {project.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {project.url && (
            <Button variant="primary" size="md" asChild>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                {project.url.includes('github.com') ? (
                  <>
                    View on GitHub
                    <Github className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Visit Live Site
                    <ExternalLink className="w-4 h-4" />
                  </>
                )}
              </a>
            </Button>
          )}
        </div>

        {/* Launch Date and Status */}
        <div className="flex flex-wrap items-center gap-4 text-caption text-text-tertiary">
          {project.launchedAt && (
            <span>
              Launched: {new Date(project.launchedAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          )}
          <span>•</span>
          <div className="flex items-center gap-2">
            <span>Status:</span>
            <Badge variant={statusColors[project.status]} size="sm">
              {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
            </Badge>
          </div>
        </div>
      </section>

      {/* Metrics Display */}
      <section className="px-6 pb-8 sm:pb-12 max-w-4xl mx-auto">
        <h2 className="text-display-md font-semibold text-text-primary mb-6">
          Current Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* MRR */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-6">
            <div className="text-4xl font-bold text-brand-accent font-mono mb-2">
              ${Number(project.mrr).toFixed(2)}
            </div>
            <div className="text-body-sm text-text-secondary">
              Monthly Recurring Revenue
            </div>
          </div>

          {/* Users */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-6">
            <div className="text-4xl font-bold text-brand-accent font-mono mb-2">
              {project.users.toLocaleString()}
            </div>
            <div className="text-body-sm text-text-secondary">
              Active Users
            </div>
          </div>

          {/* Status */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-6">
            <div className="text-2xl font-semibold text-text-primary mb-2 capitalize">
              {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
            </div>
            <div className="text-body-sm text-text-secondary">
              Status
            </div>
          </div>
        </div>

        <p className="text-caption text-text-tertiary mt-4">
          Last updated: {new Date(project.updatedAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </section>

      {/* Tech Stack */}
      <section className="px-6 pb-8 sm:pb-12 max-w-4xl mx-auto">
        <h2 className="text-display-md font-semibold text-text-primary mb-6">
          Technology Stack
        </h2>

        <div className="flex flex-wrap gap-3">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="frontend" size="md">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* Hero Screenshot Placeholder */}
      <section className="px-6 pb-8 sm:pb-12 max-w-5xl mx-auto">
        <div className="relative w-full aspect-video bg-bg-surface border border-border-default rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-body text-text-secondary">
              Screenshot placeholder - 16:9 ratio
            </p>
            <p className="text-caption text-text-tertiary mt-2">
              {project.name} dashboard preview
            </p>
          </div>
        </div>
      </section>

      {/* Case Study Content */}
      <section className="px-6 pb-12 sm:pb-16 max-w-3xl mx-auto prose prose-invert">
        <h2 className="text-display-md font-semibold text-text-primary mb-6">
          Case Study
        </h2>

        {/* Problem Statement */}
        <div className="mb-12">
          <h3 className="text-display-sm font-semibold text-text-primary mb-4">
            Problem Statement
          </h3>
          <p className="text-body-lg text-text-primary leading-relaxed mb-4">
            {project.description.split('.')[0] + '.'} This project addresses a critical need in the market. This section will contain
            detailed analysis of the problem this project solves.
          </p>
          <p className="text-body-lg text-text-primary leading-relaxed">
            Key challenges identified and validated through user research.
          </p>
        </div>

        {/* Solution Approach */}
        <div className="mb-12">
          <h3 className="text-display-sm font-semibold text-text-primary mb-4">
            Solution Approach
          </h3>
          <p className="text-body-lg text-text-primary leading-relaxed mb-4">
            Built with {project.techStack[0]} to provide a scalable, performant solution.
            The architecture prioritizes speed and reliability.
          </p>
          <ul className="list-disc list-inside text-body-lg text-text-primary space-y-2 ml-4">
            <li>Modern tech stack for rapid iteration</li>
            <li>AI-powered features for automation</li>
            <li>Built for scale from day one</li>
          </ul>
        </div>

        {/* Implementation Details */}
        <div className="mb-12">
          <h3 className="text-display-sm font-semibold text-text-primary mb-4">
            Implementation Details
          </h3>
          <p className="text-body-lg text-text-primary leading-relaxed mb-4">
            Technical implementation highlights and key architectural decisions.
          </p>

          {/* Code snippet example */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 mb-4">
            <pre className="text-sm font-mono text-text-primary overflow-x-auto">
              <code>{`// Example implementation
const solution = {
  framework: "${project.techStack[0]}",
  deployment: "automated",
  monitoring: "real-time"
};`}</code>
            </pre>
          </div>
        </div>

        {/* Lessons Learned */}
        <div className="mb-12">
          <h3 className="text-display-sm font-semibold text-text-primary mb-4">
            Lessons Learned
          </h3>
          <ul className="list-disc list-inside text-body-lg text-text-primary space-y-3 ml-4">
            <li>Ship fast, iterate based on real usage</li>
            <li>Focus on core value proposition first</li>
            <li>Monitor metrics from day one</li>
            <li>Build in public for accountability</li>
          </ul>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
          <h2 className="text-display-md font-semibold text-text-primary mb-8">
            More Projects
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {relatedProjects.map((relatedProject) => (
              <ProjectCard key={relatedProject.id} project={relatedProject} />
            ))}
          </div>

          <div className="text-center">
            <Button variant="ghost" size="md" asChild>
              <Link href="/portfolio">
                View All Projects →
              </Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
