import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/lucide-react')) return 'icons'
            if (id.includes('node_modules/motion')) return 'motion'
          },
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'html-og-site-url',
        transformIndexHtml(html: string) {
          return html.replace(/__SITE_URL__/g, siteUrl)
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
