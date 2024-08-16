import {
   derived,
   get,
   writable }                 from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

/**
 * Provides the ability to walk the navigation index and manage state for initial opened state for entries and ensuring
 * opened state when URL hash changes occur.
 */
export class TreeState
{
   /** @type {import('typedoc').NavigationElement[]} */
   #elementIndex;

   /** @type {import('./NavigationData.js').NavigationData} */
   #navData;

   /**
    * The navigation session storage store manager.
    *
    * @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage}
    */
   #sessionStorage;

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
    * Indicates the count of top level nodes if there are entries with children / tree nodes present.
    *
    * @type {Writable<number>}
    */
   #storeTopLevelNodeCount = writable(0);

   /**
    * @param {import('./NavigationData.js').NavigationData} navData - Navigation data instance.
    *
    * @param {import('typedoc').NavigationElement[]} elementIndex - Navigation element data.
    *
    * @param {string} storagePrepend - The session storage key prepend.
    */
   constructor(navData, elementIndex, storagePrepend)
   {
      this.#navData = navData;
      this.#elementIndex = elementIndex;
      this.#storagePrepend = storagePrepend;

      this.#sessionStorage = new TJSSessionStorage();

      this.#setInitialState();

      this.#createDerivedStores();

      globalThis.addEventListener('hashchange', this.#onHashchange.bind(this));
   }

   /**
    * @returns {import('#types/frontend').DMTNavigationElement[]} The tree element index.
    */
   get elementIndex() { return this.#elementIndex; }

   /**
    * @returns {boolean} If there is navigation element data available.
    */
   get hasData() { return this.#elementIndex?.length > 0; }

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
    * @returns {Writable<number>} Indicates the count of top level nodes if there are entries with children / tree
    * nodes present.
    */
   get storeTopLevelNodeCount() { return this.#storeTopLevelNodeCount; }

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

      if (result && setCurrent) { this.#navData.setCurrentPathURL(pathURL); }

      return result;
   }

   /**
    * Sets all session storage stores from the given entry. This supports `Alt-<Click>` action to open / close all
    * child folders.
    *
    * @param {import('#types/frontend').DMTNavigationElement} fromEntry - The entry to start traversing tree.
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
    * Create custom click handlers for all main content anchors that have a hash fragment. `hashAnchorClick` will
    * ensure that the Navigation entry is visible when clicked even if the main URL hash fragment doesn't change.
    */
   #hashAnchorLinks()
   {
      const baseURL = this.#navData.baseURL;
      const navigationState = this;

      /**
       * Handle any clicks on content anchors with a hash ensuring that the clicked upon anchor is always visible in the
       * navigation tree.
       *
       * @param {PointerEvent}   event -
       */
      function hashAnchorClick(event)
      {
         event.preventDefault(); // Prevent the default anchor click behavior.

         const fullURLNoHash = globalThis.location.href.split('#')[0];
         const anchorURLNoHash = this.href.split('#')[0];

         // If the main URLs or hash differ then set the window location. The `onHashchange` function will trigger.
         if (fullURLNoHash !== anchorURLNoHash || globalThis.location.hash !== this.hash)
         {
            globalThis.location.href = this.href;
            return;
         }

         // Otherwise a link is clicked and the URL / hash reference is the same as the current page. Ensure that
         // the navigation tree shows the current entry.

         const pathURL = this.href.replace(baseURL, '');

         if (!navigationState.ensureCurrentPath(pathURL) && pathURL.includes('#'))
         {
            // Handle the case where the hash fragment is not in the navigation index. Attempt to ensure current path
            // without the hash fragment.
            const match = pathURL.split('#');

            // No hash URL
            if (match[0])
            {
               navigationState.ensureCurrentPath(match[0]);
            }

            // Manually scroll to hash fragment.
            navigationState.#scrollContentToHash(match[1]);
         }
      }

      // Find all anchor links in the main content body and page navigation.
      const hashAnchors = document.querySelectorAll(
       'div.col-content a[href*="#"], details.tsd-page-navigation a[href*="#"]');

      // Add custom hash anchor click handling.
      for (const anchorEl of hashAnchors) { anchorEl.addEventListener('click', hashAnchorClick); }
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
      let topLevelNodes = 0;

      const operation = (entry, parentEntry) =>
      {
         if (!parentEntry) { topLevelNodes++; }

         // Set storage key to DMTNavigationEntry.
         const parentPath = parentEntry ? parentEntry.path ?? parentEntry.text : '';
         entry.storageKey = `${this.#storagePrepend}-${entry.path ?? `${parentPath}-${entry.text}`}`;

         // Pre-create the session storage stores.
         this.#sessionStorage.getStore(entry.storageKey, false);
      };

      this.#walkTree(operation);

      this.#storeTopLevelNodeCount.set(topLevelNodes);
   }

   /**
    * Updates the session storage state opening all tree nodes to the new URL path. This is added as a listener for
    * `hashchange` on `window`.
    *
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   #onHashchange(event)
   {
      const newPathURL = event.newURL.replace(this.#navData.baseURL, '');

      // Ensure any tree nodes are open for `newURLPath`.
      if (!this.ensureCurrentPath(newPathURL) && newPathURL.includes('#'))
      {
         // Handle the case where the hash fragment is not in the navigation index. Attempt to ensure current path
         // without the hash fragment.
         const noHashURL = newPathURL.split('#')[0];
         if (noHashURL) { this.ensureCurrentPath(noHashURL); }
      }
   }

   /**
    * Scrolls the current page to the given hash fragment.
    * TODO: This is a workaround attempt for a Chromium / Chrome bug where hash fragments are not properly scrolled to.
    * Hash fragment scrolling into view works fine w/ Firefox.
    *
    * I have deemed it currently not worth having a workaround in place, but left the workaround attempt for a later
    * review.
    *
    * See:
    * https://bugs.chromium.org/p/chromium/issues/detail?id=1417660
    * https://bugs.chromium.org/p/chromium/issues/detail?id=833617
    *
    * @param {string}   hashFragment - Target hash fragment.
    */
   #scrollContentToHash(hashFragment) // eslint-disable-line no-unused-vars
   {
      // if (typeof hashFragment !== 'string') { return; }
      //
      // nextAnimationFrame().then(() =>
      // {
      //    const targetEl = document.querySelector(`div.col-content a[href*="#${hashFragment}"]`);
      //    const contentEl = document.querySelector('div.container.container-main');
      //
      //    if (targetEl && contentEl)
      //    {
      //       contentEl.focus();
      //       contentEl.scrollTo({
      //          top: targetEl.getBoundingClientRect().top - 60,
      //          behavior: 'instant'
      //       });
      //    }
      // });
   }

   /**
    * Helper function to recursively search for the path and perform the operation given for each tree node.
    *
    * @param {import('#types/frontend').DMTNavigationElement} entry - Current NavigationElement.
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
    */
   #setInitialState()
   {
      this.#initializeTree();

      const pathURL = this.#navData.initialPathURL;

      // Attempt to set initial current path; there may be a hash fragment.
      const initialResult = this.#initializeCurrentPath(pathURL);

      // Handle the case of a hash fragment.
      if (pathURL.includes('#'))
      {
         const match = pathURL.split('#');

         // Try setting initial result again with the path URL without the hash fragment.
         if (!initialResult)
         {
            const noHashURL = match[0];
            if (noHashURL && this.#initializeCurrentPath(noHashURL)) { this.#navData.setCurrentPathURL(noHashURL); }
         }

         // Chrome for whatever reason doesn't automatically scroll to the hash fragment, so manually do it.
         // Note: Firefox does without manual scrolling.
         this.#scrollContentToHash(match[1]);
      }

      // Modify all content links with hash fragments.
      this.#hashAnchorLinks();
   }

   /**
    * Walks the navigation index / tree for each path recursively.
    *
    * @param {import('#types/frontend').DMTNavigationElement} entry - The current entry.
    *
    * @param {import('#types/frontend').DMTNavigationElement} parentEntry - The parent entry.
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
    * @param {import('#types/frontend').DMTNavigationElement} entry - The current entry.
    */
   #walkTreeFrom(operation, entry)
   {
      this.#walkPath(entry, void 0, operation);
   }
}

/**
 * @typedef {((
 *    entry: import('#types/frontend').DMTNavigationElement,
 *    parentEntry?: import('#types/frontend').DMTNavigationElement) => void
 * )} TreeOperation A function to invoke for tree nodes when walking the tree.
 */
