'use client';

interface TabPlaceholderProps {
  tabName: string;
  comingSprint?: number;
}

const TAB_DESCRIPTIONS: Record<string, string> = {
  Goals:
    'Set quarterly OKRs, track key results, and align project milestones with your strategic vision.',
  Projects:
    'Deep-dive into individual project health, dependencies, and resource allocation across your portfolio.',
  Issues:
    'Track bugs, blockers, and technical debt across all projects with priority-based triage.',
  Agents:
    'Monitor AI agent activity, review delegation history, and manage agent configurations.',
};

const TAB_ICONS: Record<string, string> = {
  Goals: '\uD83C\uDFAF',
  Projects: '\uD83D\uDCE6',
  Issues: '\u26A0\uFE0F',
  Agents: '\uD83E\uDD16',
};

export default function TabPlaceholder({ tabName, comingSprint }: TabPlaceholderProps) {
  const icon = TAB_ICONS[tabName] || '\uD83D\uDEA7';
  const description =
    TAB_DESCRIPTIONS[tabName] || `The ${tabName} tab is under development.`;

  return (
    <div className="flex items-center justify-center py-16">
      <div className="max-w-md rounded-lg border border-border-default bg-bg-surface p-8 text-center">
        <span className="text-4xl" role="img" aria-label={tabName}>
          {icon}
        </span>
        <h3 className="mt-4 text-title-lg font-semibold text-text-primary">{tabName}</h3>
        {comingSprint && (
          <span className="mt-2 inline-block rounded-full bg-brand-primary/10 px-3 py-1 text-body-xs font-medium text-brand-primary">
            Coming in Sprint {comingSprint}
          </span>
        )}
        <p className="mt-3 text-body-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
