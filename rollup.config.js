import commonjs            from '@rollup/plugin-commonjs';
import resolve             from '@rollup/plugin-node-resolve';
import terser              from '@rollup/plugin-terser';
import { importsResolve }  from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import svelte              from 'rollup-plugin-svelte';
import preprocess          from 'svelte-preprocess';

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
   {
      input: 'src/plugin/index.js',
      external: [
         '@rollup/plugin-node-resolve',
         '@rollup/plugin-terser',
         '@rollup/plugin-virtual',
         'cheerio',
         'lunr',
         'node:fs',
         'node:path',
         'node:url',
         'rollup',
         'svelte/compiler',
         'typedoc'
      ],
      output: {
         file: 'dist/index.js',
         format: 'es',
         generatedCode: { constBindings: true },
         sourcemap: false
      },
      plugins: [
         commonjs(),
         importsResolve(),
         resolve()
      ]
   },

   {
      input: 'src/search-quick/index.js',
      output: {
         file: 'dist/dmt-search-quick.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: true
      },
      plugins: [
         svelte({
            preprocess: preprocess()
         }),

         commonjs(),
         importsResolve(),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   },

   {
      input: 'src/web-components/index.js',
      external: ['../main.js', './dmt-nav-web-component.js'],   // `main.js` is loaded from this bundle.
      output: {
         file: 'dist/dmt-web-components.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: true
      },
      plugins: [
         svelte({
            preprocess: preprocess()
         }),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   }
];