'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/blog', label: 'Blog' },
    { href: '/dashboard', label: 'Dashboard' },
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

      <header className="sticky top-0 z-50 bg-bg-primary/95 border-b border-border-subtle backdrop-blur-lg supports-[backdrop-filter]:bg-bg-primary/80">
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
        <>
          {/* Background Overlay */}
          <div 
            className="md:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Content */}
          <div className="md:hidden fixed inset-0 top-16 bg-bg-primary border-t border-border-default shadow-2xl z-40 animate-in slide-in-from-top-2 duration-300">
            <nav
              className="flex flex-col p-8 space-y-2"
              aria-label="Mobile navigation"
            >
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-body-lg font-medium text-text-primary hover:text-brand-primary transition-all duration-200 py-4 px-4 rounded-lg hover:bg-bg-surface/50 border-b border-border-subtle last:border-b-0"
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/about"
              className="bg-brand-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-brand-primary-hover transition-all duration-200 text-center mt-6 shadow-lg hover:shadow-xl"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            </nav>
          </div>
        </>
      )}
      </header>
    </>
  );
}
