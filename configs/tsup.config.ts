import {defineConfig, Options} from 'tsup'

const iifeOptions: Options = {
  format: ['iife'],
  target: 'es2020',
  platform: 'browser',
  outDir: 'dist/browser',
  dts: true,
  outExtension: () => ({js: '.min.js'}),
  splitting: true,
  sourcemap: true,
  noExternal: [/.*/],
}

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts',
      string: 'src/Utils/string.ts',
      address: 'src/Address/index.ts',
      extension: 'src/ExtensionTools/index.ts',
      chainLens: 'src/ChainLens/index.ts',
      exchangeInfo: 'src/ExchangeInfo/index.ts',
      royalties: 'src/Royalties/index.ts',
      hashes: 'src/Hashes/index.ts',
    },
    format: [
      'esm',
      'cjs'
    ],
    target: 'es2020',
    dts: true,
    // splitting: false,
    sourcemap: true,
    // noExternal: [/^base/, /\^@noble/],
  },
  {
    entry: {
      index: 'src/index.ts',
    },
    globalName: 'UniqueUtils',
    ...iifeOptions,
  },
  {
    entry: {
      extension: 'src/ExtensionTools/index.ts',
    },
    globalName: 'ExtensionTools',
    ...iifeOptions,
  },
  {
    entry: {
      chainLens: 'src/ChainLens/index.ts',
    },
    globalName: 'ChainLens',
    ...iifeOptions,
  },
  {
    entry: {
      hashes: 'src/Hashes/index.ts',
    },
    globalName: 'UniqueHashes',
    ...iifeOptions,
  },
])
