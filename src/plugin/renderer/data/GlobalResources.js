import fs                     from 'node:fs';
import path                   from 'node:path';
import { fileURLToPath }      from 'node:url';

import { packAndDeflateB64 }  from '#runtime/data/format/msgpack/compress';
import { isObject }           from '#runtime/util/object';

import { ReflectionKind }     from 'typedoc';

import { NavigationIndex }    from './navigation/NavigationIndex.js';

import { copyDirectory }      from '#plugin/utils';

/**
 * Copies all DMT global resources to output directory and builds Svelte component data.
 *
 * Exports all global component data to a MessagePack file to `/assets/dmt/componentData.js`.
 *
 * - navigationLinks
 * - navigationIndex - index of the left-hand navigation data and URLs.
 * - sidebarLinks
 *
 * The resulting MessagePack file is loaded by the Svelte component bundle.
 */
export class GlobalResources
{
   /**
    * Builds component data and copies global DMT resources to output directory.
    *
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   static build(event, app, options)
   {
      this.#buildComponentData(event, app, options);
      this.#copyResources(event, app, options);
      this.#cleanupUnusedTypedoc(event);
   }

   /**
    * @param {import('typedoc').RenderEvent} event -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   static #buildComponentData(event, app, options)
   {
      app.logger.verbose(`[typedoc-theme-default-modern] Generating global component data.`);

      // Determine if there is any module / modules index ------------------------------------------------------------

      let modulesIndex;

      if (fs.existsSync(path.join(event.outputDirectory, 'modules.html')))
      {
         modulesIndex = 'modules.html';
      }
      else if (fs.existsSync(path.join(event.outputDirectory, 'modules', 'index.html')))
      {
         modulesIndex = 'modules/index.html';
      }

      // Combine 'sidebarLinks' and 'navigationLinks' ----------------------------------------------------------------

      /** @type {Record<string, string>} */
      const sidebarLinks = Object.assign({}, app.options.getValue('sidebarLinks'),
       app.options.getValue('navigationLinks'));

      const storagePrepend = `docs-${event?.project?.packageName ?? Math.random().toString(36).substring(2, 18)}`;

      /** @type {DMTComponentDataBCMP} */
      const data = {
         iconLinks: {
            service: this.#processIconLinksService(event, options),
            user: this.#processIconLinksUser(event, options)
         },
         modulesIndex,
         moduleIsPackage: options.moduleRemap.isPackage,
         navigationIndex: NavigationIndex.data,
         ReflectionKind: this.#getReflectionKind(options),
         searchOptions: options.search,
         showModuleIcon: options.navigation.moduleIcon,
         sidebarLinks,
         storagePrepend
      };

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'dmt-component-data.js'),
       `globalThis.dmtComponentDataBCMP = '${packAndDeflateB64(data)}';`);
   }

   /**
    * Cleans up unused TypeDoc resources. Since TypeDoc `0.26` `removeComponent` is no longer available, so it is
    * impossible to disable some default theme components. This includes 'javascript-index' and 'navigation-tree'.
    *
    * @param {RendererEvent} event -
    */
   static #cleanupUnusedTypedoc(event)
   {
      const navigationPath = path.join(event.outputDirectory, 'assets', 'navigation.js');
      const searchPath = path.join(event.outputDirectory, 'assets', 'search.js');

      if (fs.existsSync(navigationPath)) { fs.unlinkSync(navigationPath); }
      if (fs.existsSync(searchPath)) { fs.unlinkSync(searchPath); }
   }

   /**
    * Copies any resources to docs output assets directory. Also handles modifying `main.js` to remove
    * `initNav` / `initSearch` functions.
    *
    * @param {RendererEvent} event -
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   static #copyResources(event, app, options)
   {
      const outAssets = path.join(event.outputDirectory, 'assets', 'dmt');
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      if (options?.favicon?.filepath && options?.favicon?.filename)
      {
         app.logger.verbose(`[typedoc-theme-default-modern] Copying 'dmtFavicon' to output directory.`);

         fs.copyFileSync(options.favicon.filepath, path.join(event.outputDirectory, options.favicon.filename));
      }

      app.logger.verbose(`[typedoc-theme-default-modern] Copying assets to output assets directory.`);
      copyDirectory(path.join(localDir, 'assets'), outAssets);

      // Update main.js default theme removing `initSearch` / `initNav` functions ------------------------------------

      // TypeDoc 0.25.3+

      // This can be a potentially fragile replacement. The regex below removes any functions / content between
      // `Object.defineProperty()` and the closing of the IIFE `})();`. This works for mangled / minified code.

      // See: https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/bootstrap.ts#L25

      const mainJSPath = path.join(event.outputDirectory, 'assets', 'main.js');
      if (fs.existsSync(mainJSPath))
      {
         const mainData = fs.readFileSync(mainJSPath, 'utf-8');

         const regex = /(Object\.defineProperty\(window,"app",\{.*?}\);)\s*.*?(?=}\)\(\);)/gm;

         if (regex.test(mainData))
         {
            fs.writeFileSync(mainJSPath, mainData.replace(regex, '$1'), 'utf-8');
         }
         else
         {
            app.logger.error(
             `[typedoc-theme-default-modern] Failed to remove default theme search initialization in 'main.js' asset.`);
         }
      }
      else
      {
         app.logger.error(`[typedoc-theme-default-modern] Could not locate 'main.js' asset.`);
      }
   }

   /**
    * Build TypeDoc reflection kind object with just key / values that are a power of 2. This represents all the
    * SVG icon types defined.
    *
    * @param {ThemeOptions} options -
    *
    * @returns {{}} Reflection kinds for help display.
    */
   static #getReflectionKind(options)
   {
      // Reflection kinds that are of no interest are filtered out.
      const ignoreSet = new Set(['Project', 'EnumMember', 'CallSignature', 'IndexSignature',
       'ConstructorSignature', 'TypeLiteral', 'TypeParameter', 'GetSignature', 'SetSignature']);

      // Exclude `Module` when icons are removed for modules.
      if (!options.navigation.moduleIcon) { ignoreSet.add('Module'); }

      const result = {};

      const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;

      for (let [key, value] of Object.entries(ReflectionKind)) // eslint-disable-line prefer-const
      {
         // If modules are packages then change the key name for `Module`.
         if (options.moduleRemap.isPackage && key === 'Module') { key = 'Package'; }

         if (isNaN(Number(key)) && isPowerOfTwo(value) && !ignoreSet.has(key))
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
    * @returns {DMTIconLink[]} List of DMTIconLinks.
    */
   static #processIconLinksUser(event, options)
   {
      const result = [];
      const links = options.linksIcon;

      if (!links.length) { return result; }

      const outputDir = path.join(event.outputDirectory, 'assets', 'dmt', 'icons', 'external');
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
    * @returns {DMTIconLink[]} List of service DMTIconLinks.
    */
   static #processIconLinksService(event, options)
   {
      const result = [];
      const links = options.linksService;

      if (!links.length) { return result; }

      const outputDir = path.join(event.outputDirectory, 'assets', 'dmt', 'icons', 'service');
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
