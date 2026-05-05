// Post-build step: generate per-blog-post HTML shells with custom OG/Twitter
// meta tags, so social-media crawlers (which don't run JS) see the right
// preview image, title, and description for each post URL.
//
// Why this exists: nuxt.config.ts uses `ssr: false`, so per-page useSeoMeta()
// only runs in the browser. Crawlers see the static 200.html with site-default
// meta tags. Nuxt's `routeRules: { '/blog/**': { ssr: true } }` does not
// override a global ssr:false in `nuxi generate`, so we patch the static
// output ourselves.
//
// Convention: if `previewImage` is `/images/foo.png`, the script prefers
// `/images/foo-og.png` (1200×630, generated once via PIL/ffmpeg). Falls
// back to the original if the -og sibling does not exist on disk.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createJiti } from 'jiti'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = join(ROOT, '.output/public')
const SITE = 'https://iota-registry.org'

const jiti = createJiti(import.meta.url, { interopDefault: true })
const { BLOG_POSTS } = await jiti.import(join(ROOT, 'data/blog.ts'))

const template = readFileSync(join(OUT, '200.html'), 'utf8')

function ogImageFor(post) {
  const fallback = '/images/its-network_1.png'
  const src = post.previewImage || fallback
  const og = src.replace(/\.(png|jpg|jpeg|webp)$/i, '-og.$1')
  const onDisk = join(OUT, og.replace(/^\//, ''))
  return existsSync(onDisk) ? og : src
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function patchHead(html, post) {
  const url = `${SITE}/blog/${post.slug}`
  const image = `${SITE}${ogImageFor(post)}`
  const title = escapeHtml(`${post.title} — IOTA Registry`)
  const desc = escapeHtml(post.summary)

  const replacements = [
    [/<title>[^<]*<\/title>/, `<title>${title}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`],
    [/<meta property="og:type" content="[^"]*">/, `<meta property="og:type" content="article">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`],
    [/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`],
    [/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url}">`],
    [/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`],
    [/<meta property="og:image:width" content="[^"]*">/, `<meta property="og:image:width" content="1200">`],
    [/<meta property="og:image:height" content="[^"]*">/, `<meta property="og:image:height" content="630">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${title}">`],
    [/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${desc}">`],
    [/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`],
  ]

  let out = html
  for (const [re, val] of replacements) {
    if (!re.test(out)) {
      throw new Error(`Template missing expected meta tag: ${re}`)
    }
    out = out.replace(re, val)
  }

  // Inject article-specific meta after og:image:height
  const articleMeta = [
    `<meta property="article:published_time" content="${post.publishedAt}">`,
    `<meta property="article:author" content="${escapeHtml(post.author)}">`,
  ].join('\n')
  out = out.replace(
    /(<meta property="og:image:height" content="630">)/,
    `$1\n${articleMeta}`,
  )
  return out
}

let written = 0
for (const post of BLOG_POSTS) {
  const html = patchHead(template, post)
  const dir = join(OUT, 'blog', post.slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html, 'utf8')
  written++
}
console.log(`build-blog-og: wrote ${written} per-post HTML shells under .output/public/blog/`)
