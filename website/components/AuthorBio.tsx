import Image from 'next/image';

/**
 * Reusable author block for inner pages (journey posts, portfolio).
 * One honest home for outbound references: the claims mirror the homepage
 * "receipts" section and each link is a real, checkable source. Keep the
 * claims and links in step with app/page.tsx if either changes.
 */

const linkClass =
  'underline underline-offset-4 decoration-border-default hover:text-brand-secondary transition-base';

export function AuthorBio({ heading = 'About the author' }: { heading?: string }) {
  return (
    <aside className="bg-bg-surface border border-border-default rounded-lg p-6 sm:p-8">
      <div className="flex items-start gap-4 sm:gap-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Image
            src="/images/jamie-profile.jpg"
            alt="Jamie Watters"
            fill
            sizes="80px"
            className="object-cover rounded-full border border-border-default"
          />
        </div>
        <div>
          <h2 className="text-body font-semibold text-text-primary mb-2">{heading}</h2>
          <p className="text-body-sm text-text-secondary leading-relaxed">
            Jamie Watters has been programming since 1985, starting in mainframe assembler. He
            wrote the best-selling book on{' '}
            <a
              href="https://en.wikipedia.org/wiki/Business_continuity_planning"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              business continuity
            </a>{' '}
            in the world for its first few years, teaches{' '}
            <a
              href="https://www.headless.org"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              The Headless Way
            </a>
            , and now builds AI products solo with the code open on{' '}
            <a
              href="https://github.com/TheWayWithin"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </aside>
  );
}
