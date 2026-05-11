import { execSync } from 'node:child_process'

const plausibleEnabled = process.env.NODE_ENV === 'production'

function gitInfo(): { sha: string; date: string } {
  try {
    const sha = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    const date = execSync('git log -1 --format=%cI HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
    return { sha, date }
  } catch {
    return { sha: '', date: '' }
  }
}
const git = gitInfo()

export default defineNuxtConfig({
  compatibilityDate: '2026-04-22',
  ssr: false,
  devtools: { enabled: true },
  css: [
    '~/assets/css/theme.css',
    '~/assets/css/app.css',
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://iota-trade-scanner.net/api/v1',
      commitSha: git.sha,
      commitDate: git.date,
    },
  },
  // Pre-render blog routes with SSR so OG/Twitter meta tags are baked into
  // the static HTML — Twitter / LinkedIn / Facebook crawlers don't run JS,
  // so client-side `useSeoMeta` would otherwise be invisible to them.
  routeRules: {
    '/blog': { ssr: true, prerender: true },
    '/blog/**': { ssr: true, prerender: true },
  },
  app: {
    head: {
      title: 'IOTA Registry — Projects & Teams',
      meta: [
        { name: 'description', content: 'Honest registry of IOTA Rebased L1 projects, teams, and announcements. Actual on-chain numbers, not curated press releases.' },
        // Open Graph defaults — per-page useSeoMeta() overrides these on
        // SSR-prerendered routes (see routeRules above for blog pages).
        { property: 'og:site_name', content: 'IOTA Registry' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'IOTA Registry — Projects & Teams' },
        { property: 'og:description', content: 'Honest registry of IOTA Rebased L1 projects, teams, and announcements. Actual on-chain numbers, not curated press releases.' },
        { property: 'og:url', content: 'https://iota-registry.org/' },
        { property: 'og:image', content: 'https://iota-registry.org/images/site-og.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'IOTA Registry — Projects & Teams' },
        { name: 'twitter:description', content: 'Honest registry of IOTA Rebased L1 projects, teams, and announcements.' },
        { name: 'twitter:image', content: 'https://iota-registry.org/images/site-og.png' },
      ],
      script: plausibleEnabled
        ? [
            { src: 'https://plausible.io/js/pa-DWMfDCTX_xttSKfBSXbM1.js', async: true },
            {
              innerHTML:
                'window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()',
            },
          ]
        : [],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
          crossorigin: 'anonymous',
          referrerpolicy: 'no-referrer',
        },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
