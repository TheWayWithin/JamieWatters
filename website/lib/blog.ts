/**
 * File-based blog content layer.
 *
 * Reads markdown posts from `content/blog/*.md` with frontmatter.
 * This powers ONLY the /blog section. /journey is a separate,
 * database-backed system and is not touched here.
 *
 * Locked frontmatter schema (a downstream publishing tool emits exactly these):
 *   title:     string    (required)
 *   slug:      string    (required; matches the filename portion after the date)
 *   date:      string    (required; YYYY-MM-DD)
 *   excerpt:   string    (required)
 *   tags:      string[]  (required; may be empty)
 *   image:     string    (optional; e.g. /images/blog/slug.png — lead + card/OG image)
 *   imageAlt:  string    (optional)
 *   readTime:  number    (optional; minutes — auto-calculated from word count if omitted)
 *   draft:     boolean   (optional; if true, excluded from the index)
 *
 * File naming convention: content/blog/YYYY-MM-DD-slug.md
 * Only files matching that convention are treated as posts, so spec/draft
 * files living alongside them are ignored.
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { calculateReadTime } from './read-time-calculator';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/** Files must be named YYYY-MM-DD-slug.md to be treated as posts. */
const POST_FILENAME_RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

export interface BlogPostMeta {
  title: string;
  slug: string;
  date: string; // YYYY-MM-DD
  excerpt: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  readTime: number; // minutes (always resolved)
  draft: boolean;
}

export interface BlogPost extends BlogPostMeta {
  content: string; // raw markdown body (no frontmatter)
}

/** Read + parse a single file. Returns null if it isn't a valid post. */
function parseFile(filename: string): BlogPost | null {
  const match = filename.match(POST_FILENAME_RE);
  if (!match) {
    return null; // not a dated post file (e.g. specs, notes)
  }

  const [, datePrefix, filenameSlug] = match;
  const fullPath = path.join(BLOG_DIR, filename);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  // Required fields. If a file is missing these it isn't a publishable post.
  if (!data.title || !data.excerpt) {
    return null;
  }

  const slug = typeof data.slug === 'string' && data.slug.length > 0 ? data.slug : filenameSlug;
  const date = typeof data.date === 'string' && data.date.length > 0 ? data.date : datePrefix;

  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const readTime =
    typeof data.readTime === 'number' && data.readTime > 0
      ? data.readTime
      : calculateReadTime(content);

  return {
    title: String(data.title),
    slug,
    date,
    excerpt: String(data.excerpt),
    tags,
    image: typeof data.image === 'string' && data.image.length > 0 ? data.image : undefined,
    imageAlt: typeof data.imageAlt === 'string' && data.imageAlt.length > 0 ? data.imageAlt : undefined,
    readTime,
    draft: data.draft === true,
    content,
  };
}

/** Read every valid post file (drafts included). */
function readAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.md'))
    .map(parseFile)
    .filter((post): post is BlogPost => post !== null);
}

/**
 * All published (non-draft) posts, newest first by date.
 * Use for the /blog index.
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  return readAllPosts()
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ content, ...meta }) => meta); // strip body from index payload
}

/**
 * A single post (including body) by slug.
 * Returns null if not found or if the post is a draft.
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const post = readAllPosts().find((p) => p.slug === slug);
  if (!post || post.draft) {
    return null;
  }
  return post;
}

/** Slugs of all published posts, for generateStaticParams. */
export function getBlogSlugs(): string[] {
  return getAllBlogPosts().map((post) => post.slug);
}
