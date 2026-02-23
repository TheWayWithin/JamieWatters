'use client';

import type { AgentInfo, AgentStatusType } from './types';

const STATUS_CONFIG: Record<AgentStatusType, { label: string; dot: string; border: string }> = {
  active: { label: 'Active', dot: 'bg-green-500 animate-pulse', border: 'border-l-green-500' },
  idle: { label: 'Idle', dot: 'bg-amber-400', border: 'border-l-amber-400' },
  offline: { label: 'Offline', dot: 'bg-gray-400', border: 'border-l-gray-400' },
  error: { label: 'Error', dot: 'bg-red-500', border: 'border-l-red-500' },
};

const AGENT_ICONS: Record<string, string> = {
  strategist: '\uD83C\uDFAF',
  developer: '\uD83D\uDCBB',
  tester: '\uD83E\uDDEA',
  operator: '\u2699\uFE0F',
  architect: '\uD83C\uDFD7\uFE0F',
  designer: '\uD83C\uDFA8',
  documenter: '\uD83D\uDCDD',
  support: '\uD83C\uDF1F',
  analyst: '\uD83D\uDCCA',
  marketer: '\uD83D\uDCE3',
  coordinator: '\uD83C\uDF96\uFE0F',
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function AgentCard({ agent }: { agent: AgentInfo }) {
  const config = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline;
  const icon = AGENT_ICONS[agent.agentId] || '\uD83E\uDD16';

  return (
    <div className={`rounded-lg border border-border-default border-l-4 bg-bg-surface p-4 ${config.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <div>
            <h4 className="text-body-sm font-semibold text-text-primary">{agent.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block h-2 w-2 rounded-full ${config.dot}`} />
              <span className="text-body-xs text-text-secondary">{config.label}</span>
            </div>
          </div>
        </div>

        <span className="shrink-0 rounded bg-bg-tertiary px-1.5 py-0.5 text-body-xs text-text-tertiary">
          {agent.model}
        </span>
      </div>

      {/* Current task */}
      <div className="mt-3">
        <p className="text-body-xs text-text-secondary line-clamp-2">
          {agent.currentTask || 'No active task'}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-3 flex items-center justify-between text-body-xs">
        <div className="flex items-center gap-3">
          <span className="text-text-primary font-semibold">{agent.tasksThisWeek}</span>
          <span className="text-text-tertiary">tasks/week</span>
        </div>
        <div className="flex items-center gap-3 text-text-tertiary">
          <span>{agent.machine}</span>
          <span>{formatRelativeTime(agent.lastActiveAt)}</span>
        </div>
      </div>
    </div>
  );
}
