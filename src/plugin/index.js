import fs                     from 'node:fs';
import path                   from 'node:path';

import {
   Converter,
   RendererEvent
} from 'typedoc';

import {
   NavigationBuilder,
   PageRenderer,
   SearchIndexPackr,
   SearchQuickIndexPackr }    from './renderer/index.js';

import {
   DefaultModernTheme,
   ThemeOptions }             from './theme/index.js';

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

         // Stop all generation of the navigation sidebar.
         app.renderer.theme?.stopNavigationGeneration();

         // Remove unused default theme components.
         app.renderer.removeComponent('javascript-index');
         app.renderer.removeComponent('navigation-tree');

         // Make the `dmt` sub-folder on `assets`.
         app.renderer.on(RendererEvent.BEGIN, (output) => fs.mkdirSync(path.join(output.outputDirectory, 'assets',
          'dmt'), { recursive: true }));

         // Add DMT components.
         new NavigationBuilder(app);
         new PageRenderer(app, options);

         // Selectively load search index creation.
         if (app.options.getValue('dmtSearch')) { new SearchIndexPackr(app); }
         if (app.options.getValue('dmtSearchQuick')) { new SearchQuickIndexPackr(app); }
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}