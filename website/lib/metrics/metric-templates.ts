import { ProjectType } from '@prisma/client';
import type { LucideIcon } from 'lucide-react';
import {
  DollarSign,
  Users,
  CreditCard,
  TrendingDown,
  Target,
  TrendingUp,
  BarChart,
  Activity,
  Star,
  GitFork,
  Download,
  Eye,
  Mail,
  Share2,
  LogOut,
  Clock,
  MessageSquare,
  ShoppingCart,
  Store,
  Percent,
} from 'lucide-react';

export type MetricFormat = 'currency' | 'number' | 'percent' | 'duration';

export interface MetricDefinition {
  key: string;
  label: string;
  format: MetricFormat;
  icon: LucideIcon;
  description?: string;
}

export interface MetricValue {
  key: string;
  value: number;
  trend?: number; // Percentage change
  lastUpdated?: Date;
}

export interface ProjectMetrics {
  projectType: ProjectType;
  metrics: MetricDefinition[];
  customMetrics?: Record<string, MetricDefinition>;
}

/**
 * Default metric templates for each project type.
 * Each template defines the standard metrics tracked for that project type.
 */
export const METRIC_TEMPLATES: Record<ProjectType, MetricDefinition[]> = {
  [ProjectType.SAAS]: [
    {
      key: 'mrr',
      label: 'MRR',
      format: 'currency',
      icon: DollarSign,
      description: 'Monthly Recurring Revenue',
    },
    {
      key: 'activeUsers',
      label: 'Active Users',
      format: 'number',
      icon: Users,
      description: 'Total active users',
    },
    {
      key: 'payingUsers',
      label: 'Paying Users',
      format: 'number',
      icon: CreditCard,
      description: 'Number of paying customers',
    },
    {
      key: 'churnRate',
      label: 'Churn Rate',
      format: 'percent',
      icon: TrendingDown,
      description: 'Customer churn rate',
    },
  ],

  [ProjectType.TRADING]: [
    {
      key: 'winRate',
      label: 'Win Rate',
      format: 'percent',
      icon: Target,
      description: 'Percentage of profitable trades',
    },
    {
      key: 'totalProfit',
      label: 'Total Profit',
      format: 'currency',
      icon: TrendingUp,
      description: 'Cumulative profit/loss',
    },
    {
      key: 'avgAnnualReturn',
      label: 'Avg Annual Return',
      format: 'percent',
      icon: BarChart,
      description: 'Average annualized return',
    },
    {
      key: 'totalTrades',
      label: 'Total Trades',
      format: 'number',
      icon: Activity,
      description: 'Number of trades executed',
    },
  ],

  [ProjectType.OPEN_SOURCE]: [
    {
      key: 'githubStars',
      label: 'GitHub Stars',
      format: 'number',
      icon: Star,
      description: 'Repository stars',
    },
    {
      key: 'forks',
      label: 'Forks',
      format: 'number',
      icon: GitFork,
      description: 'Repository forks',
    },
    {
      key: 'contributors',
      label: 'Contributors',
      format: 'number',
      icon: Users,
      description: 'Active contributors',
    },
    {
      key: 'weeklyDownloads',
      label: 'Weekly Downloads',
      format: 'number',
      icon: Download,
      description: 'Downloads per week',
    },
  ],

  [ProjectType.CONTENT]: [
    {
      key: 'monthlyVisitors',
      label: 'Monthly Visitors',
      format: 'number',
      icon: Eye,
      description: 'Unique visitors per month',
    },
    {
      key: 'emailSignups',
      label: 'Email Signups',
      format: 'number',
      icon: Mail,
      description: 'Newsletter subscribers',
    },
    {
      key: 'appReferrals',
      label: 'App Referrals',
      format: 'number',
      icon: Share2,
      description: 'Referrals to applications',
    },
    {
      key: 'bounceRate',
      label: 'Bounce Rate',
      format: 'percent',
      icon: LogOut,
      description: 'Visitor bounce rate',
    },
  ],

  [ProjectType.PERSONAL]: [
    {
      key: 'pageViews',
      label: 'Page Views',
      format: 'number',
      icon: Eye,
      description: 'Total page views',
    },
    {
      key: 'avgSession',
      label: 'Avg Session',
      format: 'duration',
      icon: Clock,
      description: 'Average session duration',
    },
    {
      key: 'contactRequests',
      label: 'Contact Requests',
      format: 'number',
      icon: MessageSquare,
      description: 'Incoming contact requests',
    },
  ],

  [ProjectType.MARKETPLACE]: [
    {
      key: 'gmv',
      label: 'GMV',
      format: 'currency',
      icon: ShoppingCart,
      description: 'Gross Merchandise Value',
    },
    {
      key: 'activeSellers',
      label: 'Active Sellers',
      format: 'number',
      icon: Store,
      description: 'Number of active sellers',
    },
    {
      key: 'activeBuyers',
      label: 'Active Buyers',
      format: 'number',
      icon: Users,
      description: 'Number of active buyers',
    },
    {
      key: 'takeRate',
      label: 'Take Rate',
      format: 'percent',
      icon: Percent,
      description: 'Platform commission rate',
    },
  ],
};

/**
 * Get metric definition by key from a project type's template.
 */
export function getMetricDefinition(
  projectType: ProjectType,
  metricKey: string
): MetricDefinition | undefined {
  return METRIC_TEMPLATES[projectType].find((m) => m.key === metricKey);
}

/**
 * Get all metric keys for a project type.
 */
export function getMetricKeys(projectType: ProjectType): string[] {
  return METRIC_TEMPLATES[projectType].map((m) => m.key);
}
