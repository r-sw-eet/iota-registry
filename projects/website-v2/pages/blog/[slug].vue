<script setup lang="ts">
import { marked } from 'marked'
import { findBlogPost, isScheduled } from '~/data/blog'

const route = useRoute()
const post = computed(() => findBlogPost(String(route.params.slug)))

useHead(() => ({
  title: post.value
    ? `${post.value.title} — Blog — IOTA Registry`
    : 'Blog — IOTA Registry',
}))

// The post body may contain one of two markers that slot a Vue component
// between markdown halves:
//   <!-- INFOGRAPHICS -->       → YearOneInfographics (birthday post)
//   <!-- SCREENSHOT_SLIDER -->  → ScreenshotSlider (origin post)
// Posts without a marker render as a single block.
type Widget = 'infographics' | 'slider' | null

const bodyChunks = computed<{ before: string; after: string; widget: Widget }>(() => {
  if (!post.value) return { before: '', after: '', widget: null }
  const raw = post.value.body.trim()
  const markers: { key: Widget; token: string }[] = [
    { key: 'infographics', token: '<!-- INFOGRAPHICS -->' },
    { key: 'slider', token: '<!-- SCREENSHOT_SLIDER -->' },
  ]
  for (const { key, token } of markers) {
    if (!raw.includes(token)) continue
    const [a, b] = raw.split(token)
    return {
      before: marked.parse(a.trim(), { async: false }) as string,
      after: marked.parse((b || '').trim(), { async: false }) as string,
      widget: key,
    }
  }
  return {
    before: marked.parse(raw, { async: false }) as string,
    after: '',
    widget: null,
  }
})

// Screenshot slider slides for the origin post.
const itsSlides = [
  { src: '/images/its-network_1.png',      label: 'Network — core metrics, supply, transaction rate' },
  { src: '/images/its-network_2.png',      label: 'Network — historical trends (storage fund, gas burn, TX charts)' },
  { src: '/images/its-ecosystem_1.png',    label: 'Ecosystem — L1 Move VM projects + L2 EVM' },
  { src: '/images/its-ecosystem_2.png',    label: 'Ecosystem — Unattributed deployers + Teams' },
  { src: '/images/its-economics_1.png',    label: 'Economics — gas burn, inflation vs deflation, storage pricing, reality check' },
  { src: '/images/its-architecture_1.png', label: 'Architecture — how the pieces fit together' },
  { src: '/images/its-sources_1.png',      label: 'Sources — useful IOTA ecosystem links' },
]
</script>

<template>
  <article class="post-page">
    <NuxtLink to="/blog" class="back-link">← All posts</NuxtLink>

    <div v-if="!post" class="state error">Post not found.</div>
    <template v-else>
      <header class="post-head">
        <div class="post-meta">
          <span v-if="isScheduled(post)" class="sched-chip">Scheduled · {{ post.publishedAt }}</span>
          <template v-else>
            <span class="date">{{ post.publishedAt }}</span>
            <span class="sep">·</span>
          </template>
          <span class="author">{{ post.author }}</span>
        </div>
        <h1>{{ post.title }}</h1>
        <p v-if="post.subtitle" class="subtitle">{{ post.subtitle }}</p>
      </header>

      <div class="post-body" v-html="bodyChunks.before" />
      <YearOneInfographics v-if="bodyChunks.widget === 'infographics' && post.slug === 'iota-mainnet-year-one'" />
      <ScreenshotSlider v-else-if="bodyChunks.widget === 'slider'" :slides="itsSlides" />
      <div v-if="bodyChunks.after" class="post-body" v-html="bodyChunks.after" />
    </template>
  </article>
</template>

<style scoped>
.post-page { padding-bottom: 80px; max-width: 72ch; margin: 0 auto; }
.back-link {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
  margin-bottom: 24px;
}
.back-link:hover { color: var(--accent, #F5B041); }

.post-head { margin-bottom: 28px; }
.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--text-mute, #94a3b8);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.post-meta .sep { opacity: 0.4; }
.sched-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--accent-soft, rgba(245,176,65,0.12));
  border: 1px solid var(--accent, #F5B041);
  color: var(--accent, #F5B041);
  letter-spacing: 0.06em;
  font-size: 10px;
  font-weight: 600;
}

.post-head h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 34px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 6px;
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.post-head .subtitle {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 17px;
  font-style: italic;
  color: var(--text-dim, #cbd5e1);
  margin: 0;
  font-weight: 400;
}

.state.error {
  padding: 40px;
  text-align: center;
  color: #fca5a5;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}

.post-body {
  color: var(--text-dim, #cbd5e1);
  font-size: 15px;
  line-height: 1.75;
}
</style>

<style>
/* Global (un-scoped) styles for marked-rendered HTML so child elements in
   v-html hit the rules. */
.post-body h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 32px 0 12px;
  letter-spacing: -0.01em;
}
.post-body h3 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 24px 0 10px;
}
.post-body p { margin: 0 0 16px; }
.post-body ul, .post-body ol {
  margin: 0 0 16px;
  padding-left: 22px;
}
.post-body li { margin-bottom: 6px; }
.post-body a {
  color: var(--accent, #F5B041);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.post-body strong { color: var(--text, #F1F5F9); font-weight: 600; }
.post-body em { font-style: italic; }
.post-body code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  color: var(--text, #F1F5F9);
}
.post-body blockquote {
  margin: 16px 0;
  padding: 14px 16px;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-left: 3px solid var(--accent, #F5B041);
  border-radius: 6px;
  color: var(--text-dim, #cbd5e1);
  font-size: 14px;
  line-height: 1.6;
}
.post-body blockquote p:last-child { margin-bottom: 0; }

.post-body .post-figure {
  margin: 24px 0;
  padding: 0;
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface, #111A2B);
}
.post-body .post-figure img {
  width: 100%;
  display: block;
  border-bottom: 1px solid var(--border, #1C2740);
}
.post-body .post-figure figcaption {
  padding: 10px 14px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--text-mute, #94a3b8);
}
</style>
