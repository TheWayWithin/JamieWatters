'use client';

import { useState, useEffect } from 'react';

interface ActivityItem {
  timestamp: string;
  action: string;
  type: 'content' | 'social' | 'outreach' | 'development' | 'document' | 'other';
  source?: string;
}

interface ActivityFeedResponse {
  activities: ActivityItem[];
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/activity', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.status}`);
      }

      const data: ActivityFeedResponse = await response.json();
      setActivities(data.activities || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content':
        return '📝';
      case 'social':
        return '🐦';
      case 'outreach':
        return '✉️';
      case 'development':
        return '🔧';
      case 'document':
        return '📄';
      default:
        return '⚡';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'content':
        return 'Content';
      case 'social':
        return 'Social';
      case 'outreach':
        return 'Outreach';
      case 'development':
        return 'Development';
      case 'document':
        return 'Document';
      default:
        return 'Other';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins < 1 ? 'Just now' : `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(date);
      }
    } catch (err) {
      return timestamp;
    }
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const uniqueTypes = Array.from(new Set(activities.map(a => a.type)));

  if (loading) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          ⚡ Activity
        </h3>
        <p className="text-body text-text-secondary">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h3 className="text-title-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          ⚡ Activity
        </h3>
        <div className="bg-error/10 border border-error/20 rounded-md p-3">
          <p className="text-error text-body-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title-lg font-semibold text-text-primary flex items-center gap-2">
          ⚡ Activity
        </h3>
        <button
          onClick={fetchActivity}
          className="text-brand-primary hover:text-brand-secondary text-body-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Type Filter */}
      {uniqueTypes.length > 1 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                  : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-primary hover:text-text-secondary'
              }`}
            >
              All
            </button>
            {uniqueTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2 py-1 text-xs font-medium rounded-full transition-colors flex items-center gap-1 ${
                  filter === type
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                    : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-primary hover:text-text-secondary'
                }`}
              >
                <span>{getTypeIcon(type)}</span>
                <span>{getTypeLabel(type)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {filteredActivities.length === 0 ? (
          <p className="text-body text-text-secondary">
            {filter === 'all' ? 'No recent activity found.' : `No ${getTypeLabel(filter).toLowerCase()} activity found.`}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-bg-primary transition-colors">
                <span className="text-lg mt-0.5 flex-shrink-0">
                  {getTypeIcon(activity.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-text-primary line-clamp-2">
                    {activity.source || activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-body-xs text-text-tertiary">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}