import fs                     from 'node:fs';
import path                   from 'node:path';

import { packAndDeflateB64 }  from '#runtime/data/format/msgpack/compress';

/**
 * Exports an index of the main navigation URLs and reflection data to a MessagePack file.
 *
 * The resulting MessagePack file can be loaded into `trie-search` for auto-complete quick search functionality.
 */
export class NavigationBuilder
{
   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      // At the end of rendering dynamically generate the compressed navigation index.
      app.renderer.postRenderAsyncJobs.push(async (event) =>
      {
         app.logger.verbose(`[typedoc-theme-default-modern] Generating navigation index.`);

         const nav = app.renderer.theme?.getNavigation?.(event.project) ?? [];

         fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'navigationIndex.js'),
          `globalThis.dmtNavigationIndex = '${packAndDeflateB64(nav)}';`);
      });
   }
}