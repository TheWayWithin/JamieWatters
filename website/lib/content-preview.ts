/**
 * The shape the admin content preview flow passes around.
 *
 * Two generators produce it — `generateDailyUpdate` (DailyUpdateOutput) and
 * `generateProgressBlogPost` / `generateProgressSummary` (ProgressReportOutput)
 * — and it is consumed by the admin content page's `preview` state, the
 * DailyUpdateGenerator and ProgressReportGenerator `onGenerate` callbacks, and
 * ContentPreviewModal, which is where this shape was previously declared inline.
 *
 * The values reach the components through `await res.json()`, which is `any`,
 * so nothing at that boundary can check them. The assertions at the bottom of
 * this file are what make the contract real: if either producer drifts, tsc
 * fails here rather than the admin preview breaking silently at runtime.
 */
export interface ContentPreviewProject {
  projectId: string;
  projectName: string;
  /**
   * Empty string means "no GitHub URL", used because the underlying
   * `Project.githubUrl` column is nullable and the producers normalise null
   * away before this boundary.
   */
  githubUrl: string;
  completedTasks: string[];
  /** Set when fetching that project's plan failed. */
  error?: string;
}

export interface ContentPreview {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  /** Estimated reading time in minutes; always at least 1. */
  readTime: number;
  projects: ContentPreviewProject[];
}

/*
 * Compile-time proof that both producers satisfy the contract above.
 *
 * These are type-level only and erase completely, so they cost nothing at
 * runtime. They are exported rather than local so they are not dead
 * declarations. Of ContentPreviewProject's fields, only `completedTasks` and
 * `error` are read by a consumer today; the rest are carried because both
 * producers emit them and the modal has always declared them.
 */
import type { DailyUpdateOutput } from './daily-update-generator';
import type { ProgressReportOutput } from './progress-report-generator';

type Satisfies<T extends ContentPreview> = T;

export type DailyUpdateIsContentPreview = Satisfies<DailyUpdateOutput>;
export type ProgressReportIsContentPreview = Satisfies<ProgressReportOutput>;
