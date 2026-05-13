'use client'
import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeBlockProps {
  title: string
  code: string
  filename: string
}

function tryParseJson(code: string): string | null {
  // First attempt — parse directly
  try {
    const parsed = JSON.parse(code)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // continue
  }

  // Second attempt — Azure Logic App expressions: validate with placeholders, restore originals
  try {
    const placeholders: string[] = []
    const sanitized = code
      .replace(/@\{[^}]*\}/g, (m) => {
        placeholders.push(m)
        return `"__AZ_${placeholders.length - 1}__"`
      })
      .replace(/\?\[/g, '[')
      .replace(/\?'/g, "'")
      .replace(/\?"/g, '"')
    const parsed = JSON.parse(sanitized)
    let result = JSON.stringify(parsed, null, 2)
    placeholders.forEach((p, i) => {
      result = result.replaceAll(`"__AZ_${i}__"`, p)
    })
    return result
  } catch {
    // continue
  }

  // Third attempt — more aggressive sanitize, same restore trick
  try {
    const placeholders: string[] = []
    const sanitized = code
      .replace(/"@[^"]*"/g, (m) => {
        placeholders.push(m)
        return `"__AZ_${placeholders.length - 1}__"`
      })
      .replace(/\?\[/g, '[')
    const parsed = JSON.parse(sanitized)
    let result = JSON.stringify(parsed, null, 2)
    placeholders.forEach((p, i) => {
      result = result.replaceAll(`"__AZ_${i}__"`, p)
    })
    return result
  } catch {
    // give up
  }

  // Step 4 — all parses failed: naive indenter so it never stays one line
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
    let out = '', depth = 0, inStr = false
    for (let i = 0; i < code.length; i++) {
      const c = code[i]
      if (c === '"' && code[i - 1] !== '\\') inStr = !inStr
      if (!inStr && (c === '{' || c === '['))      { out += c + '\n' + '  '.repeat(++depth) }
      else if (!inStr && (c === '}' || c === ']')) { depth = Math.max(0, depth - 1); out += '\n' + '  '.repeat(depth) + c }
      else if (!inStr && c === ',')                { out += c + '\n' + '  '.repeat(depth) }
      else                                         { out += c }
    }
    return out
  }

  return null
}

function formatCode(code: string): string {
  // Step 1 — XML detection (Wazuh rules) — pretty print it
  if (code.trim().startsWith('<')) {
    try {
      // Split only at tag boundaries — do NOT split inline tag content
      const lines = code
        .replace(/>\s*</g, '>\n<')
        // NOTE: The line below was intentionally removed — it was splitting
        // inline elements like <if_group>syslog</if_group> across two lines,
        // producing invalid Wazuh XML. Only split at ><, never inside a tag.
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0)

      let indent = 0
      return lines.map(line => {
        // Closing tag — decrease indent before printing
        if (line.startsWith('</')) {
          indent = Math.max(0, indent - 1)
          const pad = '  '.repeat(indent)
          return pad + line
        }
        // Self-closing tag — no indent change
        if (line.endsWith('/>')) {
          const pad = '  '.repeat(indent)
          return pad + line
        }
        // Opening tag with matching close on same line e.g. <id>T1110</id>
        if (line.match(/^<[^/][^>]*>.*<\/[^>]+>$/)) {
          const pad = '  '.repeat(indent)
          return pad + line
        }
        // Pure opening tag — print then increase indent
        if (line.startsWith('<') && !line.startsWith('</')) {
          const pad = '  '.repeat(indent)
          indent++
          return pad + line
        }
        // Text content line
        const pad = '  '.repeat(indent)
        return pad + line
      }).join('\n').trim()
    } catch {
      return code
    }
  }

  // Step 2 — Elastic EQL detection — fix semicolon placement, protect sequence brackets
  const isEQL = /^(sequence|process|network|authentication)\b/.test(code.trim())
  if (isEQL) {
    return code
      .replace(/\s*;\s*/g, '\n;\n')
      // Only break where/and/or onto new lines when NOT inside [ ] sequence brackets
      .replace(/\[([^\]]+)\]/g, (match) => {
        // Preserve everything inside brackets on one line — do not split
        return match.replace(/\s+/g, ' ').trim()
      })
      .replace(/\b(where|and|or)\b(?![^\[]*\])/g, '\n  $1')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  // Step 3 — Try to parse as JSON — Shuffle, Sentinel Playbooks, Tines
  if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
    const result = tryParseJson(code)
    if (result) return result
    return code
  }

  // Step 4 — Python detection (Splunk SOAR / Palo Alto XSOAR)
  const isPython =
    code.trim().startsWith('import phantom') ||
    code.trim().startsWith('import demisto') ||
    code.trim().startsWith('from CommonServerPython')

  if (isPython) {
    // Normalize: split "def X(): firstStatement" into two separate lines
    const normalized = code
      .replace(/(def \w+\([^)]*\):)\s*(?!;)(.+)/g, '$1\n$2')

    let indent = 0
    return normalized
      .split(/;\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .flatMap(segment => {
        // If normalization produced embedded newlines, split further
        if (segment.includes('\n')) {
          return segment.split('\n').map(l => l.trim()).filter(l => l.length > 0)
        }
        return [segment]
      })
      .map(line => {
        // Top-level def with no body on same line — reset indent, then increase for body
        if (/^def \w+\([^)]*\):$/.test(line)) {
          indent = 0
          const pad = '  '.repeat(indent)
          indent = 1
          return pad + line
        }
        // if __name__ always at indent 0
        if (/^if __name__/.test(line)) {
          indent = 0
          return line
        }
        // on_finish with pass inline — top level no indent
        if (/^def on_finish.+pass$/.test(line)) {
          indent = 0
          return line
        }
        const pad = '  '.repeat(indent)
        return pad + line
      })
      .join('\n')
      .trim()
  }

  // Step 5 — Splunk SPL and KQL (Microsoft Sentinel) — untouched, working correctly
  return code
    .replace(/;\s*/g, ';\n')
    .replace(/\|\s*/g, '\n| ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function CodeBlock({ title, code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const formattedCode = formatCode(code)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([formattedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center justify-between bg-card px-4 py-3 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <div className="bg-[#000000] p-4 overflow-x-auto">
        <pre
          className="text-sm font-mono text-gray-100"
          style={{ whiteSpace: 'pre', overflowWrap: 'normal' }}
          dangerouslySetInnerHTML={{ __html: escapeHtml(formattedCode) }}
        />
      </div>
      <div className="bg-card px-4 py-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download {filename}
        </Button>
      </div>
    </div>
  )
}