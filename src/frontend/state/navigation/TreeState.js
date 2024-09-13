import {
   derived,
   get }                      from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

import { NavigationTree }     from '#shared/utils';

/**
 * Provides the ability to control and retrieve data for a navigation tree. Each tree has an independent session
 * storage manager for all folder open / close state.
 */
export class TreeState
{
   /** @type {import('typedoc').NavigationElement[]} */
   #elementIndex;

   /**
    * When true there are folders / node entries with children.
    *
    * @type {boolean}
    */
   #hasFolders = false;

   /**
    * The navigation session storage store manager.
    *
    * @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage}
    */
   #sessionStorage;

   /**
    * Update function for current tree entry path URL.
    *
    * @type {(url: string, treeName: string) => void} setCurrentPathURL
    */
   #setCurrentPathURL;

   /**
    * The prepend string for session storage keys.
    *
    * @type {string}
    */
   #storagePrepend;

   /**
    * A derived store with the open / close state of all session stores.
    *
    * @type {import('svelte/store').Readable<boolean>}
    */
   #storeFoldersAllOpen;

   /**
    * Stores the tree name.
    *
    * @type {string}
    */
   #treeName;

   /**
    * @param {object} options - Options;
    *
    * @param {string} options.currentPathURL - The initial current path URL.
    *
    * @param {(url: string, treeName: string) => void} options.setCurrentPathURL - Update function for current tree
    *        entry path URL.
    *
    * @param {import('typedoc').NavigationElement[]} options.elementIndex - Navigation element data.
    *
    * @param {string} options.storagePrepend - The session storage key prepend.
    *
    * @param {string} options.treeName - The tree name.
    */
   constructor({ currentPathURL, setCurrentPathURL, elementIndex, storagePrepend, treeName })
   {
      this.#setCurrentPathURL = setCurrentPathURL;
      this.#elementIndex = elementIndex;
      this.#storagePrepend = storagePrepend;
      this.#treeName = treeName;

      this.#sessionStorage = new TJSSessionStorage();

      this.#setInitialState(currentPathURL);

      this.#createDerivedStores();
   }

   /**
    * @returns {import('#frontend/types').DMTNavigationElement[]} The tree element index.
    */
   get elementIndex() { return this.#elementIndex; }

   /**
    * @returns {boolean} If there is navigation element data available.
    */
   get hasData() { return this.#elementIndex?.length > 0; }

   /**
    * @returns {boolean} When true there are folders / node entries with children.
    */
   get hasFolders() { return this.#hasFolders; }

   /**
    * @returns {import('#runtime/svelte/store/web-storage').TJSSessionStorage} The tree folder open / close session
    * storage instance.
    */
   get sessionStorage() { return this.#sessionStorage; }

   /**
    * @returns {import('svelte/store').Readable<boolean>} A derived store with the open / close state of all session
    * stores.
    */
   get storeFoldersAllOpen()
   {
      return this.#storeFoldersAllOpen;
   }

   /**
    * Finds the child nodes that match the given path URL by a depth first search and recursively finds any associated
    * `storageKey` associated with parent tree nodes and sets the session state to open.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {object}   [opts] - Optional parameters.
    *
    * @param {boolean}  [opts.setCurrent=true] - If the path is found in the index set it to the current path.
    *
    * @returns {boolean} If entry for path URL is found and operation applied.
    */
   ensureCurrentPath(pathURL, { setCurrent = true } = {})
   {
      /**
       * Sets `opened` for all entry tree nodes from the path URL given.
       *
       * @type {import('#shared/types').TreeOperation<import('#frontend/types').DMTNavigationElement>}
       */
      const operation = ({ entry }) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, true); }
      };

      const result = NavigationTree.searchPath(this.elementIndex, pathURL, operation);

      if (result && setCurrent) { this.#setCurrentPathURL(pathURL, this.#treeName); }

      return result;
   }

   /**
    * Sets all session storage stores from the given entry. This supports `Alt-<Click>` action to open / close all
    * child folders.
    *
    * @param {import('#frontend/types').DMTNavigationElement} fromEntry - The entry to start traversing tree.
    *
    * @param {boolean} state - New state.
    */
   setChildFolderState(fromEntry, state)
   {
      /**
       * @type {import('#shared/types').TreeOperation<import('#frontend/types').DMTNavigationElement>}
       */
      const operation = ({ entry }) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, state); }
      };

      NavigationTree.walkFrom(fromEntry, operation);
   }

   /**
    * Closes or opens all tree folders / session store state.
    *
    * @param {boolean}  state - New open / close state.
    */
   setFoldersAllOpen(state)
   {
      for (const store of this.sessionStorage.stores()) { store.set(state); }
   }

   /**
    * Swaps the current open / close state for all folders / session store state.
    */
   swapFoldersAllOpen()
   {
      this.setFoldersAllOpen(!get(this.storeFoldersAllOpen));
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Creates derived stores after the navigation tree / index state has been initialized.
    */
   #createDerivedStores()
   {
      // Create a derived store from all session storage stores; on any update reduce all values and set state
      // to whether all folders are opened or not.
      this.#storeFoldersAllOpen = derived([...this.sessionStorage.stores()],
       (stores, set) => set(!!stores.reduce((previous, current) => previous & current, true)));
   }

   /**
    * Finds the child nodes that match the given path URL by a depth first search and sets the entries session storage
    * key to true / opened for all entry tree nodes from the path URL given. This overrides any stored values from
    * session storage on initial render ensuring that the current entry is always visible.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @returns {boolean} If entry for path URL is found and operation applied.
    */
   #initializeCurrentPath(pathURL)
   {
      /**
       * Sets entry session storage to true / opened for all entry tree nodes from the path URL given.
       *
       * @type {import('#shared/types').TreeOperation<import('#frontend/types').DMTNavigationElement>}
       */
      const operation = ({ entry }) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, true); }
      };

      return NavigationTree.searchPath(this.elementIndex, pathURL, operation);
   }

   /**
    * Walks the navigation index tree generating session storage / `storageKey` in all tree nodes.
    */
   #initializeTree()
   {
      let topLevelFolders = 0;

      /**
       * @type {import('#shared/types').TreeOperation<import('#frontend/types').DMTNavigationElement>}
       */
      const operation = ({ entry, parentEntry }) =>
      {
         if (!parentEntry) { topLevelFolders++; }

         // Set storage key to DMTNavigationEntry.
         const parentPath = parentEntry ? parentEntry.path ?? parentEntry.text : '';
         entry.storageKey = `${this.#storagePrepend}-${entry.path ?? `${parentPath}-${entry.text}`}`;

         // Pre-create the session storage stores.
         this.#sessionStorage.getStore(entry.storageKey, false);
      };

      NavigationTree.walk(this.#elementIndex, operation);

      this.#hasFolders = topLevelFolders > 0;
   }

   /**
    * Handles setting the initial open state and scrolling the main content div to any hash fragment.
    *
    * @param {string} currentPathURL - The initial current path URL.
    */
   #setInitialState(currentPathURL)
   {
      this.#initializeTree();

      // Attempt to set initial current path; there may be a hash fragment.
      const initialResult = this.#initializeCurrentPath(currentPathURL);

      if (initialResult)
      {
         this.#setCurrentPathURL(currentPathURL, this.#treeName);
      }
      else if (currentPathURL.includes('#')) // Handle the case of a hash fragment.
      {
         const match = currentPathURL.split('#');

         // Try setting initial result again with the path URL without the hash fragment.
         if (!initialResult)
         {
            const noHashURL = match[0];
            if (noHashURL && this.#initializeCurrentPath(noHashURL))
            {
               this.#setCurrentPathURL(noHashURL, this.#treeName);
            }
         }
      }
   }
}
