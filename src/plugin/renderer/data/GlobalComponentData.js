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
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   static async build(event, app, options)
   {
      return this.#buildComponentData(event, app, options);
   }

   /**
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    *
    * @returns {Promise<void>}
    */
   static async #buildComponentData(event, app, options)
   {
      app.logger.verbose(`[typedoc-theme-default-modern] Generating global component data.`);

      const data = {
         linksIcon: this.#processLinksIcon(event, options),
         linksService: this.#processLinksService(event, options),
         sidebarLinks: app.options.getValue('sidebarLinks'),
         navigationIndex: app.renderer.theme?.getNavigation?.(event.project) ?? [],
         navigationLinks: app.options.getValue('navigationLinks')
      }

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'dmt-component-data.js'),
       `globalThis.dmtComponentDataBCMP = '${packAndDeflateB64(data)}';`);
   }

   /**
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {ThemeOptions} options -
    *
    * @returns {DMTIconLink[]}
    */
   static #processLinksIcon(event, options)
   {
      const result = [];

      return result;
   }

   /**
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {ThemeOptions} options -
    *
    * @returns {DMTIconLink[]}
    */
   static #processLinksService(event, options)
   {
      const result = [];
      const links = options.linksService;

      if (!links.length) { return result; }

      const outputDir = path.join(event.outputDirectory, 'assets', 'dmt', 'icons', 'service')
      fs.mkdirSync(outputDir, { recursive: true });

      for (const entry of links)
      {
         console.log(`!! GlobalComponentData - #processLinksService - entry: `, entry);
      }

      return result;
   }
}
