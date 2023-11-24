import fs                     from 'node:fs';
import path                   from 'node:path';

import { packAndDeflateB64 }  from '#runtime/data/format/msgpack/compress';

/**
 * Exports all global component data to a MessagePack file to `/assets/dmt/componentData.js`.
 *
 * - navigationLinks
 * - navigationIndex - index of the left-hand navigation data and URLs.
 * - sidebarLinks
 *
 * The resulting MessagePack file is loaded by the Svelte component bundle.
 */
export class GlobalComponentData
{
   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   static build(app, options)
   {
      // At the end of rendering dynamically generate the compressed navigation index.
      app.renderer.postRenderAsyncJobs.push(async (event) =>
      {
         app.logger.verbose(`[typedoc-theme-default-modern] Generating global component data.`);

         const data = {
            sidebarLinks: app.options.getValue('sidebarLinks'),
            navigationIndex: app.renderer.theme?.getNavigation?.(event.project) ?? [],
            navigationLinks: app.options.getValue('navigationLinks')
         }

         fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'componentData.js'),
          `globalThis.dmtComponentDataBCMP = '${packAndDeflateB64(data)}';`);

         // TODO: Remove after dev / testing.
         fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'componentData.json'),
          JSON.stringify(data, null, 2));
      });
   }
}