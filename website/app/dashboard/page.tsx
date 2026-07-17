import Link from 'next/link';
import { FileText, Star, Rocket, Github } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getProofStats } from '@/lib/proof';
import { getSEOMetadata } from '@/lib/seo';

// Rendering is per-request (root layout forces dynamic for CSP nonces);
// this bounds the GitHub star fetch cache to an hour.
export const revalidate = 3600;

export const metadata = getSEOMetadata({
  title: 'Proof',
  description:
    'The numbers behind the work: articles published, GitHub stars, and products shipped. Real, current, and yours to check.',
  type: 'website',
});

export default async function ProofPage() {
  const stats = await getProofStats();

  // The root layout forces dynamic rendering, so this runs per request:
  // DB counts are live at render time; GitHub stars come from an hourly fetch cache.
  const refreshedAt = new Date().toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
  });

  const cards = [
    {
      icon: FileText,
      value: stats.articles.toLocaleString(),
      label: 'Articles published',
      note: 'Written in public on the journey',
    },
    {
      icon: Star,
      value: stats.githubStars.toLocaleString(),
      label: 'GitHub stars',
      note: `Across ${stats.reposCounted} public repositories`,
    },
    {
      icon: Rocket,
      value: stats.productsLive.toLocaleString(),
      label: 'Products live',
      note: `${stats.productsTotal} built with AI in total`,
    },
    {
      icon: Github,
      value: stats.reposCounted.toLocaleString(),
      label: 'Open repositories',
      note: 'Code open for anyone to inspect',
    },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-bg-primary">
      {/* Header */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-text-primary mb-6">
          Proof
        </h1>
        <p className="text-body-lg lg:text-body-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          No vanity metrics, no MRR theatre. The numbers that show the work is real, pulled live and
          open for you to check.
        </p>
      </section>

      {/* Metric cards */}
      <section className="px-6 pb-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ icon: Icon, value, label, note }) => (
            <div
              key={label}
              className="bg-bg-surface border border-border-default rounded-lg p-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-accent/15 rounded-lg">
                  <Icon className="w-6 h-6 text-brand-accent" />
                </div>
              </div>
              <div className="text-display-md font-bold text-brand-accent font-mono mb-2">
                {value}
              </div>
              <div className="text-body-sm font-semibold text-text-primary mb-1">{label}</div>
              <div className="text-caption text-text-secondary">{note}</div>
            </div>
          ))}
        </div>

        <p className="text-caption text-text-secondary text-center mt-6">
          Article and product counts come straight from the database; GitHub stars refresh hourly.
          Last refreshed {refreshedAt} UTC.
        </p>
      </section>

      {/* CTAs */}
      <section className="px-6 pb-16 sm:pb-24 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/journey">Read the field report</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/portfolio">See the products</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <a href="https://github.com/TheWayWithin" target="_blank" rel="noopener noreferrer">
              Check the code on GitHub
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}
