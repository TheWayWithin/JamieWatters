'use client';

import { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

interface Event {
  id: string;
  timestamp: string;
  actor: string;
  entity: string;
  entityId: string;
  action: string;
  fromValue: string | null;
  toValue: string | null;
  reason: string | null;
  project: string | null;
}

const ENTITY_COLORS: Record<string, string> = {
  task: 'text-blue-400',
  project: 'text-purple-400',
  goal: 'text-green-400',
  hitl: 'text-amber-400',
  decision: 'text-cyan-400',
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

export default function AuditPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filterActor, setFilterActor] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterSince, setFilterSince] = useState('');
  const [search, setSearch] = useState('');
  const limit = 50;

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (filterActor) params.set('actor', filterActor);
      if (filterEntity) params.set('entity', filterEntity);
      if (filterSince) params.set('since', new Date(filterSince).toISOString());
      const res = await fetch(`/api/admin/events?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [offset, filterActor, filterEntity, filterSince]);

  useEffect(() => {
    setLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  // Get unique actors from current results for filter
  const actors = [...new Set(events.map((e) => e.actor))];

  // Client-side T-id search
  const filtered = search
    ? events.filter((e) => e.entityId.toLowerCase().includes(search.toLowerCase()) || e.actor.toLowerCase().includes(search.toLowerCase()))
    : events;

  if (loading && events.length === 0) {
    return <div className="p-6 max-w-7xl mx-auto"><p className="text-text-secondary">Loading audit timeline...</p></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-display-sm font-bold text-text-primary">Audit Timeline</h1>
        <span className="text-body-sm text-text-secondary">{total} events</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search T-id or actor..."
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary w-48"
        />
        <select
          value={filterActor}
          onChange={(e) => { setFilterActor(e.target.value); setOffset(0); }}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All actors</option>
          {actors.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={filterEntity}
          onChange={(e) => { setFilterEntity(e.target.value); setOffset(0); }}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
        >
          <option value="">All entities</option>
          <option value="task">Task</option>
          <option value="project">Project</option>
          <option value="goal">Goal</option>
          <option value="hitl">HITL</option>
          <option value="decision">Decision</option>
        </select>
        <input
          type="date"
          value={filterSince}
          onChange={(e) => { setFilterSince(e.target.value); setOffset(0); }}
          className="bg-bg-surface border border-border-default rounded-md px-3 py-1.5 text-body-sm text-text-primary"
          title="Show events since this date"
        />
        {filterSince && (
          <button
            onClick={() => { setFilterSince(''); setOffset(0); }}
            className="text-body-sm text-text-secondary hover:text-text-primary"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Event Stream */}
      {filtered.length === 0 ? (
        <div className="bg-bg-surface border border-border-default rounded-lg p-8 text-center">
          <p className="text-text-secondary">No events found. Awaiting first sync.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-default rounded-lg divide-y divide-border-subtle">
          {filtered.map((event, idx) => {
            // Show date header when date changes
            const showDate = idx === 0 || formatDate(event.timestamp) !== formatDate(filtered[idx - 1].timestamp);
            return (
              <div key={event.id}>
                {showDate && (
                  <div className="px-4 py-2 bg-bg-primary text-[11px] font-medium text-text-secondary">
                    {formatDate(event.timestamp)}
                  </div>
                )}
                <div className="px-4 py-3 flex items-start gap-3 hover:bg-bg-primary transition-colors">
                  <span className="text-[11px] text-text-secondary font-mono shrink-0 mt-0.5 w-10">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className="text-body-sm font-medium text-text-primary shrink-0 w-20 truncate">
                    {event.actor}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-body-sm">
                      <span className={`font-mono ${ENTITY_COLORS[event.entity] || 'text-text-secondary'}`}>
                        {event.entityId}
                      </span>
                      {' '}
                      <span className="text-text-secondary">
                        {event.action.replace(/_/g, ' ')}
                      </span>
                      {event.fromValue && event.toValue && (
                        <span className="text-text-secondary">
                          {' '}{event.fromValue} → {event.toValue}
                        </span>
                      )}
                    </span>
                    {event.project && (
                      <span className="text-[11px] text-text-secondary ml-2">· {event.project}</span>
                    )}
                    {event.reason && (
                      <p className="text-[11px] text-text-secondary mt-0.5">{event.reason}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 text-body-sm bg-bg-surface border border-border-default rounded-md disabled:opacity-30 hover:bg-bg-primary"
            style={{ minHeight: '44px' }}
          >
            Previous
          </button>
          <span className="text-body-sm text-text-secondary">
            {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= total}
            className="px-4 py-2 text-body-sm bg-bg-surface border border-border-default rounded-md disabled:opacity-30 hover:bg-bg-primary"
            style={{ minHeight: '44px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
