/**
 * Read Time Calculator
 *
 * Calculates estimated reading time for markdown content.
 * Based on average reading speed of ~200 words per minute.
 */

const WORDS_PER_MINUTE = 200;

/**
 * Calculate reading time from markdown content
 *
 * @param markdown - Raw markdown content
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function calculateReadTime(markdown: string): number {
  if (!markdown || typeof markdown !== 'string') {
    return 1;
  }

  // Remove markdown formatting for accurate word count
  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code
  text = text.replace(/`[^`]+`/g, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Remove links but keep link text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images: ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');

  // Remove headers markers (#)
  text = text.replace(/^#+\s+/gm, '');

  // Remove bold/italic markers
  text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, '');

  // Remove blockquote markers
  text = text.replace(/^>\s+/gm, '');

  // Remove list markers
  text = text.replace(/^[-*+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // Count words (split by whitespace)
  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  const wordCount = words.length;

  // Calculate reading time in minutes
  const readTime = Math.ceil(wordCount / WORDS_PER_MINUTE);

  // Minimum 1 minute
  return Math.max(1, readTime);
}

/**
 * Format read time for display
 *
 * @param minutes - Reading time in minutes
 * @returns Formatted string like "5 min read" or "1 min read"
 */
export function formatReadTime(minutes: number): string {
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
}

/**
 * Get word count from markdown content
 *
 * Useful for displaying word count alongside read time
 *
 * @param markdown - Raw markdown content
 * @returns Word count
 */
export function getWordCount(markdown: string): number {
  if (!markdown || typeof markdown !== 'string') {
    return 0;
  }

  // Use same cleaning logic as calculateReadTime
  let text = markdown;
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]+`/g, '');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '');
  text = text.replace(/^#+\s+/gm, '');
  text = text.replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1');
  text = text.replace(/^[-*_]{3,}$/gm, '');
  text = text.replace(/^>\s+/gm, '');
  text = text.replace(/^[-*+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  const words = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);

  return words.length;
}
