import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Served from https://<user>.github.io/persian-kings/ on GitHub Pages, so the
// production build needs that base path; dev stays at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/persian-kings/' : '/',
  plugins: [react()],
}))
