<script setup lang="ts">
import { Marked } from 'marked'

const props = defineProps<{ text: string }>()

function explorerObject(addr: string): string {
  return `https://explorer.iota.org/object/${addr}?network=mainnet`
}
function explorerTx(digest: string): string {
  return `https://explorer.iota.org/txblock/${digest}?network=mainnet`
}

// IOTA mainnet address = `0x` + 64 lowercase hex (covers packages, deployers,
// object IDs; system packages `0x0…02`/`0x0…03` are zero-padded to 64 too).
// IOTA tx digest = 43–44 base58 chars (no 0/O/I/l).
const TOKEN_RE = /(0x[0-9a-f]{64})|(\b[1-9A-HJ-NP-Za-km-z]{43,44}\b)/g

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ESC[c])
}

function linkify(text: string): string {
  let out = ''
  let last = 0
  for (const m of text.matchAll(TOKEN_RE)) {
    if (m.index! > last) out += escapeHtml(text.slice(last, m.index))
    const val = m[0]
    const isAddr = !!m[1]
    const href = isAddr ? explorerObject(val) : explorerTx(val)
    out += `<a href="${escapeHtml(href)}" target="_blank" rel="noopener" class="attr-addr" title="Open ${escapeHtml(val)} in IOTA Explorer">${escapeHtml(val)}</a>`
    last = m.index! + val.length
  }
  if (last < text.length) out += escapeHtml(text.slice(last))
  return out
}

const html = computed(() => {
  const marked = new Marked({
    renderer: {
      text(token: any): string {
        if (token.tokens) return this.parser.parseInline(token.tokens)
        return linkify(token.text)
      },
      codespan(token: any): string {
        return `<code>${linkify(token.text)}</code>`
      },
      code(token: any): string {
        return `<pre><code>${linkify(token.text)}</code></pre>`
      },
      link(token: any): string {
        const href = escapeHtml(token.href)
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : ''
        return `<a href="${href}" target="_blank" rel="noopener"${title}>${this.parser.parseInline(token.tokens)}</a>`
      },
    },
  })
  return marked.parse(props.text) as string
})
</script>

<template>
  <div class="attribution-md" v-html="html" />
</template>

<style>
.attribution-md {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
}
.attribution-md > :first-child { margin-top: 0; }
.attribution-md > :last-child { margin-bottom: 0; }
.attribution-md p { margin: 0.5rem 0; }
.attribution-md strong { color: var(--text, #F1F5F9); font-weight: 600; }
.attribution-md em { font-style: italic; }
.attribution-md ul { list-style: disc; padding-left: 1.25rem; margin: 0.5rem 0; }
.attribution-md ol { list-style: decimal; padding-left: 1.25rem; margin: 0.5rem 0; }
.attribution-md li { margin: 0.2rem 0; }
.attribution-md li > p { margin: 0; }
.attribution-md h1,
.attribution-md h2,
.attribution-md h3,
.attribution-md h4 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 1rem 0 0.5rem;
}
.attribution-md h1 { font-size: 1rem; }
.attribution-md h2 { font-size: 0.95rem; }
.attribution-md h3,
.attribution-md h4 { font-size: 0.9rem; }
.attribution-md blockquote {
  border-left: 2px solid var(--border-strong, #2a3958);
  padding-left: 0.75rem;
  color: var(--text-mute, #94a3b8);
  margin: 0.5rem 0;
}
.attribution-md hr {
  border: 0;
  border-top: 1px solid var(--border, #1C2740);
  margin: 1rem 0;
}
.attribution-md a {
  color: var(--accent, #F5B041);
  text-decoration: none;
}
.attribution-md a:hover { text-decoration: underline; }
.attribution-md a.attr-addr {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.92em;
}
.attribution-md code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 0.88em;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  color: var(--text, #F1F5F9);
  padding: 1px 5px;
  border-radius: 3px;
}
.attribution-md pre {
  margin: 0.75rem 0;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 6px;
  padding: 12px 14px;
  overflow-x: auto;
}
.attribution-md pre code {
  background: transparent;
  border: 0;
  padding: 0;
  font-size: 12px;
  color: var(--text-dim, #cbd5e1);
}
</style>
