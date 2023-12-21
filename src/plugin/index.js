import fs                     from 'node:fs';
import path                   from 'node:path';

import {
   Converter,
   ReflectionKind,
   RendererEvent }            from 'typedoc';

import {
   GlobalComponentData,
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

         // Remove unused default theme components.
         app.renderer.removeComponent('javascript-index');
         app.renderer.removeComponent('navigation-tree');

         // Make the `dmt` sub-folder on `assets`.
         app.renderer.on(RendererEvent.BEGIN, (event) => fs.mkdirSync(path.join(event.outputDirectory, 'assets',
          'dmt'), { recursive: true }));

         // At the end of rendering generate the compressed global component data.
         app.renderer.postRenderAsyncJobs.push(async (event) => GlobalComponentData.build(event, app, options));

         // Add DMT components.
         new PageRenderer(app, options);

         // Selectively load search index creation.
         if (app.options.getValue('dmtSearch')) { new SearchIndexPackr(app); }
         if (app.options.getValue('dmtSearchQuick')) { new SearchQuickIndexPackr(app); }

         // Handle any module name substitution during project conversion.
         app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) =>
         {
            if (reflection?.kind === ReflectionKind.Module && reflection.name in options.moduleNames)
            {
               reflection.name = options.moduleNames[reflection.name];
            }
         });
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}
