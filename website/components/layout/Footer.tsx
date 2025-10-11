import Link from 'next/link';
import { Twitter, Linkedin, Github, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/journey', label: 'The Journey' },
    { href: '/about', label: 'About' },
  ];

  const socialLinks = [
    {
      href: 'https://twitter.com/jamiewatters',
      label: 'Twitter',
      icon: Twitter,
    },
    {
      href: 'https://linkedin.com/in/jamiewatters',
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
  ];

  return (
    <footer
      className="bg-bg-primary border-t border-border-subtle py-16 lg:py-20"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
              Building $1B Solo by 2030
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

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center">
          <p className="text-body-sm text-text-tertiary">
            © {currentYear} Jamie Watters. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
