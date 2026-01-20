import { useMemo } from 'react'

interface ContentRendererProps {
  content: string
  type: 'plain' | 'markdown' | 'html'
  className?: string
  maxLength?: number
  linkify?: boolean
}

// Simple markdown parser (no external deps)
function parseMarkdown(text: string): string {
  let html = text
    // Escape HTML first (except for our markdown transforms)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough: ~~text~~
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Code: `text`
    .replace(/`([^`]+)`/g, '<code style="background: var(--color-bgTertiary); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace;">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br />')

  return html
}

// Linkify URLs in text
function linkifyText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>')
}

// Linkify @mentions
function linkifyMentions(text: string): string {
  return text.replace(/@(\w+)/g, '<span style="color: var(--color-primary); cursor: pointer;">@$1</span>')
}

// Linkify #hashtags
function linkifyHashtags(text: string): string {
  return text.replace(/#(\w+)/g, '<span style="color: var(--color-primary); cursor: pointer;">#$1</span>')
}

export function ContentRenderer({
  content,
  type,
  className = '',
  maxLength,
  linkify = true,
}: ContentRendererProps) {
  const processedContent = useMemo(() => {
    let text = content

    // Truncate if needed
    if (maxLength && text.length > maxLength) {
      text = text.slice(0, maxLength) + '...'
    }

    // Process based on type
    switch (type) {
      case 'plain':
        // Escape HTML, then optionally linkify
        text = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\n/g, '<br />')

        if (linkify) {
          text = linkifyText(text)
          text = linkifyMentions(text)
          text = linkifyHashtags(text)
        }
        return text

      case 'markdown':
        text = parseMarkdown(text)
        if (linkify) {
          text = linkifyText(text)
          text = linkifyMentions(text)
          text = linkifyHashtags(text)
        }
        return text

      case 'html':
        // For MySpace-style HTML content, allow it through
        // but sanitize dangerous tags
        text = sanitizeHtml(text)
        if (linkify) {
          text = linkifyMentions(text)
          text = linkifyHashtags(text)
        }
        return text

      default:
        return text
    }
  }, [content, type, maxLength, linkify])

  return (
    <div
      className={className}
      style={{ color: 'var(--color-text)' }}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}

// Basic HTML sanitizer (strip dangerous tags/attributes)
function sanitizeHtml(html: string): string {
  // Remove script tags
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers
  clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: URLs
  clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
  clean = clean.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"')

  // Remove data: URLs (potential XSS vector)
  clean = clean.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src="#"')

  // Remove iframe, object, embed tags
  clean = clean.replace(/<(iframe|object|embed)[^>]*>.*?<\/\1>/gi, '')
  clean = clean.replace(/<(iframe|object|embed)[^>]*\/?>/gi, '')

  // Remove style tags (could contain expressions)
  clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  return clean
}

// For inline content (single line, no block elements)
interface InlineContentProps {
  content: string
  type: 'plain' | 'markdown'
  className?: string
  linkify?: boolean
}

export function InlineContent({
  content,
  type,
  className = '',
  linkify = true,
}: InlineContentProps) {
  const processedContent = useMemo(() => {
    let text = content.replace(/\n/g, ' ') // Remove line breaks for inline

    if (type === 'plain') {
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    } else {
      // Markdown but only inline elements
      text = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
    }

    if (linkify) {
      text = linkifyText(text)
      text = linkifyMentions(text)
      text = linkifyHashtags(text)
    }

    return text
  }, [content, type, linkify])

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
