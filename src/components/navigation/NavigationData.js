import {
   derived,
   writable }                 from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

import { NavigationState }    from './NavigationState.js';

/**
 * @implements {import('./types').INavigationData}
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
    * The current entry path URL.
    *
    * @type {string}
    */
   currentPathURL;

   /**
    * The current path URL store.
    *
    * @type {import('svelte/store').Writable<string>}
    */
   storeCurrentPathURL;

   /**
    * The navigation session storage store manager.
    *
    * @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage}
    */
   dmtSessionStorage;

   /**
    * The navigation index.
    *
    * @type {import('./types').DMTNavigationElement[]}
    */
   index;

   /**
    * The initial path URL.
    *
    * @type {string}
    */
   initialPathURL;

   /**
    * Navigation state control.
    *
    * @type {import('./NavigationState').NavigationState}
    */
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
    * Indicates the count of top level nodes if there are entries with children / tree nodes present.
    *
    * @type {import('svelte/store').Writable<number>}
    */
   storeTopLevelNodes = writable(0);

   /**
    * @param {DMTComponentData}  dmtComponentData - Global component data.
    */
   constructor(dmtComponentData)
   {
      this.basePath = dmtComponentData.basePath;
      this.baseURL = dmtComponentData.baseURL;
      this.initialPathURL = dmtComponentData.initialPathURL;
      this.index = dmtComponentData.navigationIndex;

      // Retrieve the storage prepend string from global DMT options or use a default key.
      this.storagePrepend = dmtComponentData.storagePrepend ?? 'docs-unnamed';

      this.dmtSessionStorage = new TJSSessionStorage();

      this.currentPathURL = this.initialPathURL;
      this.storeCurrentPathURL = writable(this.initialPathURL);

      this.state = new NavigationState(this);

      this.#createDerivedStores();
   }

   /**
    * Creates derived stores after the navigation tree / index state has been initialized.
    */
   #createDerivedStores()
   {
      // Create a derived store from all session storage stores; on any update reduce all values and set state
      // to whether all folders are opened or not.
      this.storeSessionAllOpen = derived([...this.dmtSessionStorage.stores()],
       (stores, set) => set(!!stores.reduce((previous, current) => previous & current, true)));
   }

   /**
    * Closes or opens all navigation folders / session store state.
    *
    * @param {boolean}  state - New open / close state.
    */
   setStoresAllOpen(state)
   {
      for (const store of this.dmtSessionStorage.stores()) { store.set(state); }
   }

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL)
   {
      this.currentPathURL = pathURL;
      this.storeCurrentPathURL.set(pathURL);
   }
}
