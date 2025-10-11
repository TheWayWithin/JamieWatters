import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Page Header with Profile Photo */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-12">
          About Jamie
        </h1>

        {/* Profile Photo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <Image
              src="/images/jamie-profile.jpg"
              alt="Jamie Watters at South Street Seaport"
              fill
              className="object-cover rounded-lg border-4 border-brand-primary"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
        {/* Background */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Background
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              I'm Jamie Watters, a solopreneur primarily focused on building SaaS and tools that solve real 
              solopreneur problems. My journey began in the 1980s writing BASIC on a <a 
              href="https://en.wikipedia.org/wiki/Research_Machines_380Z" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline"
              >Research Machines 380Z</a> during lunch breaks. Starting from the ground up at <a 
              href="https://en.wikipedia.org/wiki/Sperry_Corporation" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline"
              >Sperry Univac</a>, I became a systems programmer, living through the great technology 
              transitions—assembler to C to C++, hierarchical to relational databases.
            </p>
            <p>
              Fearing my aging brain wouldn't keep up with the accelerating pace of change, I 
              retreated to management, spending the next 20 years climbing the corporate ladder. 
              But corporate life slowly drained the joy from work. I was successful but empty.
            </p>
            <p>
              Then AI changed everything. It removed the cognitive barriers I feared while 
              amplifying my decades of strategic experience. Now, while bootstrapping alongside 
              my day job, I've rediscovered the joy of building. In just 5 months, I've created 
              <a 
              href="https://jamiewatters.work/portfolio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline"
              >5 apps, 4 websites, and 4 agent suites</a>—all while working full-time. I'm orchestrating 
              AI agents to build multiple businesses simultaneously, proving that experience plus 
              AI equals unprecedented leverage.
            </p>
          </div>
          
          {/* Link to detailed story */}
          <div className="mt-8">
            <Link 
              href="/my-story" 
              className="text-brand-secondary hover:text-brand-secondary-hover font-semibold inline-flex items-center gap-2 transition-colors"
            >
              Read the full story of my journey from the 1980s to AI orchestration →
            </Link>
          </div>
        </div>

        {/* Vision */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Vision
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              My goal is simple but audacious: reach $1 billion in portfolio value by 2030. Not
              through a single unicorn startup, but through a diversified portfolio of 10-20
              AI-powered businesses, each generating $5-50M ARR.
            </p>
            <p>
              This isn't just about the money. It's about proving a new model of entrepreneurship
              is possible. We're at the dawn of the AI era, and I believe the future belongs to
              solo operators who can orchestrate intelligent systems to build at unprecedented
              scale.
            </p>
          </div>
        </div>

        {/* Current Focus */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Current Focus
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              Right now, I'm actively building and operating 10 products across four categories:
            </p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                <strong className="text-text-primary">SaaS & Solopreneur Tools:</strong> Automated workflows and 
                productivity solutions for solo entrepreneurs and small businesses
              </li>
              <li>
                <strong className="text-text-primary">Frameworks:</strong> Developer tools and
                open-source libraries for AI integration
              </li>
              <li>
                <strong className="text-text-primary">Education:</strong> Courses and content
                teaching AI-powered entrepreneurship
              </li>
              <li>
                <strong className="text-text-primary">Marketplaces:</strong> Platforms connecting
                buyers and sellers in emerging niches
              </li>
            </ul>
            <p>
              Each project is instrumented with real-time metrics, and I share progress
              transparently through weekly updates. Every win, every failure, every lesson
              learned—all documented publicly.
            </p>
          </div>
        </div>

        {/* Why Build in Public */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Why Build in Public?
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              Building in public holds me accountable and creates a feedback loop with the
              community. Transparency isn't just a marketing strategy—it's core to how I learn
              and improve. Sharing both successes and struggles attracts the right people and
              opportunities.
            </p>
            <p>
              Plus, I want to inspire other builders. If I can show the playbook—the tools,
              strategies, and mindset required to build at scale as a solo operator—then others
              can replicate and surpass what I'm doing. That's the real goal.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-6 pb-16 sm:pb-24 max-w-2xl mx-auto">
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Get in Touch
          </h2>
          <p className="text-body-lg text-text-secondary mb-8">
            Interested in collaborating, have questions, or just want to say hi? I'd love to hear
            from you.
          </p>

          {/* Email */}
          <div className="mb-8">
            <a
              href="mailto:jamie@jamiewatters.work"
              className="text-body-lg text-brand-secondary hover:underline inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              jamie@jamiewatters.work
            </a>
          </div>

          {/* Social Media */}
          <div className="mb-8">
            <h3 className="text-body font-semibold text-text-primary mb-4">
              Social Media
            </h3>
            <div className="flex justify-center gap-6">
              <a
                href="https://twitter.com/jamiewatters"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Twitter"
                className="text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                <Twitter className="w-12 h-12" />
              </a>
              <a
                href="https://linkedin.com/in/jamiewatters"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                <Linkedin className="w-12 h-12" />
              </a>
              <a
                href="https://github.com/TheWayWithin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on GitHub"
                className="text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                <Github className="w-12 h-12" />
              </a>
            </div>
          </div>

          {/* CTA */}
          <Button variant="primary" size="lg" asChild>
            <Link href="/journey">
              Follow My Journey →
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
