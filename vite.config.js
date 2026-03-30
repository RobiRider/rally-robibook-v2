import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/rally-robibook-v2/' // Cambia esto si el repo se llama distinto
})