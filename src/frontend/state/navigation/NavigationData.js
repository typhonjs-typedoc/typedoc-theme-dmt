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
    * The current tree state entry path URL.
    *
    * @type {string}
    */
   #currentPathURL;

   /**
    * Indicates that a root `modules.html` is generated.
    *
    * @type {boolean}
    */
   #hasModulesIndex;

   /**
    * When true SVG icons for all navigation module entries are displayed.
    *
    * @type {boolean}
    */
   #navModuleIcon;

   /**
    * The current tree state entry path URL store.
    *
    * @type {import('svelte/store').Readable<string>}
    */
   #storeCurrentPathURL;

   /**
    * @type {import('svelte/store').Updater<string>}
    */
   #storeCurrentPathURLUpdate;

   /**
    * The navigation bar help panel opened state.
    *
    * @type {Writable<boolean>}
    */
   #storeHelpPanelOpen = writable(false);

   /**
    * The initial path URL.
    *
    * @type {string}
    */
   #initialPathURL;

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
      this.#hasModulesIndex = dmtComponentData.hasModulesIndex;
      this.#initialPathURL = dmtComponentData.initialPathURL;
      this.#navModuleIcon = dmtComponentData.navModuleIcon;

      this.#currentPathURL = this.#initialPathURL;

      const { subscribe, update } = writable(this.#initialPathURL);

      this.#storeCurrentPathURL = Object.freeze({ subscribe });
      this.#storeCurrentPathURLUpdate = update;

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
    * @returns {string} The current tree state entry path URL.
    */
   get currentPathURL()
   {
      return this.#currentPathURL;
   }

   /**
    * @returns {boolean} Indicates that a root `modules.html` is generated.
    */
   get hasModulesIndex()
   {
      return this.#hasModulesIndex;
   }

   /**
    * @returns {string} The initial path URL.
    */
   get initialPathURL()
   {
      return this.#initialPathURL;
   }

   /**
    * @returns {boolean} When true SVG icons for all navigation module entries are displayed.
    */
   get navModuleIcon()
   {
      return this.#navModuleIcon;
   }

   /**
    * @returns {import('svelte/store').Readable<string>} The current tree state entry path URL store.
    */
   get storeCurrentPathURL()
   {
      return this.#storeCurrentPathURL;
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
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL)
   {
      this.#currentPathURL = pathURL;
      this.#storeCurrentPathURLUpdate(() => pathURL);
   }

   /**
    * Swaps the help panel open state.
    */
   swapHelpPanelOpen()
   {
      this.#storeHelpPanelOpen.set(!get(this.#storeHelpPanelOpen));
   }
}
