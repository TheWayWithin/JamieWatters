/**
 * Project Validation Schemas
 *
 * Zod schemas for validating project creation and updates
 */

import { z } from 'zod';

// Valid project categories (must match Prisma enum)
const categoryEnum = z.enum(['AI_TOOLS', 'FRAMEWORKS', 'EDUCATION', 'MARKETPLACE', 'OTHER']);

// Valid project statuses (must match Prisma enum)
const statusEnum = z.enum(['ACTIVE', 'BETA', 'PLANNING', 'ARCHIVED']);

/**
 * Schema for project metrics
 */
export const projectMetricsSchema = z.object({
  mrr: z.number().min(0, 'MRR must be positive').default(0),
  users: z.number().int().min(0, 'Users must be positive').default(0),
});

/**
 * Schema for creating a new project
 */
export const createProjectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase, alphanumeric with hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  longDescription: z.string().max(5000, 'Long description too long').optional().nullable(),
  techStack: z.array(z.string()).min(1, 'At least one technology required'),
  url: z.string().url('Must be a valid URL'),
  category: categoryEnum,
  status: statusEnum.default('ACTIVE'),
  featured: z.boolean().default(false),

  // Metrics
  mrr: z.number().min(0, 'MRR must be positive').default(0),
  users: z.number().int().min(0, 'Users must be positive').default(0),

  // GitHub Integration
  githubUrl: z
    .string()
    .url('Must be a valid URL')
    .regex(/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/, 'Must be a valid GitHub repository URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  githubToken: z
    .string()
    .min(1, 'Token cannot be empty')
    .max(200, 'Token too long')
    .optional()
    .nullable()
    .or(z.literal('')),
  trackProgress: z.boolean().default(false),

  // Optional content fields
  problemStatement: z.string().max(5000, 'Problem statement too long').optional().nullable(),
  solutionApproach: z.string().max(5000, 'Solution approach too long').optional().nullable(),
  lessonsLearned: z.string().max(5000, 'Lessons learned too long').optional().nullable(),
  screenshots: z.array(z.string().url('Must be valid URLs')).default([]),
  launchedAt: z.string().datetime().optional().nullable(),
});

/**
 * Schema for updating an existing project
 * All fields optional for partial updates
 */
export const updateProjectSchema = createProjectSchema.partial();

/**
 * Schema for project query parameters
 */
export const projectQuerySchema = z.object({
  category: categoryEnum.optional(),
  status: statusEnum.optional(),
  featured: z.boolean().optional(),
  trackProgress: z.boolean().optional(),
});

// Export types for TypeScript
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
export type ProjectCategory = z.infer<typeof categoryEnum>;
export type ProjectStatus = z.infer<typeof statusEnum>;

/**
 * Helper function to generate slug from project name
 * Converts to lowercase, replaces spaces with hyphens, removes special chars
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Helper function to parse GitHub URL and extract owner/repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const match = url.match(/^https:\/\/github\.com\/([\w-]+)\/([\w-]+)\/?$/);
    if (!match) {
      return null;
    }
    return {
      owner: match[1],
      repo: match[2],
    };
  } catch {
    return null;
  }
}
