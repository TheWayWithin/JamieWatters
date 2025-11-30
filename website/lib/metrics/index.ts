/**
 * Metrics Library
 *
 * Provides configurable metrics tracking for different project types.
 * Each project type (SAAS, TRADING, OPEN_SOURCE, etc.) has its own
 * default set of metrics, which can be customized per project.
 *
 * Usage:
 *   import { getMetricsForProject, formatMetricValue } from '@/lib/metrics';
 *
 *   const metrics = getMetricsForProject(project);
 *   const formatted = formatMetricValue(1234.56, 'currency');
 */

export {
  METRIC_TEMPLATES,
  getMetricDefinition,
  getMetricKeys,
} from './metric-templates';

export type {
  MetricFormat,
  MetricDefinition,
  MetricValue,
  ProjectMetrics,
} from './metric-templates';

export {
  getMetricsForProject,
  formatMetricValue,
  getTopMetrics,
  getTrendInfo,
  isValidMetricValue,
} from './metric-utils';

export type {
  Project,
  ProjectWithMetrics,
} from './metric-utils';
