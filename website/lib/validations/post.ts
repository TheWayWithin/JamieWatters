/**
 * Post Validation Schemas
 *
 * Zod schemas for validating post data on client and server.
 * Ensures data integrity and security.
 */

import { z } from 'zod';

/**
 * Post type enum (legacy string field)
 */
export const PostTypeSchema = z.enum(['manual', 'daily-update', 'weekly-plan']);
export type PostType = z.infer<typeof PostTypeSchema>;

/**
 * Content pillar enum (Sprint 1)
 */
export const ContentPillarSchema = z.enum(['JOURNEY', 'FRAMEWORK', 'TOOL', 'COMMUNITY']).nullable().optional();
export type ContentPillar = z.infer<typeof ContentPillarSchema>;

/**
 * Post type enum - structured categorization (Sprint 1)
 */
export const PostTypeEnumSchema = z.enum(['PROGRESS_UPDATE', 'MILESTONE', 'FAILURE', 'TUTORIAL', 'CASE_STUDY', 'GENERAL']).nullable().optional();
export type PostTypeEnumType = z.infer<typeof PostTypeEnumSchema>;

/**
 * Target persona enum (Sprint 1)
 */
export const TargetPersonaSchema = z.enum(['CORPORATE_ESCAPIST', 'SERVICE_PROVIDER', 'BUILDER', 'ALL']).nullable().optional();
export type TargetPersona = z.infer<typeof TargetPersonaSchema>;

/**
 * Project phase enum (Sprint 1)
 */
export const ProjectPhaseSchema = z.enum(['IDEATION', 'MVP', 'LAUNCH', 'GROWTH', 'MAINTENANCE', 'ARCHIVED', 'PAUSED']).nullable().optional();
export type ProjectPhase = z.infer<typeof ProjectPhaseSchema>;

/**
 * Schema for creating a new post
 */
export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),

  content: z
    .string()
    .min(1, 'Content is required')
    .max(100000, 'Content is too long'),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .default([]),

  postType: PostTypeSchema.default('manual'),

  projectId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Invalid project ID' }
    )
    .transform(val => val === '' || val === undefined ? null : val),

  published: z.boolean().default(false),

  readTime: z.number().int().positive().optional(),

  // Content categorization (Sprint 1)
  contentPillar: ContentPillarSchema,
  postTypeEnum: PostTypeEnumSchema,
  targetPersona: TargetPersonaSchema,
  phase: ProjectPhaseSchema,
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;

/**
 * Schema for updating a post
 * All fields are optional except validation constraints
 */
export const UpdatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),

  content: z
    .string()
    .min(1, 'Content is required')
    .max(100000, 'Content is too long')
    .optional(),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),

  tags: z
    .array(z.string().trim())
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  projectId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Invalid project ID' }
    )
    .transform(val => val === '' || val === undefined ? null : val),

  published: z.boolean().optional(),

  readTime: z.number().int().positive().optional(),

  // Content categorization (Sprint 1)
  contentPillar: ContentPillarSchema,
  postTypeEnum: PostTypeEnumSchema,
  targetPersona: TargetPersonaSchema,
  phase: ProjectPhaseSchema,
});

export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;

/**
 * Schema for client-side form data (includes helper fields)
 */
export const PostFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),

  content: z
    .string()
    .min(1, 'Content is required')
    .max(100000, 'Content is too long'),

  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),

  tagsInput: z.string().optional(), // Comma-separated string for input field

  postType: PostTypeSchema.default('manual'),

  projectId: z.string().optional(), // Empty string or UUID

  published: z.boolean().default(false),

  // Content categorization (Sprint 1)
  contentPillar: z.string().optional(), // Empty string or enum value
  postTypeEnum: z.string().optional(),
  targetPersona: z.string().optional(),
  phase: z.string().optional(),
});

export type PostFormData = z.infer<typeof PostFormSchema>;

/**
 * Helper: Convert form data to API input
 */
export function formDataToCreateInput(formData: PostFormData): CreatePostInput {
  // Parse tags from comma-separated string
  const tags = formData.tagsInput
    ? formData.tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
    : [];

  return {
    title: formData.title,
    content: formData.content,
    excerpt: formData.excerpt || undefined,
    tags,
    postType: formData.postType,
    projectId: formData.projectId && formData.projectId !== ''
      ? formData.projectId
      : null,
    published: formData.published,
    // Content categorization (Sprint 1)
    contentPillar: formData.contentPillar && formData.contentPillar !== ''
      ? formData.contentPillar as 'JOURNEY' | 'FRAMEWORK' | 'TOOL' | 'COMMUNITY'
      : null,
    postTypeEnum: formData.postTypeEnum && formData.postTypeEnum !== ''
      ? formData.postTypeEnum as 'PROGRESS_UPDATE' | 'MILESTONE' | 'FAILURE' | 'TUTORIAL' | 'CASE_STUDY' | 'GENERAL'
      : null,
    targetPersona: formData.targetPersona && formData.targetPersona !== ''
      ? formData.targetPersona as 'CORPORATE_ESCAPIST' | 'SERVICE_PROVIDER' | 'BUILDER' | 'ALL'
      : null,
    phase: formData.phase && formData.phase !== ''
      ? formData.phase as 'IDEATION' | 'MVP' | 'LAUNCH' | 'GROWTH' | 'MAINTENANCE' | 'ARCHIVED' | 'PAUSED'
      : null,
  };
}

/**
 * Helper: Convert API post data to form data
 */
export function postToFormData(post: {
  title: string;
  content: string | null;
  excerpt: string;
  tags: string[];
  postType: string;
  projectId: string | null;
  published: boolean;
  contentPillar?: string | null;
  postTypeEnum?: string | null;
  targetPersona?: string | null;
  phase?: string | null;
}): PostFormData {
  return {
    title: post.title,
    content: post.content || '',
    excerpt: post.excerpt || '',
    tagsInput: post.tags.join(', '),
    postType: post.postType as PostType,
    projectId: post.projectId || '',
    published: post.published,
    // Content categorization (Sprint 1)
    contentPillar: post.contentPillar || '',
    postTypeEnum: post.postTypeEnum || '',
    targetPersona: post.targetPersona || '',
    phase: post.phase || '',
  };
}

/**
 * Sanitize markdown content to prevent XSS
 *
 * Note: remark-html with sanitize: true handles most XSS prevention
 * This is an additional layer for storing content
 */
export function sanitizeMarkdown(content: string): string {
  // Remove any <script> tags (even though remark will sanitize)
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove any potentially dangerous attributes
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Validate tags array
 */
export function validateTags(tags: string[]): string[] {
  return tags
    .filter(tag => tag.trim().length > 0)
    .filter(tag => tag.length <= 50) // Max tag length
    .slice(0, 10); // Max 10 tags
}
