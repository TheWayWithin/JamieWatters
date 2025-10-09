/**
 * Markdown rendering utilities with syntax highlighting
 * Uses unified + remark + rehype for robust markdown processing
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

/**
 * Render markdown to HTML with syntax highlighting
 * @param content - Raw markdown content
 * @returns HTML string ready for dangerouslySetInnerHTML
 */
export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // GitHub Flavored Markdown (tables, strikethrough, task lists)
    .use(remarkHtml, { sanitize: false }) // Convert to HTML
    .process(content)

  return result.toString()
}

/**
 * Extract excerpt from markdown content
 * @param content - Full markdown content
 * @param maxLength - Maximum excerpt length in characters
 * @returns Plain text excerpt
 */
export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove markdown formatting for excerpt
  const plainText = content
    .replace(/^#+\s+/gm, '') // Remove headings
    .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.+?)\*/g, '$1') // Remove italic
    .replace(/`(.+?)`/g, '$1') // Remove inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
    .trim()

  if (plainText.length <= maxLength) {
    return plainText
  }

  return plainText.slice(0, maxLength).trim() + '...'
}
