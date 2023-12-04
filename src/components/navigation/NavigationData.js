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
    * The relative path prepend for all entry path links.
    *
    * @type {string}
    */
   pathPrepend;

   /**
    * Navigation state control.
    *
    * @type {import('./NavigationState').NavigationState}
    */
   state;

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

   constructor(navigationIndex)
   {
      this.index = navigationIndex;

      this.dmtSessionStorage = new TJSSessionStorage();

      // Determine the depth in the static HTML paths to adjust a prepended relative path for all navigation links.
      this.baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
      this.initialPathURL = globalThis.location.href.replace(this.baseURL, '');

      // Find the path URL match without any additional URL fragment.
      const depth = (this.initialPathURL.match(/\//) ?? []).length;

      this.currentPathURL = this.initialPathURL;
      this.storeCurrentPathURL = writable(this.initialPathURL);

      this.pathPrepend = '../'.repeat(depth);

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
