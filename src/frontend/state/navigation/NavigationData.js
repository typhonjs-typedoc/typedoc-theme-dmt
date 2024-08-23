import {
   get,
   writable }                 from 'svelte/store';

import { TreeStateControl }   from './TreeStateControl.js';

/**
 * Provides state and control for all navigation components.
 */
export class NavigationData
{
   /**
    * The relative path prepend for all entry path links.
    *
    * @type {string}
    */
   #basePath;

   /**
    * The documentation base URL.
    *
    * @type {string}
    */
   #baseURL;

   /**
    * Path to module / modules index.
    *
    * @type {string | undefined}
    */
   #modulesIndex;

   /**
    * When true SVG icons for all navigation module entries are displayed.
    *
    * @type {boolean}
    */
   #navModuleIcon;

   /**
    * The navigation bar help panel opened state.
    *
    * @type {Writable<boolean>}
    */
   #storeHelpPanelOpen = writable(false);

   /**
    * Tree state control.
    *
    * @type {TreeStateControl}
    */
   #treeStateControl;

   /**
    * @param {DMTComponentData}  dmtComponentData - Global component data.
    */
   constructor(dmtComponentData)
   {
      this.#basePath = dmtComponentData.basePath;
      this.#baseURL = dmtComponentData.baseURL;
      this.#modulesIndex = dmtComponentData.modulesIndex;
      this.#navModuleIcon = dmtComponentData.navModuleIcon;

      this.#treeStateControl = new TreeStateControl(this, dmtComponentData);
   }

   /**
    * @returns {string} The relative path prepend for all entry path links.
    */
   get basePath()
   {
      return this.#basePath;
   }

   /**
    * @returns {string} The documentation base URL.
    */
   get baseURL()
   {
      return this.#baseURL;
   }

   /**
    * @returns {string | undefined} Path to module / modules index.
    */
   get modulesIndex()
   {
      return this.#modulesIndex;
   }

   /**
    * @returns {boolean} When true SVG icons for all navigation module entries are displayed.
    */
   get navModuleIcon()
   {
      return this.#navModuleIcon;
   }

   /**
    * @returns {import('svelte/store').Writable<boolean>} The navigation bar help panel opened state store.
    */
   get storeHelpPanelOpen()
   {
      return this.#storeHelpPanelOpen;
   }

   /**
    * @returns {TreeStateControl} The tree state control.
    */
   get treeState()
   {
      return this.#treeStateControl;
   }

   /**
    * Swaps the help panel open state.
    */
   swapHelpPanelOpen()
   {
      this.#storeHelpPanelOpen.set(!get(this.#storeHelpPanelOpen));
   }
}
