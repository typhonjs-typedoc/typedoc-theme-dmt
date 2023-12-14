import commonjs            from '@rollup/plugin-commonjs';
import resolve             from '@rollup/plugin-node-resolve';
import terser              from '@rollup/plugin-terser';
import { importsResolve }  from '@typhonjs-build-test/rollup-plugin-pkg-imports';
import autoprefixer        from 'autoprefixer';
import cssnano             from 'cssnano';
import postcssPresetEnv    from 'postcss-preset-env';
import postcss             from 'rollup-plugin-postcss';
import svelte              from 'rollup-plugin-svelte';
import preprocess          from 'svelte-preprocess';

const banner = `/**
 * @module @typhonjs-typedoc/typedoc-theme-dmt
 * @license MPL-2.0
 * @see https://github.com/typhonjs-typedoc/typedoc-theme-dmt
 */
 `;

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
         banner,
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
      input: 'src/components/index.js',
      external: ['./dmt-component-data.js'],
      output: {
         banner,
         file: 'dist/assets/dmt-components.js',
         format: 'es',
         generatedCode: { constBindings: true },
         plugins: [terser()],
         sourcemap: false
      },
      plugins: [
         svelte({
            preprocess: preprocess()
         }),

         postcss(postcssConfig({
            extract: 'dmt-components.css',
            compress: true,
            sourceMap: false
         })),

         commonjs(),
         importsResolve(),

         resolve({
            browser: true,
            dedupe: ['svelte']
         }),
      ]
   }
];

/**
 * Provides a function to return a new PostCSS configuration setting the extract parameter.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {string}   [opts.extract] - Name of CSS file to extract to...
 *
 * @param {boolean}  [opts.compress=false] - Compress CSS.
 *
 * @param {boolean}  [opts.sourceMap=false] - Generate source maps.
 *
 * @returns {{extensions: string[], extract, sourceMap: boolean, plugins: (*)[], use: string[], inject: boolean}}
 *          PostCSS config
 */
export function postcssConfig({ extract, compress = false, sourceMap = false } = {})
{
   const plugins = compress ? [autoprefixer, postcssPresetEnv, cssnano] : [autoprefixer, postcssPresetEnv];

   return {
      inject: false,                                        // Don't inject CSS into <HEAD>
      extract,
      sourceMap,
      extensions: ['.scss', '.sass', '.css'],               // File extensions
      plugins,                                              // Postcss plugins to use
      use: ['sass']                                         // Use sass / dart-sass
   };
}
