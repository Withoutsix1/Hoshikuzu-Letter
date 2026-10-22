import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: { preserveSymlinks: true },
  build: {
    target: 'es2022',
    lib: { entry: 'src/index.tsx', formats: ['es'], fileName: () => 'index.js' },
    rollupOptions: {
      external: id => id === '@avg-studio/sdk' || /^react(?:-dom)?(?:\/|$)/.test(id),
      output: { inlineDynamicImports: true }
    },
    sourcemap: true,
    minify: false
  }
});
