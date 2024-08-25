import {
   derived,
   get }                      from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

/**
 * Provides the ability to walk the navigation index and manage state for initial opened state for entries and ensuring
 * opened state when URL hash changes occur.
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
      // Sets `opened` for all entry tree nodes from the path URL given.
      const operation = (entry) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, true); }
      };

      const result = this.#searchTree(pathURL, operation);

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
      const operation = (entry) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, state); }
      };

      this.#walkTreeFrom(operation, fromEntry);
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
      // Sets entry session storage to true / opened for all entry tree nodes from the path URL given.
      const operation = (entry) =>
      {
         if (entry.storageKey) { this.#sessionStorage.setItem(entry.storageKey, true); }
      };

      return this.#searchTree(pathURL, operation);
   }

   /**
    * Walks the navigation index tree generating session storage / `storageKey` in all tree nodes.
    */
   #initializeTree()
   {
      let topLevelFolders = 0;

      const operation = (entry, parentEntry) =>
      {
         if (!parentEntry) { topLevelFolders++; }

         // Set storage key to DMTNavigationEntry.
         const parentPath = parentEntry ? parentEntry.path ?? parentEntry.text : '';
         entry.storageKey = `${this.#storagePrepend}-${entry.path ?? `${parentPath}-${entry.text}`}`;

         // Pre-create the session storage stores.
         this.#sessionStorage.getStore(entry.storageKey, false);
      };

      this.#walkTree(operation);

      this.#hasFolders = topLevelFolders > 0;
   }

   /**
    * Helper function to recursively search for the path and perform the operation given for each tree node.
    *
    * @param {import('#frontend/types').DMTNavigationElement} entry - Current NavigationElement.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {TreeOperation} operation - Tree entry operation to apply.
    *
    * @returns {boolean} Whether the path URL matched an entry in this branch.
    */
   #searchPath(entry, pathURL, operation)
   {
      // If the path matches, return true to indicate the path has been found.
      if (entry.path === pathURL) { return true; }

      // If the entry has children, continue the search recursively.
      if (Array.isArray(entry.children))
      {
         for (const child of entry.children)
         {
            const found = this.#searchPath(child, pathURL, operation);
            if (found)
            {
               operation(entry);
               return true;
            }
         }
      }

      // If the path has not been found in this branch, return false.
      return false;
   }

   /**
    * Searches the navigation index for the given path URL and performs the given operation on each tree node from the
    * path if found.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {TreeOperation} operation - Tree entry operation to apply.
    *
    * @returns {boolean} If the path is found and operation is applied.
    */
   #searchTree(pathURL, operation)
   {
      if (!this.#elementIndex?.length) { return false; }

      // Scan all top level entries first.
      for (const entry of this.#elementIndex)
      {
         if (Array.isArray(entry.children)) { continue; }

         // If the path is found at the top level do nothing and return early.
         if (entry?.path === pathURL) { return true; }
      }

      // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
      for (const entry of this.#elementIndex)
      {
         if (!Array.isArray(entry.children)) { continue; }

         if (this.#searchPath(entry, pathURL, operation)) { return true; }
      }

      return false;
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

   /**
    * Walks the navigation index / tree for each path recursively.
    *
    * @param {import('#frontend/types').DMTNavigationElement} entry - The current entry.
    *
    * @param {import('#frontend/types').DMTNavigationElement} parentEntry - The parent entry.
    *
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    */
   #walkPath(entry, parentEntry, operation)
   {
      // If the entry has children, continue the search recursively.
      if (Array.isArray(entry.children))
      {
         for (const child of entry.children)
         {
            if (!Array.isArray(child.children)) { continue; }

            this.#walkPath(child, entry, operation);
         }
      }

      operation(entry, parentEntry);
   }

   /**
    * Recursively walks the navigation index / tree for just tree nodes invoking the given operation.
    *
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    */
   #walkTree(operation)
   {
      // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
      for (const entry of this.#elementIndex)
      {
         if (!Array.isArray(entry.children)) { continue; }

         this.#walkPath(entry, void 0, operation);
      }
   }

   /**
    * Recursively walks the navigation index / tree for just tree nodes invoking the given operation from the given
    * `entry`.
    *
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    *
    * @param {import('#frontend/types').DMTNavigationElement} entry - The current entry.
    */
   #walkTreeFrom(operation, entry)
   {
      this.#walkPath(entry, void 0, operation);
   }
}

/**
 * @typedef {((
 *    entry: import('#frontend/types').DMTNavigationElement,
 *    parentEntry?: import('#frontend/types').DMTNavigationElement) => void
 * )} TreeOperation A function to invoke for tree nodes when walking the tree.
 */
