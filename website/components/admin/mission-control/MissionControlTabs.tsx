'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, Suspense } from 'react';
import TabPlaceholder from './TabPlaceholder';
import TabErrorBoundary from './TabErrorBoundary';
import OverviewTab from './OverviewTab';
import KanbanTab from './KanbanTab';
import GoalsTab from './GoalsTab';
import ProjectsTab from './ProjectsTab';
import IssuesTab from './IssuesTab';
import AgentsTab from './AgentsTab';

interface TabConfig {
  id: string;
  label: string;
  icon: string;
  available: boolean;
  comingSprint?: number;
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '\uD83C\uDFE0', available: true },
  { id: 'goals', label: 'Goals', icon: '\uD83C\uDFAF', available: true },
  { id: 'kanban', label: 'Kanban', icon: '\uD83D\uDCCB', available: true },
  { id: 'projects', label: 'Projects', icon: '\uD83D\uDCE6', available: true },
  { id: 'issues', label: 'Issues', icon: '\u26A0\uFE0F', available: true },
  { id: 'agents', label: 'Agents', icon: '\uD83E\uDD16', available: true },
];

const STORAGE_KEY = 'mc-active-tab';
const DEFAULT_TAB = 'overview';

function MissionControlTabsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Resolve the active tab: URL param > localStorage > default
  const resolveInitialTab = useCallback((): string => {
    const urlTab = searchParams.get('tab');
    if (urlTab && TAB_CONFIG.some((t) => t.id === urlTab)) {
      return urlTab;
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TAB_CONFIG.some((t) => t.id === stored)) {
        return stored;
      }
    }
    return DEFAULT_TAB;
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TAB);

  // Sync state from URL on mount and when searchParams change
  useEffect(() => {
    setActiveTab(resolveInitialTab());
  }, [resolveInitialTab]);

  // Persist to localStorage whenever activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, activeTab);
    }
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      // Update URL without pushing to history
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tabId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const activeConfig = TAB_CONFIG.find((t) => t.id === activeTab) || TAB_CONFIG[0];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = TAB_CONFIG.findIndex((t) => t.id === activeTab);
      let nextIndex = -1;

      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % TAB_CONFIG.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + TAB_CONFIG.length) % TAB_CONFIG.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = TAB_CONFIG.length - 1;
      }

      if (nextIndex >= 0) {
        e.preventDefault();
        handleTabChange(TAB_CONFIG[nextIndex].id);
        // Focus the newly active tab button
        const tabEl = document.getElementById(`mc-tab-${TAB_CONFIG[nextIndex].id}`);
        tabEl?.focus();
      }
    },
    [activeTab, handleTabChange]
  );

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case 'overview': return <OverviewTab />;
        case 'goals': return <GoalsTab />;
        case 'kanban': return <KanbanTab />;
        case 'projects': return <ProjectsTab />;
        case 'issues': return <IssuesTab />;
        case 'agents': return <AgentsTab />;
        default: return null;
      }
    })();

    if (!activeConfig.available) {
      return <TabPlaceholder tabName={activeConfig.label} comingSprint={activeConfig.comingSprint} />;
    }

    return (
      <TabErrorBoundary tabName={activeConfig.label}>
        {content}
      </TabErrorBoundary>
    );
  };

  return (
    <div>
      {/* Sticky sub-tab bar */}
      <div className="sticky top-0 z-10 border-b border-border-default bg-bg-primary">
        <div
          className="-mb-px flex overflow-x-auto"
          role="tablist"
          aria-label="Mission Control tabs"
          onKeyDown={handleKeyDown}
        >
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              id={`mc-tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`mc-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-body-sm whitespace-nowrap
                border-b-2 transition-colors duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-inset
                ${
                  activeTab === tab.id
                    ? 'border-brand-primary text-text-primary font-medium'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
                }
              `}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`mc-panel-${activeTab}`}
        aria-labelledby={`mc-tab-${activeTab}`}
        tabIndex={0}
      >
        {renderTabContent()}
      </div>
    </div>
  );
}

export default function MissionControlTabs() {
  return (
    <Suspense
      fallback={
        <div className="border-b border-border-default bg-bg-primary">
          <div className="flex gap-4 px-4 py-3">
            {TAB_CONFIG.map((tab) => (
              <div
                key={tab.id}
                className="h-5 w-20 animate-pulse rounded bg-border-subtle"
              />
            ))}
          </div>
        </div>
      }
    >
      <MissionControlTabsInner />
    </Suspense>
  );
}
