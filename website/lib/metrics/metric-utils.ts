import { ProjectType } from '@prisma/client';
import type { MetricDefinition, MetricValue, MetricFormat } from './metric-templates';
import { METRIC_TEMPLATES } from './metric-templates';

export interface Project {
  id: string;
  projectType: ProjectType;
  customMetrics?: any; // Json type from Prisma
}

export interface ProjectWithMetrics extends Project {
  metrics?: MetricValue[];
}

/**
 * Get the appropriate metrics for a project based on its type.
 * Merges default template metrics with any custom metrics defined.
 */
export function getMetricsForProject(project: Project): MetricDefinition[] {
  const defaultMetrics = METRIC_TEMPLATES[project.projectType] || [];

  // If project has custom metrics, merge them with defaults
  if (project.customMetrics && typeof project.customMetrics === 'object') {
    const customMetricDefs = Object.entries(project.customMetrics).map(
      ([key, config]: [string, any]) => ({
        key,
        label: config.label || key,
        format: config.format || 'number',
        icon: config.icon || 'Activity', // Default icon name
        description: config.description,
      })
    );

    // Custom metrics override defaults with same key
    const mergedMetrics = [...defaultMetrics];
    customMetricDefs.forEach((custom) => {
      const existingIndex = mergedMetrics.findIndex((m) => m.key === custom.key);
      if (existingIndex >= 0) {
        mergedMetrics[existingIndex] = custom as MetricDefinition;
      } else {
        mergedMetrics.push(custom as MetricDefinition);
      }
    });

    return mergedMetrics;
  }

  return defaultMetrics;
}

/**
 * Format a metric value according to its format type.
 */
export function formatMetricValue(value: number, format: MetricFormat): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percent':
      return `${value.toFixed(1)}%`;

    case 'duration':
      // Assumes value is in seconds
      const hours = Math.floor(value / 3600);
      const minutes = Math.floor((value % 3600) / 60);
      const seconds = Math.floor(value % 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }

    case 'number':
    default:
      // Format large numbers with K, M, B suffixes
      if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)}B`;
      } else if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
      } else if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
      } else {
        return value.toLocaleString();
      }
  }
}

/**
 * Get the top N metrics for display in cards.
 * Prioritizes metrics with values, then by definition order.
 */
export function getTopMetrics(
  project: ProjectWithMetrics,
  count: number = 4
): Array<MetricDefinition & { value?: MetricValue }> {
  const metricDefinitions = getMetricsForProject(project);
  const metricValues = project.metrics || [];

  // Create map of metric values by key
  const valueMap = new Map(
    metricValues.map((v) => [v.key, v])
  );

  // Combine definitions with values
  const combinedMetrics = metricDefinitions.map((def) => ({
    ...def,
    value: valueMap.get(def.key),
  }));

  // Sort: metrics with values first, then by original order
  const sorted = combinedMetrics.sort((a, b) => {
    if (a.value && !b.value) return -1;
    if (!a.value && b.value) return 1;
    return 0;
  });

  return sorted.slice(0, count);
}

/**
 * Calculate trend direction and color.
 */
export function getTrendInfo(trend?: number): {
  direction: 'up' | 'down' | 'neutral';
  color: 'green' | 'red' | 'gray';
  displayValue: string;
} {
  if (trend === undefined || trend === 0) {
    return {
      direction: 'neutral',
      color: 'gray',
      displayValue: '0%',
    };
  }

  return {
    direction: trend > 0 ? 'up' : 'down',
    color: trend > 0 ? 'green' : 'red',
    displayValue: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
  };
}

/**
 * Validate metric value format.
 */
export function isValidMetricValue(
  value: any,
  format: MetricFormat
): boolean {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  switch (format) {
    case 'percent':
      return value >= 0 && value <= 100;
    case 'duration':
      return value >= 0;
    case 'currency':
    case 'number':
    default:
      return true;
  }
}
