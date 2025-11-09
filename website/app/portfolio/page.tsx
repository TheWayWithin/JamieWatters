import { getAllProjects, getMetrics } from '@/lib/database';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import {
  getBreadcrumbSchema,
  renderStructuredData,
} from '@/lib/structured-data';

export const revalidate = 3600; // 1 hour ISR

export default async function PortfolioPage() {
  const projects = await getAllProjects();
  const metrics = await getMetrics();

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
          10 AI-powered products built as a solo operator. From idea to execution, all tracked in public.
        </p>
      </section>

      {/* Aggregate Metrics Bar */}
      <section className="px-6 pb-8 sm:pb-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Total MRR */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              ${metrics.totalMRR.toFixed(2)}
            </div>
            <div className="text-body-sm text-text-secondary">
              Total MRR
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              {metrics.totalUsers.toLocaleString()}
            </div>
            <div className="text-body-sm text-text-secondary">
              Users
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-bg-surface border border-border-default rounded-lg p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl font-bold text-brand-accent font-mono mb-1">
              {metrics.activeProjects}
            </div>
            <div className="text-body-sm text-text-secondary">
              Projects
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
