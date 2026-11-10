import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Guard against Rayon threadpool allocation error 1450 on Windows environments
process.env.RAYON_NUM_THREADS = process.env.RAYON_NUM_THREADS || '1';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
