import {
   get,
   readable,
   writable }                          from 'svelte/store';

import {
   TJSLocalStorage,
   TJSSessionStorage }                 from '#runtime/svelte/store/web-storage';

import { A11yHelper }                  from '#runtime/util/a11y';

import { NavigationData }              from './navigation';
import { createStoreToolbarIconLinks } from './toolbar';

import { localConstants }              from '#frontend/constants';

// Loads compressed global component data into `globalThis.dmtComponentDataBCMP`.
import '../dmt-component-data.js';

/**
 * Loads and wraps the binary compressed message pack data bundle for all Svelte components.
 */
export class DMTComponentData
{
   /**
    * Calculated stores for various components.
    *
    * @type {DMTComponentStores}
    */
   #componentStores;

   /**
    * The unpacked raw data bundle.
    *
    * @type {DMTComponentDataBCMP}
    */
   #dmtComponentDataBCMP;

   /**
    * Data that is derived at runtime.
    * ```
    * - basepath: Relative path to the documentation root from current page.
    * - baseURL: Full base URL to documentation root.
    * ```
    *
    * @type {({
    *    basePath: string,
    *    baseURL: string,
    *    dmtURL: string,
    *    initialPathURL: string,
    * })}
    */
   #localData;

   /**
    * The navigation tree data / control.
    *
    * @type {NavigationData}
    */
   #navigationData;

   /**
    * Additional DMT theme setting stores.
    *
    * @type {DMTSettingStores}
    */
   #settingStores;

   /**
    * Shared state stores between components / key handling system.
    *
    * @type {DMTStateStores}
    */
   #stateStores;

   /**
    * Application wide local / session web storage store managers.
    *
    * @type {{ session: TJSSessionStorage, local: TJSLocalStorage }}
    */
   #storage = {
      local: new TJSLocalStorage(),
      session: new TJSSessionStorage()
   };

   /**
    * @param {string}   importMetaURL - Base `import.meta.url`.
    */
   constructor(importMetaURL)
   {
      // Unpack the global component data.
      this.#dmtComponentDataBCMP = /** @type {DMTComponentDataBCMP} */
       (typeof globalThis.dmtComponentDataBCMP === 'string' ?
        globalThis.dmtInflateAndUnpackB64(globalThis.dmtComponentDataBCMP) : {});

      // Setup additional runtime component data ---------------------------------------------------------------------

      const baseURL = importMetaURL.replace(/assets\/dmt\/dmt-components.js/, '');
      const dmtURL = importMetaURL.replace(/dmt-components.js/, '');
      const initialPathURL = globalThis.location.href.replace(baseURL, '');

      // Find the path URL match without any additional URL fragment.
      const depth = (initialPathURL.match(/\//) ?? []).length;
      const basePath = '../'.repeat(depth);

      // Initialize local runtime resources.
      this.#localData = {
         basePath,
         baseURL,
         dmtURL,
         initialPathURL
      };

      this.#navigationData = new NavigationData(this, this.#dmtComponentDataBCMP.navigationIndex);

      this.#componentStores  = Object.freeze({
         toolbarIconLinks: createStoreToolbarIconLinks(this, this.#dmtComponentDataBCMP)
      });

      const animationEnabled = typeof this.#dmtComponentDataBCMP?.settingOptions?.animation === 'boolean' ?
       this.#dmtComponentDataBCMP?.settingOptions?.animation : true;

      this.#settingStores = Object.freeze({
         // If animation setting is disabled create a Readable store that is always false.
         // Otherwise, ensure that the setting / animate local storage store is initialized with A11y motion preference.
         themeAnimate: !animationEnabled ? readable(false) :
          this.#storage.local.getStore(localConstants.dmtThemeAnimate, !A11yHelper.prefersReducedMotion)
      });

      this.#stateStores = Object.freeze({
         helpPanelVisible: writable(false),
         mainSearchVisible: writable(false),

         swapHelpPanelVisible: () => this.#stateStores.helpPanelVisible.set(!get(this.#stateStores.helpPanelVisible))
      });
   }

   // Local runtime data ---------------------------------------------------------------------------------------------

   /**
    * @returns {string} Relative path to the documentation root from current page.
    */
   get basePath()
   {
      return this.#localData.basePath;
   }

   /**
    * @returns {string} Full base URL to documentation root.
    */
   get baseURL()
   {
      return this.#localData.baseURL;
   }

   /**
    * @returns {DMTComponentStores} Various pre-calculated stores for components.
    */
   get componentStores()
   {
      return this.#componentStores;
   }

   /**
    * @returns {TJSLocalStorage} Local storage store manager.
    */
   get dmtLocalStorage()
   {
      return this.#storage.local;
   }

   /**
    * @returns {TJSSessionStorage} Session storage store manager.
    */
   get dmtSessionStorage()
   {
      return this.#storage.session;
   }

   /**
    * @returns {string} Full URL to `assets/dmt`.
    */
   get dmtURL()
   {
      return this.#localData.dmtURL;
   }

   /**
    * @returns {string} Initial path URL for current page.
    */
   get initialPathURL()
   {
      return this.#localData.initialPathURL;
   }

   /**
    * @returns {NavigationData} Navigation data and control.
    */
   get navigation()
   {
      return this.#navigationData;
   }

   /**
    * @returns {DMTSettingStores} Theme setting stores.
    */
   get settingStores()
   {
      return this.#settingStores;
   }

   /**
    * @returns {DMTStateStores} Shared state across components.
    */
   get stateStores()
   {
      return this.#stateStores;
   }

   // Data forwarded on from BCMP data -------------------------------------------------------------------------------

   /**
    * @returns {{service: DMTIconLink[], user: DMTIconLink[]}} icon links for `IconLinks` component.
    */
   get iconLinks()
   {
      return this.#dmtComponentDataBCMP.iconLinks;
   }

   /**
    * @returns {{hierarchy: string | undefined, modules: string | undefined}} Additional pages index.
    */
   get pageIndex()
   {
      return this.#dmtComponentDataBCMP.pageIndex ?? {};
   }

   /**
    * @returns {boolean} When true 'Module' in page titles is replaced with 'Package'.
    */
   get moduleIsPackage()
   {
      return this.#dmtComponentDataBCMP.moduleIsPackage ?? false;
   }

   /**
    * @returns {boolean} When true SVG icons for all navigation module entries are displayed.
    */
   get showModuleIcon()
   {
      return this.#dmtComponentDataBCMP.showModuleIcon ?? true;
   }

   /**
    * @returns {DMTSearchOptions} The `dmtSearch` option; when truthy the main search index is active.
    */
   get searchOptions()
   {
      return this.#dmtComponentDataBCMP.searchOptions;
   }

   /**
    * @returns {Record<string, string | number>} TypeDoc ReflectionKind
    */
   get ReflectionKind()
   {
      return this.#dmtComponentDataBCMP.ReflectionKind;
   }

   /**
    * @returns {Record<string, string>} Combined `sidebarLinks` and `navigationLinks` for `SidebarLinks` component.
    */
   get sidebarLinks()
   {
      return this.#dmtComponentDataBCMP?.sidebarLinks ?? {};
   }

   /**
    * @returns {string} Provides a key based on the package name or a random string to prepend to local / session
    *          storage keys.
    */
   get storagePrepend()
   {
      return this.#dmtComponentDataBCMP.storagePrepend ?? 'docs-unnamed';
   }
}

/**
 * @typedef {object} DMTComponentStores Various stores calculated for components.
 *
 * @property {import('svelte/store').Writable<import('#frontend/types').DMTToolbarIconLinks>} toolbarIconLinks Icon link
 * data for `IconLinks.svelte`.
 */

/**
 * @typedef {object} DMTSettingStores Additional theme settings stored in local storage.
 *
 * @property {(
 *    import('svelte/store').Readble<boolean> |
 *    import('svelte/store').Writable<boolean>
 * )} themeAnimate Enables / disables theme animation. When a readable store theme animation is completely disabled.
 */

/**
 * @typedef {object} DMTStateStores Shared state across components.
 *
 * @property {import('svelte/store').Writable<boolean>} helpPanelVisible Enables / disables help panel display.
 *
 * @property {import('svelte/store').Writable<boolean>} mainSearchVisible Enables / disables main search display.
 *
 * @property {Function} swapHelpPanelVisible Swaps the help panel visible state.
 */
