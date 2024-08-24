import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

import { DMTLocalStorage }    from './DMTLocalStorage.js';

import { NavigationData }     from './navigation';

import { localConstants }     from '#constants';

// Loads compressed global component data.
import '../dmt-component-data.js';

export class DMTComponentData
{
   /**
    * @type {DMTComponentDataBCMP}
    */
   #dmtComponentDataBCMP;

   /**
    * Data that is derived at runtime.
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
    * @type {NavigationData}
    */
   #navigationData;

   /**
    * @type {DMTSettingStores}
    */
   #settingStores;

   /**
    * @type {{ session: TJSSessionStorage, local: DMTLocalStorage }}
    */
   #storage = {
      local: new DMTLocalStorage(),
      session: new TJSSessionStorage()
   };

   /**
    * @param {string}   importMetaURL - Base `import.meta.url`.
    */
   constructor(importMetaURL)
   {
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

      this.#localData = {
         basePath,
         baseURL,
         dmtURL,
         initialPathURL
      };

      this.#navigationData = new NavigationData(this, this.#dmtComponentDataBCMP.navigationIndex);

      this.#settingStores = Object.freeze({
         themeAnimate: this.#storage.local.getStore(localConstants.dmtThemeAnimate)
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

   // ---------------

   /**
    * @returns {DMTLocalStorage} Local storage store manager.
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

   // -------------------------

   /**
    * @returns {{service: DMTIconLink[], user: DMTIconLink[]}} icon links for `IconLinks` component.
    */
   get iconLinks()
   {
      return this.#dmtComponentDataBCMP.iconLinks;
   }

   /**
    * @returns {string | undefined} The relative path to any module / modules index.
    */
   get modulesIndex()
   {
      return this.#dmtComponentDataBCMP.modulesIndex;
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
 * @typedef {object} DMTSettingStores Additional theme settings stored in local storage.
 *
 * @property {import('svelte/store').Writable<boolean>} themeAnimate Enables / disables theme animation.
 */
