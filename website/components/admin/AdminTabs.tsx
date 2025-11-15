'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AdminTabsProps {
  currentPath: string;
}

interface Tab {
  id: string;
  label: string;
  href: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'content', label: 'Content', href: '/admin/content', icon: '✍️' },
  { id: 'projects', label: 'Projects', href: '/admin/projects', icon: '🚀' },
  { id: 'metrics', label: 'Metrics', href: '/admin/metrics', icon: '📊' },
  { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export function AdminTabs({ currentPath }: AdminTabsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine active tab based on current path
  const getActiveTab = (path: string) => {
    if (path.startsWith('/admin/content')) return 'content';
    if (path.startsWith('/admin/projects')) return 'projects';
    if (path.startsWith('/admin/metrics')) return 'metrics';
    if (path.startsWith('/admin/settings')) return 'settings';
    return 'content'; // Default to content
  };

  const activeTab = getActiveTab(currentPath);

  return (
    <>
      {/* Desktop Tabs */}
      <div className="hidden md:block border-b border-border-subtle bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-body font-medium border-b-2 transition-all
                    ${
                      isActive
                        ? 'border-brand-primary text-brand-primary bg-bg-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden border-b border-border-subtle bg-bg-surface">
        <div className="px-6 py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-between w-full text-body font-medium text-text-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">
                {tabs.find((t) => t.id === activeTab)?.icon}
              </span>
              <span>{tabs.find((t) => t.id === activeTab)?.label}</span>
            </span>
            <span className="text-xl transition-transform" style={{
              transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <nav className="border-t border-border-subtle">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-body border-l-4 transition-all
                    ${
                      isActive
                        ? 'border-brand-primary text-brand-primary bg-bg-primary font-medium'
                        : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}
