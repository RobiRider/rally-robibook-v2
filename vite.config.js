import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Cambia lo que haya aquí por el nombre exacto de tu nuevo repositorio
  base: '/rally-robibook-v2/' 
})