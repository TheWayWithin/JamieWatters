import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail, Coffee } from 'lucide-react';
import { NewsletterSignup } from '../newsletter/NewsletterSignup';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const showSignup = !!process.env.BUTTONDOWN_API_KEY;

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/journey', label: 'The Journey' },
    { href: '/about', label: 'About' },
  ];

  const socialLinks = [
    {
      href: 'https://x.com/Jamie_within',
      label: 'X',
      icon: Twitter,
    },
    {
      href: 'https://www.linkedin.com/in/jamie-watters-solo',
      label: 'LinkedIn',
      icon: Linkedin,
    },
    {
      href: 'https://github.com/TheWayWithin',
      label: 'GitHub',
      icon: Github,
    },
    {
      href: 'mailto:jamie@jamiewatters.work',
      label: 'Email',
      icon: Mail,
    },
    {
      href: 'https://buymeacoffee.com/jamiewatters',
      label: 'Buy Me a Coffee',
      icon: Coffee,
    },
  ];

  return (
    <footer
      className="bg-bg-primary border-t border-border-subtle py-16 lg:py-20"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {showSignup && (
          <div className="mb-12 pb-12 border-b border-border-subtle max-w-xl">
            <NewsletterSignup variant="footer" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div>
            <Link
              href="/"
              className="font-bold text-xl text-brand-primary hover:text-brand-primary-hover transition-base inline-block mb-4"
            >
              Jamie Watters
            </Link>
            <p className="text-body-sm text-text-secondary">
              Open code, real numbers, the failures before the wins.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-body text-text-primary mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-text-secondary hover:text-brand-secondary transition-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-body text-text-primary mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-brand-primary transition-base"
                    aria-label={social.label}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Transparency + copyright */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center space-y-3">
          <p className="text-body-sm text-text-tertiary max-w-2xl mx-auto">
            How this site works: I write every post myself, with AI assisting the research,
            drafting and code. No sponsors, no paid placements, and no affiliate links unless a
            post says so in plain sight. The site&apos;s code is open on{' '}
            <a
              href="https://github.com/TheWayWithin/JamieWatters"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-brand-secondary transition-base"
            >
              GitHub
            </a>
            .
          </p>
          <p className="text-body-sm text-text-tertiary">
            © {currentYear} Jamie Watters. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
