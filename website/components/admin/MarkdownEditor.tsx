'use client';

import { useState, useEffect, useMemo } from 'react';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import { getWordCount } from '@/lib/read-time-calculator';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post content in markdown...',
  className = '',
}: MarkdownEditorProps) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [isRendering, setIsRendering] = useState(false);

  // Calculate word count
  const wordCount = useMemo(() => getWordCount(value), [value]);

  // Render markdown to HTML for preview (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!value) {
        setPreviewHtml('');
        return;
      }

      setIsRendering(true);
      try {
        const result = await remark()
          .use(remarkGfm)
          .use(html)
          .process(value);

        setPreviewHtml(result.toString());
      } catch (error) {
        console.error('Markdown rendering error:', error);
        setPreviewHtml('<p class="text-error">Error rendering preview</p>');
      } finally {
        setIsRendering(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [value]);

  /**
   * Insert markdown formatting at cursor position
   */
  const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || placeholder;
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarActions = [
    {
      label: 'Bold',
      icon: 'B',
      action: () => insertMarkdown('**', '**', 'bold text'),
      title: 'Bold (Ctrl+B)',
    },
    {
      label: 'Italic',
      icon: 'I',
      action: () => insertMarkdown('*', '*', 'italic text'),
      title: 'Italic (Ctrl+I)',
    },
    {
      label: 'H1',
      icon: 'H1',
      action: () => insertMarkdown('# ', '', 'Heading 1'),
      title: 'Heading 1',
    },
    {
      label: 'H2',
      icon: 'H2',
      action: () => insertMarkdown('## ', '', 'Heading 2'),
      title: 'Heading 2',
    },
    {
      label: 'H3',
      icon: 'H3',
      action: () => insertMarkdown('### ', '', 'Heading 3'),
      title: 'Heading 3',
    },
    {
      label: 'Link',
      icon: '🔗',
      action: () => insertMarkdown('[', '](https://example.com)', 'link text'),
      title: 'Insert Link',
    },
    {
      label: 'Code',
      icon: '</>',
      action: () => insertMarkdown('`', '`', 'code'),
      title: 'Inline Code',
    },
    {
      label: 'List',
      icon: '•',
      action: () => {
        const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const needsNewline = lineStart > 0 && value[lineStart - 1] !== '\n';
        insertMarkdown(needsNewline ? '\n- ' : '- ', '', 'list item');
      },
      title: 'Bullet List',
    },
  ];

  return (
    <div className={`border border-border-default rounded-lg overflow-hidden bg-bg-surface ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-primary">
        <div className="flex items-center gap-1">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              title={action.title}
              className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded transition-colors"
            >
              {action.icon}
            </button>
          ))}
        </div>
        <div className="text-sm text-text-tertiary">
          {wordCount.toLocaleString()} words
        </div>
      </div>

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-border-subtle">
        {/* Editor */}
        <div className="relative">
          <textarea
            data-markdown-editor
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-[500px] px-4 py-3 bg-bg-surface text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none font-mono text-sm leading-relaxed"
            spellCheck="false"
          />
          <div className="absolute bottom-2 right-2 text-xs text-text-tertiary">
            Editor
          </div>
        </div>

        {/* Preview */}
        <div className="relative bg-bg-primary">
          <div className="h-[500px] px-4 py-3 overflow-y-auto">
            {isRendering ? (
              <p className="text-sm text-text-tertiary">Rendering preview...</p>
            ) : previewHtml ? (
              <div
                className="prose prose-sm max-w-none
                  prose-headings:text-text-primary prose-headings:font-bold
                  prose-p:text-text-secondary prose-p:leading-relaxed
                  prose-a:text-brand-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-text-primary prose-strong:font-semibold
                  prose-code:text-brand-primary prose-code:bg-bg-surface prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-bg-surface prose-pre:border prose-pre:border-border-default
                  prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-1
                  prose-ol:list-decimal prose-ol:pl-5 prose-ol:space-y-1
                  prose-li:text-text-secondary prose-li:ml-0
                  prose-blockquote:text-text-secondary prose-blockquote:border-l-brand-primary
                  [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
                  [&_li]:text-text-secondary [&_li]:ml-0"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-sm text-text-tertiary">Preview will appear here...</p>
            )}
          </div>
          <div className="absolute bottom-2 right-2 text-xs text-text-tertiary">
            Preview
          </div>
        </div>
      </div>
    </div>
  );
}
