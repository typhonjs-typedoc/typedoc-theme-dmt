import {
   derived,
   writable }                 from 'svelte/store';

import { TreeStateControl }   from './TreeStateControl.js';

/**
 * @implements {import('../types.js').INavigationData}
 */
export class NavigationData
{
   /**
    * The relative path prepend for all entry path links.
    *
    * @type {string}
    */
   basePath;

   /**
    * The documentation base URL.
    *
    * @type {string}
    */
   baseURL;

   /**
    * The current tree state entry path URL.
    *
    * @type {string}
    */
   #currentPathURL;

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
    * The initial path URL.
    *
    * @type {string}
    */
   initialPathURL;

   state;

   /**
    * @type {string}
    */
   storagePrepend;

   /**
    * A derived store with the open / close state of all session stores.
    *
    * @type {import('svelte/store').Readable<boolean>}
    */
   storeSessionAllOpen;

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
      this.basePath = dmtComponentData.basePath;
      this.baseURL = dmtComponentData.baseURL;
      this.initialPathURL = dmtComponentData.initialPathURL;

      // Retrieve the storage prepend string from global DMT options or use a default key.
      this.storagePrepend = dmtComponentData.storagePrepend ?? 'docs-unnamed';

      this.#currentPathURL = this.initialPathURL;

      const { subscribe, update } = writable(this.initialPathURL);

      this.#storeCurrentPathURL = Object.freeze({ subscribe });
      this.#storeCurrentPathURLUpdate = update;

      this.#treeStateControl = new TreeStateControl(this, dmtComponentData);

      this.#createDerivedStores();
   }

   /**
    * @returns {string} The current tree state entry path URL.
    */
   get currentPathURL()
   {
      return this.#currentPathURL;
   }

   /**
    * @returns {import('svelte/store').Readable<string>} The current tree state entry path URL store.
    */
   get storeCurrentPathURL()
   {
      return this.#storeCurrentPathURL;
   }

   /**
    * @returns {TreeStateControl} The tree state control.
    */
   get treeState()
   {
      return this.#treeStateControl;
   }

   /**
    * Creates derived stores after the navigation tree / index state has been initialized.
    */
   #createDerivedStores()
   {
      // Create a derived store from all session storage stores; on any update reduce all values and set state
      // to whether all folders are opened or not.
      this.storeSessionAllOpen = derived([...this.treeState.source.sessionStorage.stores()],
       (stores, set) => set(!!stores.reduce((previous, current) => previous & current, true)));
   }

   /**
    * Closes or opens all navigation folders / session store state.
    *
    * @param {boolean}  state - New open / close state.
    */
   setStoresAllOpen(state)
   {
      for (const store of this.treeState.source.sessionStorage.stores()) { store.set(state); }
   }

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL)
   {
      console.log(`!!! DMT - NavigationData.setCurrentPathURL - pathURL: `, pathURL);
      console.trace();

      this.#currentPathURL = pathURL;
      this.#storeCurrentPathURLUpdate(() => pathURL);
   }
}
