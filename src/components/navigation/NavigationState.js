import { tick } from 'svelte';

/**
 * Provides the ability to walk the navigation index and manage state for initial opened state for entries and ensuring
 * opened state when URL hash changes occur.
 */
export class NavigationState
{
   /** @type {import('./NavigationData').NavigationData} */
   #navData;

   #onHashchangeBound;

   /**
    * @param {import('./NavigationData').NavigationData} navData - Navigation data.
    */
   constructor(navData)
   {
      this.#navData = navData;
      this.#onHashchangeBound = this.#onHashchange.bind(this);

      this.#setInitialState();
   }

   /**
    * @returns {Function} Window hashchange listener.
    */
   get onHashchange() { return this.#onHashchangeBound; }

   /**
    * Finds the child nodes that match the given path URL by a depth first search and recursively finds any associated
    * `storageKey` associated with parent tree nodes and sets the session state to open.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @returns {boolean} If entry for path URL is found and operation applied.
    */
   ensureCurrentPath(pathURL)
   {
      // Sets `opened` for all entry tree nodes from the path URL given.
      const operation = (entry) =>
      {
         if (entry.storageKey) { this.#navData.dmtSessionStorage.setItem(entry.storageKey, true); }
      }

      return this.#searchTree(pathURL, operation);
   }

   // Internal implementation ----------------------------------------------------------------------------------------

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
            const noHashURL = pathURL.split('#')[0];
            if (noHashURL) { navigationState.ensureCurrentPath(noHashURL); }
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
         if (entry.storageKey) { this.#navData.dmtSessionStorage.setItem(entry.storageKey, true) }
      }

      return this.#searchTree(pathURL, operation);
   }

   /**
    * Walks the navigation index tree generating session storage / `storageKey` in all tree nodes.
    */
   #initializeTree()
   {
      if (typeof globalThis?.dmtOptions?.storagePrepend !== 'string')
      {
         console.warn(`[typedoc-theme-default-modern] Could not find 'storagePrepend' DMT option.`);
      }

      // Retrieve the storage prepend string from global DMT options or use a default key.
      const storagePrepend = globalThis?.dmtOptions?.storagePrepend ?? 'docs-unnamed';

      const dmtSessionStorage = this.#navData.dmtSessionStorage;

      const operation = (entry, parentEntry) =>
      {
         this.#navData.hasTreeStore.set(true);

         // Set storage key to DMTNavigationEntry.
         const parentPath = parentEntry ? parentEntry.path ?? parentEntry.text : '';
         entry.storageKey = `${storagePrepend}-nav-${entry.path ?? `${parentPath}-${entry.text}`}`;

         // Pre-create the session storage stores as TJSSvgFolder doesn't render hidden child content. This allows
         // the `NavigationBar` component access to all stores immediately.
         dmtSessionStorage.getStore(entry.storageKey, false);
      }

      this.#walkTree(operation);
   }

   /**
    * Updates the session storage state opening all tree nodes to the new URL path. This is added as a listener for
    * `hashchange` on `window`.
    *
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   async #onHashchange(event)
   {
      const newURLPath = event.newURL.replace(this.#navData.baseURL, '');

      // Ensure any tree nodes are open for `newURLPath`.
      if (this.ensureCurrentPath(newURLPath)) { this.#navData.setCurrentPathURL(newURLPath); }
   }

   /**
    * Helper function to recursively search for the path and perform the operation given for each tree node.
    *
    * @param {import('./types').DMTNavigationElement} entry - Current NavigationElement.
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
      if (!this.#navData.index?.length) { return false; }

      // Scan all top level entries first.
      for (const entry of this.#navData.index)
      {
         if (Array.isArray(entry.children)) { continue; }

         // If the path is found at the top level do nothing and return early.
         if (entry?.path === pathURL) { return true; }
      }

      // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
      for (const entry of this.#navData.index)
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
         const hashFragment = match[1];
         const targetElement = document.querySelector(`div.col-content a[href*="#${hashFragment}"]`);
         const contentEl = document.querySelector('div.container.container-main');

         if (targetElement && contentEl)
         {
            contentEl.focus();
            contentEl.scrollTo({
               top: targetElement.getBoundingClientRect().top - 60,
               behavior: 'instant'
            });
         }
      }

      // Modify all content links with hash fragments.
      this.#hashAnchorLinks();
   }

   /**
    * Walks the navigation index / tree for each path recursively.
    *
    * @param {import('./types').DMTNavigationElement} entry - The current entry.
    *
    * @param {import('./types').DMTNavigationElement} parentEntry - The parent entry.
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
      for (const entry of this.#navData.index)
      {
         if (!Array.isArray(entry.children)) { continue; }

         this.#walkPath(entry, void 0, operation);
      }
   }
}

/**
 * @typedef {((
 *    entry: import('./types').DMTNavigationElement,
 *    parentEntry?: import('./types').DMTNavigationElement) => void
 * )} TreeOperation A function to invoke for tree nodes when walking the tree.
 */
