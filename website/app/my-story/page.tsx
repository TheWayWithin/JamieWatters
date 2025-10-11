import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Mail, Twitter, Linkedin, Github } from 'lucide-react';

export default function MyStoryPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-brand-primary mb-6">
          My Story
        </h1>
        <p className="text-body-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          From Playground to Boardroom and Back: Rediscovering the Joy of Building
        </p>
      </section>

      {/* Story Content */}
      <section className="px-6 pb-12 sm:pb-16 max-w-4xl mx-auto">
        
        {/* The Beginning */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            The Beginning (1980s)
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              It started with pure curiosity. Back in the 1980s, my high school had exactly one computer—a 
              <a 
              href="https://en.wikipedia.org/wiki/Research_Machines_380Z" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline font-semibold"
              >Research Machines 380Z</a> tucked away in the science teacher's room. 
              During lunch breaks and spare moments, a few of us would crowd around that machine, writing games in BASIC 
              and discovering the magic of making things happen with code.
            </p>
            <p>
              When the <a 
              href="https://en.wikipedia.org/wiki/VIC-20" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline font-semibold"
              >VIC-20</a> came out, I convinced my parents to get me one. 
              I was hooked. There was something intoxicating about the immediate feedback loop—type some code, run it, 
              see what happens. Fix it, improve it, make it do something new.
            </p>
            <blockquote className="border-l-4 border-brand-secondary bg-bg-surface p-6 my-8 italic text-body-lg">
              "I felt so alive in those early days—the pure excitement of building and creating was everything."
            </blockquote>
          </div>
        </div>

        {/* Early Career */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            Early Career: From Bins to Systems Programming
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              That passion led me to do whatever it took to stay close to computers. I got a job at 
              <a 
              href="https://en.wikipedia.org/wiki/Sperry_Corporation" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline font-semibold"
              >Sperry Univac</a> in the computer room, just to be around the machines. I hung around, asked questions, 
              and eventually wrangled my way into a trainee position as a computer operator.
            </p>
            <p>
              From there, I climbed the ladder: systems programmer, writing operating systems, earning a computing degree. 
              Loading tapes, booting mainframes, fixing programs, building and installing brand new systems—it was all 
              pure joy. Every day brought new challenges, new problems to solve, new systems to understand.
            </p>
          </div>
        </div>

        {/* The Technical Evolution */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            The Technical Evolution: Riding the Wave of Change
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              In those early days, I worked alongside programmers who had coded in assembler for their entire 25-year careers. 
              But then the changes started accelerating. We shifted from <strong className="text-brand-primary">assembler to C</strong>. 
              A few years later, <strong className="text-brand-primary">C++</strong>. Then something else.
            </p>
            <p>
              I watched as we moved from hierarchical database handlers to the emergence of relational databases. 
              Each transition brought new paradigms, new ways of thinking, new skills to master. The pace of change 
              was exhilarating but also intimidating.
            </p>
            <p>
              I was keeping up fine—that wasn't the problem. I was adapting, learning, growing with each new technology. 
              But a nagging fear was beginning to take root.
            </p>
          </div>
        </div>

        {/* The Fear & The Pivot */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            The Fear & The Pivot: A Strategic Retreat
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              The fear that gripped me was more insidious than any technical challenge: what would happen when I reached 50? 
              Would my aging brain still be able to cope with this relentless pace of change? I'd seen older programmers 
              struggle, and I convinced myself that cognitive decline would eventually make adaptation impossible.
            </p>
            <p>
              So I made what seemed like a strategic retreat: I moved into management. People, I reasoned, don't change 
              as fast as programming languages. Leadership principles are timeless. It felt like the smart, mature decision.
            </p>
            <blockquote className="border-l-4 border-brand-secondary bg-bg-surface p-6 my-8 italic text-body-lg">
              "At first, I loved management too. But over the next twenty years, something slowly died inside me."
            </blockquote>
          </div>
        </div>

        {/* Twenty Years of Corporate Life */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            Twenty Years of Corporate Life: Success Without Soul
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              Corporate life became increasingly inane, sucking the life and fun out of work. The joy I'd felt in 
              those early days—the pure excitement of building and creating—was gone. I was successful by conventional 
              measures: climbing the ladder, managing larger teams, handling bigger budgets.
            </p>
            <p>
              But I felt empty. The connection between effort and outcome became abstract. The immediate feedback loop 
              of code—write, test, see it work—was replaced by meetings about meetings, strategies about strategies, 
              and decisions that took months to implement.
            </p>
            <p>
              I told myself this was what growing up looked like. This was maturity, responsibility, the natural 
              progression of a career. But deep down, I knew something vital was missing.
            </p>
          </div>
        </div>

        {/* The AI Renaissance */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            The AI Renaissance: Everything Changed Again
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              Then AI arrived, and everything changed again. The very force that seemed to threaten my management 
              career also handed me back my first love. All those things that once filled me with dread—mastering 
              endless new languages, tools, and integrations—AI now handles effortlessly.
            </p>
            <p>
              The cognitive load I feared my aging brain couldn't handle? AI carries it. But what AI can't provide 
              is vision, passion, or the distinctly human drive to create something meaningful. It can't articulate 
              a product spec from a glimmer of an idea, and it can't orchestrate an army of AI agents to bring 
              that vision to life.
            </p>
            <blockquote className="border-l-4 border-brand-secondary bg-bg-surface p-6 my-8 italic text-body-lg">
              "It turns out my old-school discipline and strategic thinking weren't obsolete—they were the missing piece."
            </blockquote>
            <p>
              The kid who used to sneak into the computer room during lunch breaks had grown into someone who could 
              conduct an orchestra of artificial intelligence. And ironically, at 50+, I'm more productive and 
              creative than I ever was in my twenties.
            </p>
          </div>
        </div>

        {/* Building Again */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            Building Again: The Joy Returns
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              In the last five months, while still working my day job, I've become a one-person studio. I've built 
              <a 
              href="https://jamiewatters.work/portfolio" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-secondary hover:text-brand-secondary-hover underline font-semibold"
              >5 apps, 4 websites, 4 agent suites</a>, and a market-leading 
              AI SEO framework. No employees, no investors, no offices—just vision, discipline, and an army of AI 
              assistants I've learned to orchestrate.
            </p>
            <p>
              Every morning I wake up excited about what I'm going to build. The immediate feedback loop is back—idea, 
              implementation, result. But now it's amplified by AI that can execute the tedious parts while I focus 
              on strategy, architecture, and creative problem-solving.
            </p>
            <blockquote className="border-l-4 border-brand-secondary bg-bg-surface p-6 my-8 italic text-body-lg">
              "For the first time in twenty years, I'm having fun again. I'm alive again. I'm doing work that matters."
            </blockquote>
          </div>
        </div>

        {/* The Mission */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            The Mission: Building in Public, Inspiring Others
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              My story isn't just about career pivots or technological disruption. It's about how our deepest fears 
              can become our greatest opportunities, how the longest way around can be the shortest way home, and how 
              it's never too late to reclaim what makes you feel most alive.
            </p>
            <p>
              I'm building in public to show that the very thing you're running from might be exactly what you need 
              to run toward. If someone who spent 20 years afraid of being left behind by technology can now orchestrate 
              AI to build at unprecedented scale, then what's possible for you?
            </p>
            <div className="bg-bg-surface border border-border-default rounded-lg p-8 my-8">
              <h3 className="text-body-xl font-semibold text-text-primary mb-4">Key Lessons Learned</h3>
              <ul className="space-y-3 text-body text-text-primary">
                <li className="flex items-start gap-3">
                  <span className="text-brand-primary font-bold">•</span>
                  <span><strong>The longest way around became the shortest way home</strong> - My detour through management gave me strategic thinking that AI can't replicate</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-primary font-bold">•</span>
                  <span><strong>Your biggest fear might be your greatest opportunity</strong> - The cognitive challenges I feared became AI's strength</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-primary font-bold">•</span>
                  <span><strong>Experience + AI = Unprecedented leverage</strong> - Decades of context make AI orchestration possible</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-brand-primary font-bold">•</span>
                  <span><strong>It's never too late to reclaim your passion</strong> - What made you feel alive once can make you feel alive again</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="mb-16">
          <h2 className="text-display-md font-semibold text-text-primary mb-8 border-b border-border-default pb-4">
            What's Next: The Future is Being Built
          </h2>
          <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
            <p>
              My goal is audacious: reach $1 billion in portfolio value by 2030. Not through a single unicorn startup, 
              but through a diversified portfolio of 10-20 AI-powered businesses, each generating $5-50M ARR.
            </p>
            <p>
              This isn't just about the money. It's about proving a new model of entrepreneurship is possible. 
              We're at the dawn of the AI era, and I believe the future belongs to solo operators who can orchestrate 
              intelligent systems to build at unprecedented scale.
            </p>
            <p>
              Every step of this journey is documented transparently. Every win, every failure, every lesson learned—all 
              shared publicly. Because if I can show the playbook, others can replicate and surpass what I'm doing. 
              That's the real goal.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="px-6 pb-16 sm:pb-24 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-lg p-8 sm:p-12 text-center">
          <h2 className="text-display-md font-semibold text-text-primary mb-6">
            Join the Journey
          </h2>
          <p className="text-body-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Whether you're facing your own career transition, wrestling with technological change, or simply 
            curious about what's possible when experience meets AI—I'd love to have you along for the ride.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button variant="primary" size="lg" asChild>
              <Link href="/journey">
                Follow My Progress →
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/portfolio">
                See What I'm Building
              </Link>
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-8">
            <a
              href="https://twitter.com/jamiewatters"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on Twitter"
              className="text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <Twitter className="w-8 h-8" />
            </a>
            <a
              href="https://linkedin.com/in/jamiewatters"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on LinkedIn"
              className="text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <Linkedin className="w-8 h-8" />
            </a>
            <a
              href="https://github.com/TheWayWithin"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on GitHub"
              className="text-brand-primary hover:text-brand-primary-hover transition-colors"
            >
              <Github className="w-8 h-8" />
            </a>
          </div>

          {/* Contact */}
          <div>
            <a
              href="mailto:jamie@jamiewatters.work"
              className="text-body-lg text-brand-secondary hover:underline inline-flex items-center gap-2"
            >
              <Mail className="w-5 h-5" />
              jamie@jamiewatters.work
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}