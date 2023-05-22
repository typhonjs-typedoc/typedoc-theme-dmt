import commonjs   from '@rollup/plugin-commonjs';
import resolve    from '@rollup/plugin-node-resolve';
import terser     from '@rollup/plugin-terser';
import svelte     from 'rollup-plugin-svelte';
import preprocess from 'svelte-preprocess';

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
   {
      input: 'src/plugin/index.mjs',
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
         file: 'dist/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         sourcemap: false
      },
      plugins: [
         commonjs(),
         resolve()
      ]
   },

   {
      input: 'src/web-components/index.mjs',
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