import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@map3d/plugin-template': resolve(__dirname, '../src/index.ts'),
      'three/addons': resolve(__dirname, '../../../node_modules/three/examples/jsm'),
    },
  },
  server: { port: 5181 },
})
