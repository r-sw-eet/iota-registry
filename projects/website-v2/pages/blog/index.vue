<script setup lang="ts">
import { publishedBlogPosts, isScheduled, type BlogPost } from '~/data/blog'

useHead({ title: 'Blog — IOTA Registry' })
useSeoMeta({
  ogTitle: 'Blog — IOTA Registry',
  ogDescription: 'Editorial posts — origin story, year-in-review pieces, and the accountability-led reading of what is actually happening on IOTA L1.',
  ogUrl: 'https://iota-registry.org/blog',
  ogImage: 'https://iota-registry.org/images/its-network_1.png',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Blog — IOTA Registry',
  twitterDescription: 'Editorial posts — origin story, year-in-review pieces, and the accountability-led reading of what is actually happening on IOTA L1.',
  twitterImage: 'https://iota-registry.org/images/its-network_1.png',
})

const posts = computed<BlogPost[]>(() => publishedBlogPosts())
</script>

<template>
  <div class="blog-index">
    <header class="blog-head">
      <h1>Blog</h1>
      <p class="lede">
        Editorial posts — origin story, year-in-review pieces, and the accountability-led reading
        of what's actually happening on IOTA L1.
      </p>
    </header>

    <div v-if="!posts.length" class="state">No published posts yet.</div>
    <ul v-else class="post-list">
      <li v-for="p in posts" :key="p.slug">
        <NuxtLink :to="`/blog/${p.slug}`" class="post-card" :class="{ 'has-preview': !!p.previewImage }">
          <div v-if="p.previewImage" class="preview">
            <img :src="p.previewImage" :alt="p.title" loading="lazy" @error="(e: Event) => ((e.target as HTMLImageElement).style.display = 'none')" />
          </div>
          <div class="body">
            <div class="post-meta">
              <span v-if="isScheduled(p)" class="sched-chip">Scheduled · {{ p.publishedAt }}</span>
              <template v-else>
                <span class="date">{{ p.publishedAt }}</span>
                <span class="sep">·</span>
              </template>
              <span class="author">{{ p.author }}</span>
            </div>
            <h2 class="title">{{ p.title }}</h2>
            <p v-if="p.subtitle" class="subtitle">{{ p.subtitle }}</p>
            <p class="summary">{{ p.summary }}</p>
            <span class="read">Read →</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.blog-index { padding-bottom: 60px; max-width: 72ch; margin: 0 auto; }
.blog-head { margin-bottom: 32px; }
.blog-head h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 32px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.lede {
  color: var(--text-dim, #cbd5e1);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  max-width: 72ch;
}

.post-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.post-card {
  display: flex;
  gap: 20px;
  padding: 20px 22px;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 12px;
  text-decoration: none;
  transition: border-color .12s;
}
.post-card:hover { border-color: var(--accent, #F5B041); }
.post-card .body { flex: 1 1 auto; min-width: 0; }

.post-card .preview {
  flex: 0 0 auto;
  width: 200px;
  aspect-ratio: 16 / 10;
  border-radius: 8px;
  overflow: hidden;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
}
.post-card .preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
@media (max-width: 640px) {
  .post-card { flex-direction: column; gap: 14px; }
  .post-card .preview { width: 100%; }
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-mute, #94a3b8);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.post-meta .sep { opacity: 0.4; }
.sched-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--accent-soft, rgba(245,176,65,0.12));
  border: 1px solid var(--accent, #F5B041);
  color: var(--accent, #F5B041);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 600;
}

.post-card .title {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}
.post-card .subtitle {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 15px;
  font-style: italic;
  color: var(--text-dim, #cbd5e1);
  margin: 0 0 10px;
  font-weight: 400;
}
.post-card .summary {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-dim, #cbd5e1);
  margin: 0 0 12px;
}
.post-card .read {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--accent, #F5B041);
}

.state {
  padding: 40px;
  text-align: center;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}
</style>
