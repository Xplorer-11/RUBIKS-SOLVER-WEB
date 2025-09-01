import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  worker: {
    // This is the critical line that fixes the build error.
    // It tells Vite to build the web workers from the 'cubing' library
    // using the modern 'es' format instead of the old 'iife' format.
    format: 'es',
  },
})