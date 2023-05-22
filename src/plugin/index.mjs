import fs                     from 'node:fs';
import path                   from 'node:path';

import {
   Converter,
   RendererEvent
} from 'typedoc';

import {
   SearchNavIndexPackr,
   PageRenderer,
   SearchIndexPackr }         from './renderer/index.mjs';

import {
   DefaultModernTheme,
   ThemeOptions }             from './theme/index.mjs';

/**
 * Provides a theme plugin for Typedoc augmenting the main default theme providing a modern UX look & feel.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   ThemeOptions.addDeclarations(app);

   app.converter.once(Converter.EVENT_BEGIN, () =>
   {
      // Initialize the PageRenderer in the Converter event begin to parse options before conversion.
      if ('default-modern' === app.options.getValue('theme'))
      {
         const options = new ThemeOptions(app);

         app.renderer.removeComponent('javascript-index');

         // Make the `dmt` sub-folder on `assets`.
         app.renderer.on(RendererEvent.BEGIN, (output) => fs.mkdirSync(path.join(output.outputDirectory, 'assets',
          'dmt')));

         new PageRenderer(app, options);
         new SearchIndexPackr(app);
         new SearchNavIndexPackr(app);
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}