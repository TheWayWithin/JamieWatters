import Link from 'next/link';
import { getAllProjects } from '@/lib/database';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { getProofPoint } from '@/lib/portfolio-proof';
import { getSEOMetadata } from '@/lib/seo';
import { AuthorBio } from '@/components/AuthorBio';
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  renderStructuredData,
} from '@/lib/structured-data';

export const metadata = getSEOMetadata({
  title: 'Portfolio',
  description:
    'Every product I have shipped as a solo builder working with AI: what is live, what is in the workshop, and what each earns. See the code and the real numbers.',
  path: '/portfolio',
});

export const revalidate = 3600; // 1 hour ISR

// Genuinely usable products (public URL, shipped) go in the proof grid.
const LIVE_STATUSES = new Set(['LIVE', 'BETA']);

export default async function PortfolioPage() {
  const projects = await getAllProjects();

  // Split: usable products get full proof cards; pre-launch work is a short
  // "in the workshop" line, not a wishlist of empty cards (Wave 4, Option A).
  const liveProducts = projects.filter((p) => LIVE_STATUSES.has(p.status));
  const workshop = projects.filter((p) => !LIVE_STATUSES.has(p.status));
  const openSourceCount = liveProducts.filter((p) => p.githubUrl).length;

  // Generate breadcrumb structured data
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'Portfolio', url: 'https://jamiewatters.work/portfolio' },
  ]);

  // Last content change = the most recent project update; drives the visible
  // date and dateModified in the CollectionPage schema.
  const lastUpdated = projects.reduce(
    (latest, p) => (p.updatedAt > latest ? p.updatedAt : latest),
    new Date(0)
  );
  const lastUpdatedISO = lastUpdated.toISOString();
  const lastUpdatedDisplay = lastUpdated.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const collectionSchema = getCollectionPageSchema({
    name: 'Portfolio',
    description:
      'Products Jamie Watters has shipped as a solo builder working with AI, each with live status and real numbers.',
    url: 'https://jamiewatters.work/portfolio',
    dateModified: lastUpdatedISO,
    items: liveProducts.map((p) => ({
      name: p.name,
      url: `https://jamiewatters.work/portfolio/${p.slug}`,
      description: p.description,
    })),
  });

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(collectionSchema)}
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
      {/* Page Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-text-primary mb-4">
          Portfolio
        </h1>
        <p className="text-body-lg sm:text-body-lg text-text-secondary max-w-2xl">
          {liveProducts.length} products live and in people's hands, {openSourceCount} with
          the code open to read. Built with AI, in public. Each one earns its place below.
        </p>
        <p className="text-caption text-text-tertiary mt-3">
          Last updated <time dateTime={lastUpdatedISO}>{lastUpdatedDisplay}</time>
        </p>
      </section>

      {/* Proof grid — live products only */}
      <section className="px-6 pb-12 sm:pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveProducts.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              proofPoint={getProofPoint(project.slug)}
            />
          ))}
        </div>
      </section>

      {/* In the workshop — pre-launch work, named honestly, no empty cards */}
      {workshop.length > 0 && (
        <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
          <h2 className="text-body-sm uppercase tracking-wide text-text-tertiary mb-3">
            In the workshop
          </h2>
          <p className="text-body text-text-secondary max-w-2xl">
            Not live yet, so not counted above:{' '}
            {workshop.map((p, i) => (
              <span key={p.id}>
                <Link
                  href={`/portfolio/${p.slug}`}
                  className="text-text-primary hover:text-brand-primary transition-base"
                >
                  {p.name}
                </Link>
                {i < workshop.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        </section>
      )}

      {/* About the builder — reusable home for outbound references */}
      <section className="px-6 pb-16 sm:pb-24 max-w-3xl mx-auto">
        <AuthorBio heading="About the builder" />
      </section>
      </main>
    </>
  );
}
