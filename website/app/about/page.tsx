import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSEOMetadata } from '@/lib/seo';

export const metadata = getSEOMetadata({
  title: 'About Jamie Watters',
  description:
    'A systems programmer who learned to code at the metal, lost the thread in management, and got his first love handed back by AI. Building in public and betting on cognitive sovereignty.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Page Header with Profile Photo */}
      <section className="px-6 pt-12 pb-8 sm:pt-16 sm:pb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-display-xl sm:text-display-xl font-bold text-text-primary mb-12">
          About Jamie
        </h1>

        {/* Profile Photo */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80">
            <Image
              src="/images/jamie-profile.jpg"
              alt="Jamie Watters at South Street Seaport"
              fill
              className="object-cover rounded-lg border border-border-default"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 pb-12 sm:pb-16 max-w-3xl mx-auto">
        <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
          <p>
            There was one computer in my school. A Research Machines 380Z, kept in its own room
            like a holy relic. I talked my way in front of it and wrote BASIC games, and the thing
            that hooked me wasn't the games. It was the loop. Type a line, run it, watch it do
            exactly what I told it or fail in a way that was entirely my fault. Honest feedback.
            I have been chasing that loop ever since.
          </p>
          <p>
            I got a VIC-20 and the obsession set hard. When I left school I took a job in the
            computer room at Sperry Univac, mostly because it was the closest I could get to the
            machines. I talked my way into a trainee operator role, then into systems programming:
            writing operating systems, file handlers, real-time transaction systems for banks, all
            in assembler. I earned a computing degree along the way. It was pure joy.
          </p>
          <p>
            This was before the abstractions arrived. No relational databases. No debuggers. No
            full-screen editors, so we wrote our own, because there wasn't one to buy. You worked
            close to the metal because there was nowhere else to stand.
          </p>
          <p>
            I rode the changes as they came. I sat next to programmers who had written assembler
            for twenty-five-year careers, and I watched the ground shift under all of us: assembler
            to C to C++, hierarchical database handlers to relational. I kept up fine.
          </p>
          <p>
            Then I got scared. I was in my thirties and keeping up, but only just. I had watched
            languages turn over faster than the people using them, and I could see where it ended:
            well before fifty I'd be cooked, no longer writing the real thing, just dragging and
            dropping other people's components. The joy would be gone. So I retreated into
            management, on the theory that people change more slowly than syntax. Twenty years of the
            conventional kind of success followed. Good title, good money, and something quiet died
            in the middle of it. The loop was gone. I had stopped living in the gap between effort
            and outcome and started managing it from a distance.
          </p>
          <p>Then AI handed my first love back.</p>
          <p>
            It carries the cognitive load I was afraid of, and I supply what it can't: vision,
            discipline, the judgement of what's worth building in the first place. The thing I had
            written off as obsolete, my old-school engineering discipline and the strategic thinking
            the management years gave me, turned out to be the missing piece. I am more creative now,
            past fifty, than I was in my twenties. One person, a studio, building in public.
          </p>
        </div>

        <hr className="my-12 border-border-default" />

        <div className="space-y-6 text-body-lg text-text-primary leading-relaxed">
          <p>
            This is the part of the page that used to promise you a billion-pound portfolio and a
            stack of AI businesses by 2030. I have killed that goal. Not because it was too
            ambitious. Because it was the wrong shape.
          </p>
          <p>
            Here is what changed my mind. Hundreds of millions of people now get their understanding
            of the world from a handful of similarly-trained models. The advice comes back confident,
            reasonable, and identical for everyone. When the machine hands the whole crowd the same
            play, the play stops paying. The range of what people think is narrowing toward one
            moderate, conviction-free answer, and in that world the scarce thing, the only defensible
            thing, is the ability to keep your own mind. Sovereign first-person judgement, grounded
            in real depth. I call it cognitive sovereignty, and I think it is the bet worth making.
          </p>
          <p>
            I am an odd fit to make it, which is exactly the point. I learned to code at the metal
            while the rest of the world abstracted upward into vibe-coded slop, and I kept the
            discipline. I wrote what was, for its first few years, the best-selling book on business
            continuity in the world, so I know precisely how a monoculture fails: quietly, then all at once, everyone together. And I
            teach mindfulness and I coach, so the inner half of "keep your own mind" isn't a metaphor
            to me. Three different lives, one pattern underneath them: the depth that each new
            abstraction layer quietly erased, and that I happened to hang on to.
          </p>
          <p>
            So I am not building an empire. I am building a body of work, in the open. I build things
            to learn, not to sell, and I give the code away. I share what worked, what didn't, and
            why, including the products I have killed off in full public view. The value was never
            the software. It is the judgement and the trust, and those only compound if I show my
            working.
          </p>
          <p>
            If you want a number, here is the audacious one: a million people who trust me as their
            primary source for making sense of AI. Not followers. Not vanity metrics. People who have
            checked my numbers, used my tools, and decided the signal was worth the subscription. I
            am starting from roughly none of those, with a full-time bank job, which is either bold
            or daft. Probably both. The target points me in a direction. The practice is what makes
            it durable: ride the wave, learn what's real, share it honestly.
          </p>
          <p>
            If I recommend it, I am using it. If it failed, you will hear about the failure before
            you hear about the win. My code is open for you to check. That is the whole offer.
          </p>
          <p>
            I am in the water. If you would rather learn from someone actually riding the wave than
            someone selling theory from the beach, stay a while. I will tell you what's working
            before you waste the time finding out yourself.
          </p>
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
                href="https://x.com/Jamie_within"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on X"
                className="text-brand-primary hover:text-brand-primary-hover transition-colors"
              >
                <Twitter className="w-12 h-12" />
              </a>
              <a
                href="https://linkedin.com/in/jamie-watters-solo"
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
