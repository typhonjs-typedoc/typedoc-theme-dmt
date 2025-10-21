import fs                  from 'node:fs';
import path                from 'node:path';

import {
   Application,
   Converter,
   ReflectionKind,
   RendererEvent }         from 'typedoc';

import {
   GlobalResources,
   NavigationIndex,
   PageRenderer,
   SearchIndexPackr }      from './renderer/index.js';

import {
   DefaultModernTheme,
   ThemeOptions }          from './theme/index.js';

/**
 * Remove the following tags parsed from class declarations that are not supported by TypeDoc:
 * - `@implements` for ES Module JSDoc.
 *
 * @type {Set<string>}
 */
const jsdocClassTagsRemove = new Set(['@implements']);

/**
 * Provides a theme plugin for Typedoc augmenting the main default theme providing a modern UX look & feel.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   ThemeOptions.addDeclarations(app);

   app.on(Application.EVENT_BOOTSTRAP_END, () =>
   {
      if ('default-modern' === app.options.getValue('theme'))
      {
         // Adjust default theme options. Must do so here at bootstrap end before options are locked.
         ThemeOptions.adjustDefaultOptions(app);

         let bootstrapped = false;

         // Bootstrap at Converter event begin to parse options before conversion. TypeDoc doesn't provide a clean
         // way to access the completed app `options` loading until this point and doesn't offer another event callback.
         //
         // Mono-repos / multiple project conversion will invoke `Converter.EVENT_BEGIN` multiple times so just
         // bootstrap once.
         app.converter.on(Converter.EVENT_BEGIN, () =>
         {
            if (!bootstrapped)
            {
               bootstrap(app);
               bootstrapped = true;
            }
         });
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}

/**
 * Bootstraps the DMT lifecycle.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
function bootstrap(app)
{
   const options = new ThemeOptions(app);

   // Make the `dmt` sub-folder on `assets`.
   app.renderer.on(RendererEvent.BEGIN, (event) => fs.mkdirSync(path.join(event.outputDirectory, 'assets',
    'dmt'), { recursive: true }));

   // Transform / parse TypeDoc navigation index.
   app.renderer.on(RendererEvent.BEGIN, (event) => NavigationIndex.transform(app, event.project, options));

   // At the end of rendering generate the compressed global component data.
   app.renderer.on(RendererEvent.END, (event) => GlobalResources.build(event, app, options), -100);

   // TODO: REMOVE TYPEDOC 0.26 CHANGES - `removeComponent` no longer available.
   // ------------------------------------------
   // Remove unused default theme components.
   // app.renderer.removeComponent('javascript-index');
   // app.renderer.removeComponent('navigation-tree');
   // ------------------------------------------

   // Add DMT components.
   new PageRenderer(app, options);

   // Selectively load search index creation.
   if (options.search) { new SearchIndexPackr(app, options); }

   // TODO: Finish implementing `searchQuick` functionality.
   // if (options.searchQuick) { new SearchQuickIndexPackr(app); }

   // Remove unused JSDoc comment block tags from classes; for ESM.
   app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) =>
   {
      if (reflection?.kind === ReflectionKind.Class)
      {
         if (Array.isArray(reflection?.comment?.blockTags))
         {
            const blockTags = reflection.comment.blockTags;
            for (let cntr = blockTags.length; --cntr >= 0;)
            {
               if (jsdocClassTagsRemove.has(blockTags[cntr]?.tag)) { blockTags.splice(cntr, 1); }
            }
         }
      }
   });

   // Handle any module name substitution during project conversion.
   if (Object.keys(options.moduleRemap.names).length)
   {
      app.converter.on(Converter.EVENT_RESOLVE, (context, reflection) =>
      {
         // Remap module to package names.
         if (reflection?.kind === ReflectionKind.Module && reflection.name in options.moduleRemap.names)
         {
            reflection.name = options.moduleRemap.names[reflection.name];
         }
      });
   }
}
