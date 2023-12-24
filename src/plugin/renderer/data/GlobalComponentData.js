import fs                     from 'node:fs';
import path                   from 'node:path';

import { packAndDeflateB64 }  from '#runtime/data/format/msgpack/compress';
import { isObject }           from '#runtime/util/object';

import { ReflectionKind }     from 'typedoc';

import { NavigationIndex }    from './navigation/NavigationIndex.js';

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

      const defaultNavIndex = app.renderer.theme?.getNavigation?.(event.project) ?? [];

      const data = {
         hasModulesIndex: event?.project?.url === 'modules.html',
         linksIcon: this.#processLinksIcon(event, options),
         linksService: this.#processLinksService(event, options),
         moduleAsPackage: options.moduleAsPackage,
         navModuleIcon: options.navModuleIcon,
         navigationIndex: NavigationIndex.transform(defaultNavIndex, options, event?.project?.packageName),
         navigationLinks: app.options.getValue('navigationLinks'),
         ReflectionKind: this.#getReflectionKind(),
         search: options.search,
         searchFullName: options.searchFullName,
         searchLimit: options.searchLimit,
         searchQuick: options.searchQuick,
         searchQuickLimit: options.searchQuickLimit,
         sidebarLinks: app.options.getValue('sidebarLinks'),
         storagePrepend: `docs-${event?.project?.packageName ?? Math.random().toString(36).substring(2, 18)}`
      }

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'dmt-component-data.js'),
       `globalThis.dmtComponentDataBCMP = '${packAndDeflateB64(data)}';`);
   }

   /**
    * Build TypeDoc reflection kind object with just key / values that are a power of 2. This represents all the
    * SVG icon types defined.
    *
    * @returns {{}}
    */
   static #getReflectionKind()
   {
      const result = {};

      function isPowerOfTwo(n) { return n > 0 && (n & (n - 1)) === 0; }

      for (const [key, value] of Object.entries(ReflectionKind))
      {
         if (isNaN(Number(key)) && isPowerOfTwo(value))
         {
            result[key] = value;
            result[value] = key;
         }
      }

      return result;
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
      const links = options.linksIcon;

      if (!links.length) { return result; }

      const outputDir = path.join(event.outputDirectory, 'assets', 'dmt', 'icons', 'external')
      fs.mkdirSync(outputDir, { recursive: true });

      for (const entry of links)
      {
         if (!isObject(entry.asset)) { continue; }

         if (entry.asset.filepath && entry.asset.filename)
         {
            fs.copyFileSync(entry.asset.filepath, path.join(outputDir, entry.asset.filename));

            result.push({
               dmtPath: `icons/external/${entry.asset.filename}`,
               title: entry.title,
               url: entry.url
            });
         }
         else if (entry.asset.url)
         {
            result.push({
               iconURL: entry.asset.url,
               title: entry.title,
               url: entry.url
            });
         }
      }

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
         fs.copyFileSync(entry.asset.filepath, path.join(outputDir, entry.asset.filename));

         result.push({
            dmtPath: `icons/service/${entry.asset.filename}`,
            title: entry.title,
            url: entry.url
         });
      }

      return result;
   }
}
