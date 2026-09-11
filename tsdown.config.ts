import { defineConfig } from 'tsdown'

export default defineConfig({
  attw: true,
  dts: {
    sourcemap: true,
  },
  exports: {
    enabled: true,
    devExports: true,
  },
  format: ['cjs', 'esm'],
  // Every entry mixes a default export (the factory class) with named exports,
  // so the CJS bundle cannot collapse `module.exports` to the default value.
  // Declaring the named-export contract explicitly documents that shape and
  // silences the bundler's MIXED_EXPORTS warning.
  outputOptions: {
    exports: 'named',
  },
  publint: true,
  tsconfig: 'tsconfig.build.json',
  workspace: true,
})
