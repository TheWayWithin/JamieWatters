'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/journey', label: 'The Journey' },
    { href: '/about', label: 'About' },
  ];

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 bg-bg-primary border-b border-border-subtle backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-bold text-xl text-brand-primary hover:text-brand-primary-hover transition-base"
          >
            Jamie Watters
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body font-medium text-text-secondary hover:text-text-primary transition-base"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="bg-brand-primary text-white px-6 py-2 rounded-md font-semibold hover:bg-brand-primary-hover transition-base"
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-primary hover:text-brand-primary transition-base"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-bg-surface z-40">
          <nav
            className="flex flex-col p-6 space-y-4"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-lg font-medium text-text-secondary hover:text-text-primary transition-base py-3 border-b border-border-subtle"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="bg-brand-primary text-white px-6 py-3 rounded-md font-semibold hover:bg-brand-primary-hover transition-base text-center mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
      </header>
    </>
  );
}
