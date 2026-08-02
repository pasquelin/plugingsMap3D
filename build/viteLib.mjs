import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// Build LIB partagé par les plugins (ESM + CJS + types), miroir du build de
// `@pasquelin/map3d`. Rien d'externe n'est embarqué : react, three et la lib elle-même
// sont des peerDependencies, fournies par l'application hôte.
export function libConfig(dir) {
  return defineConfig({
    plugins: [
      // Types par fichier (pas de `rollupTypes` : il s'appuie sur api-extractor, fragile en
      // monorepo). `dist/index.d.ts` reste le point d'entrée déclaré dans `exports`.
      dts({
        include: ['src'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        tsconfigPath: resolve(dir, 'tsconfig.json'),
      }),
    ],
    build: {
      lib: {
        entry: resolve(dir, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          'react/jsx-runtime',
          'three',
          'three-mesh-bvh',
          /^three\//,
          '@pasquelin/map3d',
          /^@pasquelin\/map3d\//,
        ],
        output: { globals: { react: 'React', 'react-dom': 'ReactDOM', three: 'THREE' } },
      },
      outDir: resolve(dir, 'dist'),
      emptyOutDir: true,
      sourcemap: false,
      target: 'es2020',
      minify: false,
    },
  })
}
