import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  components: [
    {
      path: '~/components/app',
      pathPrefix: false,
    },
  ],
  app: {
    head: {
      titleTemplate: '%s - AssetFlow',
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['@vue/devtools-core', '@vue/devtools-kit'],
    },
  },

  runtimeConfig: {
    apiBaseServer: 'http://localhost:3333',
    public: {
      apiBase: 'http://localhost:3333',
      googleAuthEnabled: 'false',
      githubAuthEnabled: 'false',
    },
  },

  icon: {
    localApiEndpoint: '/_nuxt_icon',
  },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    'shadcn-nuxt',
  ],
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },
  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui',
  },
});
