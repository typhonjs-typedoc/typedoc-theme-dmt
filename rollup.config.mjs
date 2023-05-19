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
      external: [ // Note `cheerio` is bundled intentionally.
         'node:fs',
         'node:path',
         'node:url',
         'typedoc'
      ],
      output: {
         file: 'dist/index.cjs',
         format: 'cjs',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: false
      },
      plugins: [
         commonjs(),
         resolve()
      ]
   },

   {
      input: 'src/web-components/index.mjs',
      treeshake: false,
      output: {
         file: 'dist/dmt-web-components.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: true
      },
      plugins: [
         // image(),

         svelte({
            compilerOptions: {
               customElement: true
            },
            preprocess: preprocess()
         }),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   }
];