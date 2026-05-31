import { defineConfig } from 'vite'
import { resolve } from 'path'
import solid from 'vite-plugin-solid'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, '..', 'web_packages', 'wasm', 'dist'),
  plugins: [tailwindcss(), solid()],
  server: {
    port: 5174,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
})
