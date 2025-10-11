import Link from 'next/link';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { PostCard } from '@/components/blog/PostCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react';
import {
  getFeaturedProjects,
  getRecentPosts,
  getMetrics,
} from '@/lib/database';
import { getSEOMetadata } from '@/lib/seo';

// ISR: Revalidate every 1 hour
export const revalidate = 3600;

// SEO Metadata
export const metadata = getSEOMetadata({
  title: 'Building $1B Solo by 2030',
  description: 'AI-powered solopreneur building 10+ products simultaneously. Follow the journey from zero to billion in public—real metrics, real challenges, real lessons.',
  type: 'website'
});

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();
  const recentPosts = await getRecentPosts(3);
  const metrics = await getMetrics();

  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center bg-bg-primary px-6 py-12 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-display-xl lg:text-display-2xl font-bold text-brand-primary mb-6 leading-tight">
            Building $1B Solo by 2030
          </h1>
          <p className="text-body-lg lg:text-body-xl text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered solopreneur building 10+ products simultaneously. Follow
            the journey from zero to billion in public—real metrics, real
            challenges, real lessons.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/portfolio">View Portfolio</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/journey">Follow Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Dashboard */}
      <section className="py-16 lg:py-24 px-6 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display-lg font-bold text-text-primary mb-4">
              Current Progress
            </h2>
            <p className="text-body-base text-text-secondary max-w-2xl mx-auto">
              Real-time metrics from my portfolio of AI-powered products. Updated
              weekly with transparent reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total MRR */}
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-accent/15 rounded-lg">
                  <DollarSign className="w-6 h-6 text-brand-accent" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                Total MRR
              </div>
              <div className="text-display-md font-bold text-brand-accent mb-1">
                ${metrics.totalMRR.toFixed(2)}
              </div>
              <div className="text-xs text-green-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+0% vs last month</span>
              </div>
            </Card>

            {/* Total Users */}
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-primary/15 rounded-lg">
                  <Users className="w-6 h-6 text-brand-primary" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                Total Users
              </div>
              <div className="text-display-md font-bold text-brand-accent mb-1">
                {metrics.totalUsers.toLocaleString()}
              </div>
              <div className="text-xs text-green-400 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+0% vs last month</span>
              </div>
            </Card>

            {/* Active Projects */}
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-brand-secondary/15 rounded-lg">
                  <Briefcase className="w-6 h-6 text-brand-secondary" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                Active Projects
              </div>
              <div className="text-display-md font-bold text-brand-accent mb-1">
                {metrics.activeProjects}
              </div>
              <div className="text-xs text-text-tertiary">
                Building simultaneously
              </div>
            </Card>

            {/* Portfolio Value */}
            <Card className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-green-500/15 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-2">
                Portfolio Value
              </div>
              <div className="text-display-md font-bold text-brand-accent mb-1">
                ${metrics.portfolioValue.toLocaleString()}
              </div>
              <div className="text-xs text-text-tertiary">
                3-year revenue multiple
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-xs text-text-tertiary">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 lg:py-24 px-6 bg-bg-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-display-lg font-bold text-text-primary mb-4">
                Featured Projects
              </h2>
              <p className="text-body-base text-text-secondary max-w-2xl">
                Highlighted products from my portfolio of AI-powered tools and
                frameworks.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/portfolio">View All →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button asChild variant="ghost">
              <Link href="/portfolio">View All Projects →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-16 lg:py-24 px-6 bg-bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-display-lg font-bold text-text-primary mb-4">
                The Journey
              </h2>
              <p className="text-body-base text-text-secondary max-w-2xl">
                Weekly updates documenting the path to billion-dollar
                solopreneur. Real challenges, lessons learned, and transparent
                metrics.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/journey">Read All →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <div className="text-center mt-8 sm:hidden">
            <Button asChild variant="ghost">
              <Link href="/journey">Read All Posts →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 lg:py-24 px-6 bg-bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-display-lg font-bold text-text-primary mb-6">
            About Jamie Watters
          </h2>
          <p className="text-body-lg text-text-secondary mb-6 leading-relaxed">
            AI-first solopreneur obsessed with building products that solve real
            problems. Former enterprise architect turned indie hacker, now
            building 10+ AI-powered SaaS products simultaneously using AGENT-11
            framework.
          </p>
          <p className="text-body-base text-text-secondary mb-8 leading-relaxed">
            Mission: Prove that one person with the right AI tools can build a
            billion-dollar portfolio by 2030. Sharing everything I learn along
            the way.
          </p>
          <Button asChild size="lg">
            <Link href="/about">Learn More About Me →</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
