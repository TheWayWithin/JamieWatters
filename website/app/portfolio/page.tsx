import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/database';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import {
  getBreadcrumbSchema,
  renderStructuredData,
} from '@/lib/structured-data';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    "Products I've built with AI, in public. What's live, what's in build, and what I've retired.",
  openGraph: {
    title: 'Portfolio | Jamie Watters',
    description:
      "Products I've built with AI, in public. What's live, what's in build, and what I've retired.",
  },
};

export const revalidate = 3600; // 1 hour ISR

export default async function PortfolioPage() {
  const projects = await getAllProjects();

  const liveCount = projects.filter((p) => p.status === 'LIVE').length;
  const inBuildCount = projects.filter(
    (p) => p.status !== 'LIVE' && p.status !== 'ARCHIVED'
  ).length;

  // Get the most recent update date from all projects
  const mostRecentUpdate = projects.reduce((latest, project) => {
    return project.updatedAt > latest ? project.updatedAt : latest;
  }, projects[0]?.updatedAt || new Date());

  // Generate breadcrumb structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'Portfolio', url: 'https://jamiewatters.work/portfolio' },
  ]);

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-4">
          Portfolio
        </h1>
        <p className="text-body-lg sm:text-body-lg text-text-secondary max-w-2xl">
          {projects.length} products built with AI, in public. What's live, what's in build, and what I've retired.
        </p>
      </section>

      {/* Aggregate Metrics Bar */}
      <section className="px-6 pb-8 sm:pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Products built */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              {projects.length}
            </div>
            <div className="text-body-sm text-text-secondary">
              Built
            </div>
          </div>

          {/* Live */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              {liveCount}
            </div>
            <div className="text-body-sm text-text-secondary">
              Live
            </div>
          </div>

          {/* In build */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              {inBuildCount}
            </div>
            <div className="text-body-sm text-text-secondary">
              In build
            </div>
          </div>

          {/* Last Updated */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-sm sm:text-base font-semibold text-text-primary mb-1">
              Last Updated
            </div>
            <div className="text-body-sm text-text-secondary">
              {mostRecentUpdate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Project Grid */}
      <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
      </main>
    </>
  );
}
