'use client';

import { useState, useEffect } from 'react';
import { PortfolioOverview } from './components/PortfolioOverview';
import { SprintView } from './components/SprintView';
import { ScheduledTasks } from './components/ScheduledTasks';
import { TaskList } from './components/TaskList';
import { MemoryBrowser } from './components/MemoryBrowser';
import { ActivityFeed } from './components/ActivityFeed';

export default function MissionControlPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-display-md font-bold text-text-primary mb-4">
            🎛️ Mission Control
          </h2>
          <p className="text-body text-text-secondary">Loading dashboard...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-display-md font-bold text-text-primary mb-4">
            🎛️ Mission Control
          </h2>
          <div className="bg-error/10 border border-error/20 rounded-lg p-4">
            <p className="text-error font-medium">Error loading dashboard</p>
            <p className="text-error/80 text-body-sm mt-1">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-display-md font-bold text-text-primary mb-4">
          🎛️ Mission Control
        </h2>
        <p className="text-body text-text-secondary">
          Portfolio dashboard -- products, sprint, tasks, and agent activity
        </p>
      </div>

      {/* Portfolio Overview - Full Width */}
      <div className="bg-bg-surface border border-border-default rounded-lg mb-6">
        <PortfolioOverview />
      </div>

      {/* Current Sprint - Full Width */}
      <div className="bg-bg-surface border border-border-default rounded-lg mb-6">
        <SprintView />
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Scheduled Tasks */}
        <div className="bg-bg-surface border border-border-default rounded-lg">
          <ScheduledTasks />
        </div>

        {/* Task List */}
        <div className="bg-bg-surface border border-border-default rounded-lg">
          <TaskList />
        </div>
      </div>

      {/* Memory and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Browser */}
        <div className="bg-bg-surface border border-border-default rounded-lg">
          <MemoryBrowser />
        </div>

        {/* Activity Feed */}
        <div className="bg-bg-surface border border-border-default rounded-lg">
          <ActivityFeed />
        </div>
      </div>
    </section>
  );
}