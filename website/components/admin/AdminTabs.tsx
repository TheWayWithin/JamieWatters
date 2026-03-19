'use client';

import { useState, useEffect } from 'react';
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

/* ---- Top-level admin tabs (with emojis) ---- */
const TOP_TABS: Tab[] = [
  { id: 'mission-control', label: 'Mission Control', href: '/admin', icon: '🎛️' },
  { id: 'content',         label: 'Content',         href: '/admin/content', icon: '✍️' },
  { id: 'projects',        label: 'Projects',        href: '/admin/projects', icon: '🚀' },
  { id: 'settings',        label: 'Settings',        href: '/admin/settings', icon: '⚙️' },
];

/* ---- Mission Control sub-tabs (V2) ---- */
const MC_TABS: Tab[] = [
  { id: 'command',   label: 'Command',    href: '/admin',            icon: '📊' },
  { id: 'goals',     label: 'Goals',      href: '/admin/goals',      icon: '🎯' },
  { id: 'hitl',      label: 'HITL Queue', href: '/admin/hitl',       icon: '🔴' },
  { id: 'execution', label: 'Execution',  href: '/admin/execution',  icon: '⚡' },
  { id: 'portfolio', label: 'Portfolio',   href: '/admin/portfolio',  icon: '💼' },
  { id: 'agents',    label: 'Agents',     href: '/admin/agents',     icon: '🤖' },
  { id: 'audit',     label: 'Audit',      href: '/admin/audit',      icon: '📋' },
];

/* ---- Which MC paths are considered "Mission Control" ---- */
const MC_PATHS = ['/admin/goals', '/admin/hitl', '/admin/execution', '/admin/portfolio', '/admin/agents', '/admin/audit', '/admin/mission-control'];

function resolveTopTab(path: string): string {
  if (path.startsWith('/admin/content')) return 'content';
  if (path.startsWith('/admin/projects')) return 'projects';
  if (path.startsWith('/admin/settings')) return 'settings';
  return 'mission-control';
}

function resolveMcTab(path: string): string {
  if (path === '/admin' || path === '/admin/') return 'command';
  if (path.startsWith('/admin/goals')) return 'goals';
  if (path.startsWith('/admin/hitl')) return 'hitl';
  if (path.startsWith('/admin/execution')) return 'execution';
  if (path.startsWith('/admin/portfolio')) return 'portfolio';
  if (path.startsWith('/admin/agents')) return 'agents';
  if (path.startsWith('/admin/audit')) return 'audit';
  if (path.startsWith('/admin/mission-control')) return 'command';
  return 'command';
}

export function AdminTabs({ currentPath }: AdminTabsProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hitlCount, setHitlCount] = useState(0);

  const activeTopTab = resolveTopTab(currentPath);
  const activeMcTab = resolveMcTab(currentPath);
  const showMcTabs = activeTopTab === 'mission-control';

  // Fetch HITL badge count
  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch('/api/admin/hitl?status=open');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setHitlCount(Array.isArray(data) ? data.length : 0);
        }
      } catch { /* silent */ }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return (
    <>
      {/* ===== DESKTOP ===== */}
      {/* Top-level tabs */}
      <div className="hidden md:block border-b border-border-subtle bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1">
            {TOP_TABS.map((tab) => {
              const isActive = activeTopTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-body font-medium border-b-2 transition-all
                    ${isActive
                      ? 'border-brand-primary text-brand-primary bg-bg-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                    }
                  `}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {/* HITL count badge on Mission Control tab */}
                  {tab.id === 'mission-control' && hitlCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white min-w-[18px]">
                      {hitlCount > 99 ? '99+' : hitlCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MC sub-tabs (only when Mission Control is active) */}
      {showMcTabs && (
        <div className="hidden md:block border-b border-border-subtle">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1">
              {MC_TABS.map((tab) => {
                const isActive = activeMcTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`
                      flex items-center gap-1.5 px-4 py-3 text-body-sm font-medium border-b-2 transition-all
                      ${isActive
                        ? 'border-brand-primary text-brand-primary'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.id === 'hitl' && hitlCount > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white min-w-[18px]">
                        {hitlCount > 99 ? '99+' : hitlCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ===== MOBILE ===== */}
      <div className="md:hidden border-b border-border-subtle bg-bg-surface">
        <div className="px-6 py-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-between w-full text-body font-medium text-text-primary"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">
                {TOP_TABS.find((t) => t.id === activeTopTab)?.icon}
              </span>
              <span>{TOP_TABS.find((t) => t.id === activeTopTab)?.label}</span>
              {hitlCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white min-w-[18px]">
                  {hitlCount}
                </span>
              )}
            </span>
            <span className="text-xl transition-transform" style={{
              transform: mobileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>
              ▼
            </span>
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-border-subtle">
            {TOP_TABS.map((tab) => {
              const isActive = activeTopTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-6 py-4 text-body border-l-4 transition-all
                    ${isActive
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

      {/* Mobile MC sub-tabs (horizontal scroll when MC is active) */}
      {showMcTabs && (
        <div className="md:hidden border-b border-border-subtle overflow-x-auto">
          <div className="flex gap-1 px-4 py-1 min-w-max">
            {MC_TABS.map((tab) => {
              const isActive = activeMcTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`
                    flex items-center gap-1 px-3 py-2 text-body-sm font-medium rounded-md transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-bg-primary text-brand-primary'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                  style={{ minHeight: '44px' }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === 'hitl' && hitlCount > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white min-w-[18px]">
                      {hitlCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
