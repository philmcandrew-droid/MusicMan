import type { ReactNode } from 'react'

/**
 * Lightweight, dependency-free Markdown renderer tuned for chat output.
 * Handles headings, bold/italic, inline code, code fences, blockquotes,
 * ordered/unordered lists, horizontal rules, and paragraphs.
 */

type InlinePattern = {
  re: RegExp
  render: (m: RegExpMatchArray, key: string) => ReactNode
}

const INLINE_PATTERNS: InlinePattern[] = [
  { re: /`([^`]+)`/, render: (m, key) => <code key={key} className="md-code">{m[1]}</code> },
  { re: /\*\*([^*]+)\*\*/, render: (m, key) => <strong key={key}>{m[1]}</strong> },
  { re: /__([^_]+)__/, render: (m, key) => <strong key={key}>{m[1]}</strong> },
  { re: /\*([^*\n]+)\*/, render: (m, key) => <em key={key}>{m[1]}</em> },
  { re: /\[([^\]]+)\]\(([^)\s]+)\)/, render: (m, key) => (
    <a key={key} href={m[2]} target="_blank" rel="noreferrer">{m[1]}</a>
  ) },
]

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  let remaining = text
  let counter = 0

  while (remaining.length > 0) {
    let best: { index: number; match: RegExpMatchArray; render: InlinePattern['render'] } | null = null

    for (const p of INLINE_PATTERNS) {
      const m = remaining.match(p.re)
      if (m && m.index !== undefined && (best === null || m.index < best.index)) {
        best = { index: m.index, match: m, render: p.render }
      }
    }

    if (!best) {
      nodes.push(remaining)
      break
    }

    if (best.index > 0) nodes.push(remaining.slice(0, best.index))
    nodes.push(best.render(best.match, `${keyPrefix}-i${counter++}`))
    remaining = remaining.slice(best.index + best.match[0].length)
  }

  return nodes
}

const BLOCK_START = /^(#{1,6}\s|```|>\s?|\s*[-*+]\s+|\s*\d+\.\s+)/
const HR = /^(---|\*\*\*|___)\s*$/

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code fence
    if (/^```/.test(line.trim())) {
      i++
      const buf: string[] = []
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i])
        i++
      }
      i++ // closing fence
      blocks.push(<pre key={key++} className="md-pre"><code>{buf.join('\n')}</code></pre>)
      continue
    }

    // Blank line
    if (line.trim() === '') {
      i++
      continue
    }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      blocks.push(
        <p key={key++} className={`md-h md-h${h[1].length}`}>{renderInline(h[2], `h${key}`)}</p>,
      )
      i++
      continue
    }

    // Horizontal rule
    if (HR.test(line.trim())) {
      blocks.push(<hr key={key++} className="md-hr" />)
      i++
      continue
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const buf: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push(<blockquote key={key++} className="md-quote">{renderInline(buf.join(' '), `q${key}`)}</blockquote>)
      continue
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''))
        i++
      }
      blocks.push(
        <ul key={key++} className="md-ul">
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `ul${key}-${idx}`)}</li>)}
        </ul>,
      )
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      blocks.push(
        <ol key={key++} className="md-ol">
          {items.map((it, idx) => <li key={idx}>{renderInline(it, `ol${key}-${idx}`)}</li>)}
        </ol>,
      )
      continue
    }

    // Paragraph
    const buf: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !BLOCK_START.test(lines[i]) &&
      !HR.test(lines[i].trim())
    ) {
      buf.push(lines[i])
      i++
    }
    blocks.push(<p key={key++} className="md-p">{renderInline(buf.join(' '), `p${key}`)}</p>)
  }

  return <div className="md">{blocks}</div>
}
