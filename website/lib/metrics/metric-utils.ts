import { ProjectType, type Prisma } from '@prisma/client';
import type { MetricDefinition, MetricValue, MetricFormat } from './metric-templates';
import { METRIC_TEMPLATES } from './metric-templates';

export interface Project {
  id: string;
  projectType: ProjectType;
  /**
   * Prisma column `customMetrics Json?`, so at the type level this is a JSON
   * value of unknown shape and has to be narrowed before use.
   *
   * What it actually holds is metric VALUES keyed by metric key:
   * `{ activeUsers: 1500 }`. `createProjectSchema` validates it as
   * `Record<string, number>`, ProjectForm writes exactly that, and
   * `app/portfolio/[slug]/page.tsx` reads it that way. It does NOT hold metric
   * definitions, and it cannot: a number carries no label, format or icon.
   */
  customMetrics?: Prisma.JsonValue;
}

// Prisma.JsonObject declares its members optional, so reading an entry off one
// yields `JsonValue | undefined`; the guard accepts that.
function isJsonObject(value: Prisma.JsonValue | undefined): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Turn a metric key into a readable label, for custom keys that no template
 * defines. Same transformation the portfolio page applies.
 */
export function humaniseMetricKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/**
 * Read the numeric values out of a project's `customMetrics` column.
 *
 * Entries whose value is not a finite number are dropped rather than coerced:
 * the column is typed `Json?`, so nothing at the database level stops a
 * non-number getting in, and a metric card showing `NaN` is worse than one
 * that is absent.
 */
export function getCustomMetricValues(
  customMetrics: Prisma.JsonValue | undefined
): Record<string, number> {
  if (!isJsonObject(customMetrics)) return {};

  const values: Record<string, number> = {};
  for (const [key, value] of Object.entries(customMetrics)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      values[key] = value;
    }
  }
  return values;
}

export interface ProjectWithMetrics extends Project {
  metrics?: MetricValue[];
}

/**
 * Get the metric definitions for a project: its type's template, plus a derived
 * definition for any custom metric key the template does not already cover.
 *
 * Definitions come from the template, never from `customMetrics`. That column
 * holds values, so a key it introduces can only contribute the key itself; the
 * label is derived from it and there is no icon. A key that IS in the template
 * keeps the template's definition, because the template is the richer source.
 *
 * This previously read each `customMetrics` entry as a config object with
 * `label`, `format`, `icon` and `description` fields. Nothing has ever written
 * that shape, so every lookup missed and every default applied, and the `icon`
 * default was a string in a field typed as a component, hidden behind two
 * casts. (JW-ISS-22, JW-ISS-23)
 */
export function getMetricsForProject(project: Project): MetricDefinition[] {
  const templateMetrics = METRIC_TEMPLATES[project.projectType] || [];
  const customKeys = Object.keys(getCustomMetricValues(project.customMetrics));

  if (customKeys.length === 0) return templateMetrics;

  const templateKeys = new Set(templateMetrics.map((m) => m.key));
  const derived: MetricDefinition[] = customKeys
    .filter((key) => !templateKeys.has(key))
    .map((key) => ({
      key,
      label: humaniseMetricKey(key),
      format: 'number' as MetricFormat,
    }));

  return [...templateMetrics, ...derived];
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

  // Create map of metric values by key.
  //
  // Seed it from the customMetrics column first, then let an explicit
  // MetricValue override it. Without the seed, a custom metric key would
  // contribute a definition with no value and sort to the bottom as "empty",
  // even though its value is the reason the key exists at all. Explicit
  // MetricValues win because they carry trend and lastUpdated too.
  const valueMap = new Map<string, MetricValue>(
    Object.entries(getCustomMetricValues(project.customMetrics)).map(([key, value]) => [
      key,
      { key, value },
    ])
  );
  for (const v of metricValues) {
    valueMap.set(v.key, v);
  }

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
  value: unknown,
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
