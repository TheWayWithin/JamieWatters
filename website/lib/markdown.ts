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

  return openExternalLinksInNewTab(result.toString())
}

/**
 * Design principle: external links open in a new tab, internal links stay put.
 * Adds target="_blank" rel="noopener noreferrer" to any <a> whose href is an
 * absolute http(s) URL NOT on jamiewatters.work. Internal, relative, anchor and
 * mailto links are left untouched.
 */
function openExternalLinksInNewTab(html: string): string {
  return html.replace(/<a\s+([^>]*?)href="([^"]+)"([^>]*)>/gi, (match, pre, href, post) => {
    const isExternal =
      /^https?:\/\//i.test(href) &&
      !/^https?:\/\/([^/]*\.)?jamiewatters\.work(\/|$)/i.test(href)
    if (!isExternal || /\btarget=/.test(match)) return match
    return `<a ${pre}href="${href}"${post} target="_blank" rel="noopener noreferrer">`
  })
}
