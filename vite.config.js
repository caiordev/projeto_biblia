import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Determinar o base path com base no ambiente
const isAWS = process.env.AWS_AMPLIFY === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // Usar '/' para AWS Amplify e '/projeto_biblia/' para GitHub Pages
  base: isAWS ? '/' : '/projeto_biblia/',
})
