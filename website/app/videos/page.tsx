import { Youtube } from 'lucide-react';
import { getAllVideos, getFeaturedVideos, CHANNEL_URL } from '@/lib/videos';
import { VideoCard } from '@/components/videos/VideoCard';
import { Button } from '@/components/ui/Button';
import { getSEOMetadata } from '@/lib/seo';
import { getBreadcrumbSchema, renderStructuredData } from '@/lib/structured-data';

export const metadata = getSEOMetadata({
  title: 'Videos',
  description:
    'Building with AI in public, on camera. Real builds, real numbers, and what actually happened — including the parts that did not work.',
  path: '/videos',
});

export const revalidate = 3600; // 1 hour ISR, matching /journey

export default async function VideosPage() {
  // One fetch feeds both sections; getFeaturedVideos resolves Jamie's picks
  // against the same list rather than hitting YouTube a second time.
  const all = await getAllVideos();
  const featured = await getFeaturedVideos(all);
  const latest = [...all]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 6);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: 'https://jamiewatters.work' },
    { name: 'Videos', url: 'https://jamiewatters.work/videos' },
  ]);

  return (
    <>
      {renderStructuredData(breadcrumbSchema)}

      <main className="min-h-screen bg-bg-primary">
        <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-7xl mx-auto">
          <h1 className="text-display-xl sm:text-display-xl font-bold text-text-primary mb-4">
            Videos
          </h1>
          <p className="text-body-lg sm:text-body-lg text-text-secondary max-w-2xl mb-6">
            Building with AI in public, on camera. Real builds, real numbers, and what actually
            happened, including the parts that didn&apos;t work.
          </p>

          <Button variant="ghost" size="sm" asChild>
            <a
              href={CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              Subscribe on YouTube
            </a>
          </Button>
        </section>

        {/* Featured — only rendered when Jamie has picked something. With an
            empty list the page leads with Latest instead of showing a hole. */}
        {featured.length > 0 && (
          <section className="px-6 pb-12 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Start here</h2>
            <p className="text-body text-text-secondary mb-6 max-w-2xl">
              Hand-picked, not the algorithm&apos;s idea of the newest thing.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.map((video) => (
                <VideoCard key={video.videoId} video={video} featured />
              ))}
            </div>
          </section>
        )}

        <section className="px-6 pb-16 sm:pb-24 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            {featured.length > 0 ? 'Latest' : 'Latest videos'}
          </h2>

          {latest.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-body text-text-secondary mb-6">
                No videos published yet. The channel is where the building gets shown as it
                happens.
              </p>
              <Button variant="secondary" size="sm" asChild>
                <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  Subscribe on YouTube
                </a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {latest.map((video) => (
                <VideoCard key={video.videoId} video={video} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
