/**
 * Mission Control v2 - Shared TypeScript Types
 *
 * Defines all interfaces used across Mission Control tabs.
 */

/**
 * Tab Identifiers
 */
export type MissionControlTab =
  | 'overview'
  | 'goals'
  | 'kanban'
  | 'projects'
  | 'issues'
  | 'agents';

/**
 * Tab Configuration
 */
export interface TabConfig {
  id: MissionControlTab;
  label: string;
  icon: string;
  available: boolean;
  comingSprint?: number;
}

/**
 * Kanban Column Identifiers
 */
export type KanbanColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

/**
 * Kanban Task - Task with column assignment
 */
export interface KanbanTask {
  id: string;
  content: string;
  section: string;
  completed: boolean;
  sortOrder: number;
  syncedAt: string;
  column: KanbanColumnId;
}

/**
 * Kanban Column Configuration
 */
export interface KanbanColumnConfig {
  id: KanbanColumnId;
  label: string;
  color: string;
  tasks: KanbanTask[];
}

/**
 * Priority Item - High-priority task for Overview dashboard
 */
export interface PriorityItem {
  id: string;
  content: string;
  section: string;
  completed: boolean;
  sortOrder: number;
}

/**
 * Activity Item - Recent activity record
 */
export interface ActivityItem {
  id: string;
  action: string;
  category: string;
  details?: string;
  occurredAt: string;
}

/**
 * Task Status Breakdown
 */
export interface TaskStatusBreakdown {
  backlog: number;
  in_progress: number;
  review: number;
  done: number;
}

/**
 * Overview Metrics - Response shape from GET /api/admin/overview
 */
export interface OverviewMetrics {
  totalTasks: number;
  completedTasks: number;
  tasksByStatus: TaskStatusBreakdown;
  totalProjects: number;
  activeProjects: number;
  recentActivityCount: number;
  scheduledTaskCount: number;
  topPriorities: PriorityItem[];
  recentActivity: ActivityItem[];
}

/**
 * Metric Card Props
 */
export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: string;
  };
  className?: string;
  loading?: boolean;
}
