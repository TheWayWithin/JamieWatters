import Link from 'next/link';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { PostCard } from '@/components/blog/PostCard';
import { Button } from '@/components/ui/Button';
import { getFeaturedProjects, getRecentPosts } from '@/lib/database';
import { getSEOMetadata } from '@/lib/seo';
import {
  getPersonSchema,
  getWebsiteSchema,
  renderStructuredData,
} from '@/lib/structured-data';

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

// SEO Metadata
export const metadata = getSEOMetadata({
  title: 'Become More Valuable, Not Less, as AI Accelerates',
  description:
    "I build with AI, test what's real, kill what isn't, and share the whole lot in public. Open code, real numbers, the failures before the wins.",
  type: 'website',
});

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();
  const recentPosts = await getRecentPosts(3);

  const personSchema = getPersonSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <>
      {/* Structured Data for SEO */}
      {renderStructuredData(personSchema)}
      {renderStructuredData(websiteSchema)}

      <main id="main-content" className="min-h-screen">
        {/* Hero */}
        <section className="min-h-[60vh] flex items-center justify-center bg-bg-primary px-6 py-12 lg:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-display-xl lg:text-display-2xl font-bold text-brand-primary mb-6 leading-tight">
              Become more valuable, not less, as AI accelerates.
            </h1>
            <p className="text-body-lg lg:text-body-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              I build with AI, test what's real, kill what isn't, and share the whole lot in
              public. Open code, real numbers, the failures before the wins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/journey">Subscribe</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/about">Read the story</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Who this is for */}
        <section className="py-16 lg:py-24 px-6 bg-bg-surface">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-lg font-bold text-text-primary mb-6">
              Who this is for
            </h2>
            <div className="space-y-6 text-body-lg text-text-secondary leading-relaxed">
              <p>
                For builders and founders trying to make sense of AI change without drowning in
                hype.
              </p>
              <p>
                I'm not an AI guru selling a course of recycled ideas, and I'm not a consultant
                who's never shipped anything. I'm the bloke in the water: building things with
                these tools, finding out what actually holds up, and telling you the truth about it
                before you spend your own time finding out.
              </p>
            </div>
          </div>
        </section>

        {/* What I do */}
        <section className="py-16 lg:py-24 px-6 bg-bg-primary">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-lg font-bold text-text-primary mb-6">
              I build to learn, not to sell.
            </h2>
            <div className="space-y-6 text-body-lg text-text-secondary leading-relaxed">
              <p>
                Every product is a test of what's real at the frontier. I run the test in the open,
                give the code away, and write up what worked, what didn't, and why. When something
                stops earning its place, I kill it in public and tell you what it cost me.
              </p>
              <p>
                The value was never the software. It's the judgement and the trust, and those only
                compound if I show my working.
              </p>
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="py-16 lg:py-24 px-6 bg-bg-surface">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-lg font-bold text-text-primary mb-6">
              Why it matters
            </h2>
            <div className="space-y-6 text-body-lg text-text-secondary leading-relaxed">
              <p>
                Hundreds of millions of people now get their understanding of the world from a
                handful of similarly-trained AI models. The answers come back confident, reasonable,
                and identical for everyone. When the machine hands the whole crowd the same play,
                the play stops paying.
              </p>
              <p>
                So the scarce thing, the only defensible thing, is the ability to keep your own
                mind: real judgement, grounded in real depth, from someone actually doing the work.
                That's what I'm building here. Not another feed of AI takes. A field report you can
                verify.
              </p>
            </div>
          </div>
        </section>

        {/* Receipts */}
        <section className="py-16 lg:py-24 px-6 bg-bg-primary">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-lg font-bold text-text-primary mb-8">
              Why you might believe me
            </h2>
            <ul className="space-y-4 text-body-lg text-text-secondary leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand-accent flex-shrink-0">▹</span>
                <span>
                  4 published books, including the best-selling book on business continuity in the
                  world for its first few years
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-accent flex-shrink-0">▹</span>
                <span>
                  19 products built with AI, across search, trading, monitoring, and benchmarking
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-accent flex-shrink-0">▹</span>
                <span>
                  38 years in technology, including complex systems in global banking
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-accent flex-shrink-0">▹</span>
                <span>Creator of Efformism, and innovations on The Headless Way</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand-accent flex-shrink-0">▹</span>
                <span>
                  Code open for anyone to inspect; products killed in public when they don't work
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Recent writing */}
        <section className="py-16 lg:py-24 px-6 bg-bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-display-lg font-bold text-text-primary mb-4">
                  The field report
                </h2>
                <p className="text-body-base text-text-secondary max-w-2xl">
                  What's working, what isn't, and what it cost me. Open numbers, written as I go.
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/journey">Read all →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="ghost">
                <Link href="/journey">Read all posts →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured projects */}
        <section className="py-16 lg:py-24 px-6 bg-bg-primary">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-display-lg font-bold text-text-primary mb-4">
                  The products
                </h2>
                <p className="text-body-base text-text-secondary max-w-2xl">
                  Built with AI, open to inspect, and killed in public when they stop earning their
                  place.
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/portfolio">View all →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Button asChild variant="ghost">
                <Link href="/portfolio">View all projects →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* The deal */}
        <section className="py-16 lg:py-24 px-6 bg-bg-surface">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-display-lg font-bold text-text-primary mb-8">
              The deal
            </h2>
            <div className="space-y-3 text-body-lg text-text-primary font-medium mb-8">
              <p>If I recommend it, I'm using it.</p>
              <p>If it failed, you'll hear about the failure before the win.</p>
              <p>My code is open for you to check.</p>
              <p>Every product I kill gets a public post-mortem.</p>
            </div>
            <p className="text-body-lg text-text-secondary leading-relaxed">
              That's the whole deal. No funnel, no secret sauce, no "DM me to scale."
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-16 lg:py-24 px-6 bg-bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-body-lg lg:text-body-xl text-text-primary mb-4 leading-relaxed">
              I'm in the water, riding this wave in real time, in code and in writing.
            </p>
            <p className="text-body-lg text-text-secondary mb-8 leading-relaxed">
              If you'd rather learn from someone actually doing the work than someone selling theory
              from the beach, stay a while. I'll tell you what's working before you waste the time
              finding out yourself.
            </p>
            <Button asChild size="lg">
              <Link href="/journey">Subscribe</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
