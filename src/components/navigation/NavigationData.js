import {
   derived,
   writable }                 from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

import { TreeState }    from './TreeState.js';

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
    * Markdown document tree state control.
    *
    * @type {import('./TreeState.js').TreeState}
    */
   treeStateMarkdown;

   /**
    * Source tree state control.
    *
    * @type {import('./TreeState.js').TreeState}
    */
   treeStateSource;

   /**
    * @param {DMTComponentData}  dmtComponentData - Global component data.
    */
   constructor(dmtComponentData)
   {
      this.basePath = dmtComponentData.basePath;
      this.baseURL = dmtComponentData.baseURL;
      this.initialPathURL = dmtComponentData.initialPathURL;
      this.navigationIndex = dmtComponentData.navigationIndex;
      this.markdownIndex = dmtComponentData.markdownIndex;

      // Retrieve the storage prepend string from global DMT options or use a default key.
      this.storagePrepend = dmtComponentData.storagePrepend ?? 'docs-unnamed';

      this.currentPathURL = this.initialPathURL;
      this.storeCurrentPathURL = writable(this.initialPathURL);

      this.treeStateMarkdown = new TreeState(this, this.markdownIndex);
      this.treeStateSource = new TreeState(this, this.navigationIndex);

      this.#createDerivedStores();
   }

   /**
    * Creates derived stores after the navigation tree / index state has been initialized.
    */
   #createDerivedStores()
   {
      // Create a derived store from all session storage stores; on any update reduce all values and set state
      // to whether all folders are opened or not.
      this.storeSessionAllOpen = derived([...this.treeStateSource.sessionStorage.stores()],
       (stores, set) => set(!!stores.reduce((previous, current) => previous & current, true)));
   }

   /**
    * Closes or opens all navigation folders / session store state.
    *
    * @param {boolean}  state - New open / close state.
    */
   setStoresAllOpen(state)
   {
      for (const store of this.treeStateSource.sessionStorage.stores()) { store.set(state); }
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
