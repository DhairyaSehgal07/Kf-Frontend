import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
     tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: 'tanstack-vendor',
              test: /[\\/]node_modules[\\/]@tanstack[\\/]/,
              priority: 20,
            },
            {
              name: 'ui-vendor',
              test: /[\\/]node_modules[\\/](@radix-ui|radix-ui|lucide-react)[\\/]/,
              priority: 10,
            },
            {
              name: 'vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 0,
            },
          ],
        },
      },
    },
  },
  server: {
    port:3000
  }
});
