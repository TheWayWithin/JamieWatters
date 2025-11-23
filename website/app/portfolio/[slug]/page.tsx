import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';
import { getAllProjects, getProjectBySlug, getProjectSlugs } from '@/lib/database';
import { renderMarkdown } from '@/lib/markdown';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import {
  getProjectSchema,
  getBreadcrumbSchema,
  renderStructuredData,
} from '@/lib/structured-data';

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
    RESEARCH: 'info',
    DESIGN: 'info',
    PLANNING: 'info',
    BUILD: 'warning',
    BETA: 'warning',
    MVP: 'warning',
    LIVE: 'success',
    ARCHIVED: 'error',
  };

  // Generate structured data for SEO
  const projectSchema = getProjectSchema(project);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'Portfolio', url: 'https://jamiewatters.work/portfolio' },
    { name: project.name, url: `https://jamiewatters.work/portfolio/${project.slug}` },
  ]);

  // Render markdown content for case study sections
  const [longDescriptionHtml, problemStatementHtml, solutionApproachHtml, lessonsLearnedHtml] = await Promise.all([
    project.longDescription ? renderMarkdown(project.longDescription) : null,
    project.problemStatement ? renderMarkdown(project.problemStatement) : null,
    project.solutionApproach ? renderMarkdown(project.solutionApproach) : null,
    project.lessonsLearned ? renderMarkdown(project.lessonsLearned) : null,
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(projectSchema)}
      {renderStructuredData(breadcrumbSchema)}

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

      {/* Screenshots */}
      {project.screenshots && project.screenshots.length > 0 && (
        <section className="px-6 pb-8 sm:pb-12 max-w-5xl mx-auto">
          <div className="space-y-6">
            {project.screenshots.map((screenshot, index) => (
              <div key={index} className="relative w-full aspect-video bg-bg-surface border border-border-default rounded-lg overflow-hidden">
                <img
                  src={screenshot}
                  alt={`${project.name} screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Case Study Content */}
      {(longDescriptionHtml || problemStatementHtml || solutionApproachHtml || lessonsLearnedHtml) && (
        <section className="px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Case Study
          </h2>

          {/* Long Description */}
          {longDescriptionHtml && (
            <div className="mb-12">
              <div
                className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: longDescriptionHtml }}
              />
            </div>
          )}

          {/* Problem Statement */}
          {problemStatementHtml && (
            <div className="mb-12">
              <h3 className="text-display-sm font-semibold text-text-primary mb-4">
                Problem Statement
              </h3>
              <div
                className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: problemStatementHtml }}
              />
            </div>
          )}

          {/* Solution Approach */}
          {solutionApproachHtml && (
            <div className="mb-12">
              <h3 className="text-display-sm font-semibold text-text-primary mb-4">
                Solution Approach
              </h3>
              <div
                className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: solutionApproachHtml }}
              />
            </div>
          )}

          {/* Lessons Learned */}
          {lessonsLearnedHtml && (
            <div className="mb-12">
              <h3 className="text-display-sm font-semibold text-text-primary mb-4">
                Lessons Learned
              </h3>
              <div
                className="prose prose-invert max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-brand-secondary prose-a:hover:text-brand-primary prose-strong:text-text-primary prose-code:text-brand-accent prose-code:bg-bg-surface prose-code:px-2 prose-code:py-1 prose-code:rounded prose-ul:text-text-primary prose-ol:text-text-primary prose-li:text-text-secondary"
                dangerouslySetInnerHTML={{ __html: lessonsLearnedHtml }}
              />
            </div>
          )}
        </section>
      )}

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
    </>
  );
}
