import fs                     from 'node:fs';
import path                   from 'node:path';

import {
   Application,
   Converter,
   ReflectionKind,
   RendererEvent }            from 'typedoc';

import {
   GlobalResources,
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

   app.once(Application.EVENT_BOOTSTRAP_END, () =>
   {
      if ('default-modern' === app.options.getValue('theme'))
      {
         // Adjust default theme options. Must do so here at bootstrap end before options are locked.
         ThemeOptions.adjustDefaultOptions(app);

         // Initialize the PageRenderer in the Converter event begin to parse options before conversion.
         app.converter.once(Converter.EVENT_BEGIN, () =>
         {
            const options = new ThemeOptions(app);

            // Make the `dmt` sub-folder on `assets`.
            app.renderer.once(RendererEvent.BEGIN, (event) => fs.mkdirSync(path.join(event.outputDirectory, 'assets',
             'dmt'), { recursive: true }));

            // At the end of rendering generate the compressed global component data.
            app.renderer.once(RendererEvent.END, (event) => GlobalResources.build(event, app, options));

            // Remove unused default theme components.
            app.renderer.removeComponent('javascript-index');
            app.renderer.removeComponent('navigation-tree');

            // Add DMT components.
            new PageRenderer(app, options);

            // Selectively load search index creation.
            if (options.search) { new SearchIndexPackr(app, options); }

            // TODO: Finish implementing `searchQuick` functionality.
            // if (options.searchQuick) { new SearchQuickIndexPackr(app); }

            // Handle any module name substitution during project conversion.
            app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) =>
            {
               if (reflection?.kind === ReflectionKind.Module && reflection.name in options.moduleRemap.names)
               {
                  reflection.name = options.moduleRemap.names[reflection.name];
               }
            });
         });
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}
