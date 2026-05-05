const plausibleEnabled = process.env.NODE_ENV === 'production'

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
    },
  },
  app: {
    head: {
      title: 'IOTA Registry — Projects & Teams',
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
