import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const resolveFromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolveFromRoot('index.html'),
        privacy: resolveFromRoot('privacy.html'),
      },
    },
  },
})
