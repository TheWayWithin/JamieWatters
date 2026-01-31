import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Briefcase,
  CheckCircle2,
  Circle,
  BarChart3,
  ExternalLink,
  Clock,
  Flame,
} from 'lucide-react';
import { getSEOMetadata } from '@/lib/seo';

export const revalidate = 60;

export const metadata = getSEOMetadata({
  title: 'Dashboard — Project & Task Tracker',
  description:
    'Live view of all projects and tasks across the portfolio. Build-in-public transparency.',
  type: 'website',
});

// --- Types matching generate-dashboard.ts ---

interface Project {
  name: string;
  status: 'live' | 'beta' | 'build' | 'design';
  statusEmoji: string;
  description: string;
  repo: string;
  domain: string;
  stack: string;
  next: string;
  revenue: string;
  users: string;
}

interface Task {
  text: string;
  done: boolean;
  priority: boolean;
  subtasks: Task[];
}

interface TaskSection {
  title: string;
  emoji: string;
  tasks: Task[];
  completed: number;
  total: number;
}

interface DashboardData {
  generatedAt: string;
  projects: Project[];
  projectCounts: Record<string, number>;
  taskSections: TaskSection[];
  taskStats: {
    total: number;
    completed: number;
    percentage: number;
  };
}

// --- Helpers ---

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  live: {
    label: 'Live',
    color: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/30',
  },
  beta: {
    label: 'Beta',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/30',
  },
  build: {
    label: 'Build',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
  },
  design: {
    label: 'Design',
    color: 'text-gray-400',
    bg: 'bg-gray-500/15',
    border: 'border-gray-500/30',
  },
};

async function getDashboardData(): Promise<DashboardData | null> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'dashboard.json'
    );
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DashboardData;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <main id="main-content" className="min-h-screen bg-bg-primary px-6 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-display-lg font-bold text-text-primary mb-4">
            Dashboard
          </h1>
          <p className="text-body-base text-text-secondary">
            Dashboard data is not available yet. Run the generator script to
            populate it.
          </p>
        </div>
      </main>
    );
  }

  const { projects, projectCounts, taskSections, taskStats, generatedAt } =
    data;

  return (
    <main id="main-content" className="min-h-screen">
      {/* Hero */}
      <section className="bg-bg-primary px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-display-lg lg:text-display-xl font-bold text-brand-primary mb-2">
                Dashboard
              </h1>
              <p className="text-body-base text-text-secondary">
                Real-time view of every project and task in the portfolio.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Last synced:{' '}
                {new Date(generatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Card className="text-center !p-4">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-brand-primary/15 rounded-lg">
                  <Briefcase className="w-5 h-5 text-brand-primary" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                Projects
              </div>
              <div className="text-display-md font-bold text-brand-accent">
                {projects.length}
              </div>
            </Card>

            <Card className="text-center !p-4">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-green-500/15 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                Tasks Done
              </div>
              <div className="text-display-md font-bold text-brand-accent">
                {taskStats.completed}
                <span className="text-body-base text-text-tertiary font-normal">
                  /{taskStats.total}
                </span>
              </div>
            </Card>

            <Card className="text-center !p-4">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-brand-secondary/15 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-brand-secondary" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                Completion
              </div>
              <div className="text-display-md font-bold text-brand-accent">
                {taskStats.percentage}%
              </div>
            </Card>

            <Card className="text-center !p-4">
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-amber-500/15 rounded-lg">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
                Active
              </div>
              <div className="text-display-md font-bold text-brand-accent">
                {(projectCounts.live || 0) +
                  (projectCounts.beta || 0) +
                  (projectCounts.build || 0)}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Overview */}
      <section className="bg-bg-surface px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-display-lg font-bold text-text-primary">
              Portfolio Overview
            </h2>
            <div className="hidden sm:flex items-center gap-3">
              {(['live', 'beta', 'build', 'design'] as const).map((s) => (
                <span
                  key={s}
                  className={`flex items-center gap-1.5 text-xs font-medium ${STATUS_CONFIG[s].color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].bg} ring-1 ${STATUS_CONFIG[s].border}`}
                  />
                  {STATUS_CONFIG[s].label} ({projectCounts[s] || 0})
                </span>
              ))}
            </div>
          </div>

          {/* Status groups */}
          {(['live', 'beta', 'build', 'design'] as const).map((status) => {
            const statusProjects = projects.filter(
              (p) => p.status === status
            );
            if (statusProjects.length === 0) return null;
            const cfg = STATUS_CONFIG[status];

            return (
              <div key={status} className="mb-10 last:mb-0">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${cfg.bg} ring-1 ${cfg.border}`}
                  />
                  <h3
                    className={`text-body-lg font-semibold ${cfg.color}`}
                  >
                    {cfg.label}
                  </h3>
                  <span className="text-xs text-text-tertiary">
                    ({statusProjects.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statusProjects.map((project) => (
                    <Card
                      key={project.name}
                      variant="flat"
                      className={`!p-5 border-l-2 ${cfg.border}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-body-base font-semibold text-text-primary">
                          {project.name}
                        </h4>
                        {project.domain && (
                          <a
                            href={`https://${project.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-text-tertiary hover:text-brand-primary transition-base"
                            title={project.domain}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-body-sm text-text-secondary mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.stack
                          .split(',')
                          .slice(0, 3)
                          .map((tech) => (
                            <Badge key={tech} size="sm" variant="default">
                              {tech.trim()}
                            </Badge>
                          ))}
                      </div>
                      {project.next && (
                        <p className="text-xs text-text-tertiary">
                          <span className="text-brand-secondary font-medium">
                            Next:
                          </span>{' '}
                          {project.next}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tasks Pipeline */}
      <section className="bg-bg-primary px-6 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-display-lg font-bold text-text-primary mb-8">
            Task Pipeline
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {taskSections.map((section) => (
              <Card key={section.title} variant="flat" className="!p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-body-base font-semibold text-text-primary flex items-center gap-2">
                    <span>{section.emoji}</span>
                    {section.title}
                  </h3>
                  <span className="text-xs text-text-tertiary font-mono">
                    {section.completed}/{section.total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-bg-surface-hover rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${section.total > 0 ? (section.completed / section.total) * 100 : 0}%`,
                    }}
                  />
                </div>

                {/* Task list */}
                <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {section.tasks.map((task, idx) => (
                    <li key={idx}>
                      <div className="flex items-start gap-2">
                        {task.done ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              task.priority
                                ? 'text-red-400'
                                : 'text-text-tertiary'
                            }`}
                          />
                        )}
                        <span
                          className={`text-body-sm ${
                            task.done
                              ? 'text-text-tertiary line-through'
                              : task.priority
                                ? 'text-text-primary font-medium'
                                : 'text-text-secondary'
                          }`}
                        >
                          {task.text}
                          {task.priority && !task.done && (
                            <span className="ml-1 text-red-400 text-xs">
                              P0
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Subtasks (collapsed count or show first few) */}
                      {task.subtasks.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {task.subtasks.slice(0, 4).map((sub, subIdx) => (
                            <div
                              key={subIdx}
                              className="flex items-start gap-2"
                            >
                              {sub.done ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle className="w-3 h-3 text-text-tertiary mt-0.5 flex-shrink-0" />
                              )}
                              <span
                                className={`text-xs ${
                                  sub.done
                                    ? 'text-text-tertiary line-through'
                                    : 'text-text-secondary'
                                }`}
                              >
                                {sub.text}
                              </span>
                            </div>
                          ))}
                          {task.subtasks.length > 4 && (
                            <span className="text-xs text-text-tertiary ml-5">
                              +{task.subtasks.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
