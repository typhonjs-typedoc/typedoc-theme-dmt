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

         const pageURLNoHash = globalThis.location.href.split('#')[0];
         const anchorURLNoHash = this.href.split('#')[0];

console.log(`!! hashAnchorClick - 0 - pageURLNoHash: `, pageURLNoHash);
console.log(`!! hashAnchorClick - 1 - anchorURLNoHash: `, anchorURLNoHash);

         // If the no hash URLS or hash differ then set the window location.
         if (pageURLNoHash !== anchorURLNoHash || globalThis.location.hash !== this.hash)
         {
console.log(`!! hashAnchorClick - A - not the same href / hash`)
            globalThis.location.href = this.href;
         }
         else
         {
            // Otherwise ensure the current path is visible.
            const hashURL = this.href.replace(baseURL, '');

console.log(`!! hashAnchorClick - B - same page hashURL: `, hashURL);

            if (!navigationState.ensureCurrentPath(hashURL))
            {
               console.log(`!! hashAnchorClick - B - same page hashURL: `, hashURL);
            }
         }
      }

      // Find all anchor links in the main content body and page navigation.
      const hashAnchors = document.querySelectorAll(
       'div.col-content a[href*="#"], details.tsd-page-navigation a[href*="#"]');

      // Add custom hash anchor click handling.
      for (const anchorEl of hashAnchors) { anchorEl.addEventListener('click', hashAnchorClick); }
   }

   /**
    * Finds the child nodes that match the given path URL by a depth first search and sets a new `opened` attribute
    * used to override any stored values from session storage on initial render ensuring that the current entry is always
    * visible.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @returns {boolean} If entry for path URL is found and operation applied.
    */
   #initialCurrentPath(pathURL)
   {
      // Sets `opened` for all entry tree nodes from the path URL given.
      const operation = (entry) => entry.opened = true;

      return this.#searchTree(pathURL, operation);
   }

   /**
    * Updates the session storage state to opened for all tree nodes to the new URL path.
    *
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   async #onHashchange(event)
   {
      const newURLPath = event.newURL.replace(this.#navData.baseURL, '');

      // Ensure any tree nodes are open for `newURLPath`.
      if (this.ensureCurrentPath(newURLPath))
      {
         // Wait for Svelte to render tree.
         await tick();

         // Set new URL via store.
         this.#navData.setCurrentPathURL(newURLPath);
      }
   }

   /**
    * Helper function to recursively search for the path and perform the operation given for each tree node.
    *
    * @param {import('./types').DMTNavigationElement} entry - Current NavigationElement.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {(entry: import('./types').DMTNavigationElement) => void} operation - Function to operate on entry.
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
    * @param {(entry: import('./types').DMTNavigationElement) => void} operation - Function to operate on entry.
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
      const pathURL = this.#navData.initialPathURL;

      // Attempt to set initial current path; there may be a hash fragment.
      const initialResult = this.#initialCurrentPath(pathURL);

      // Handle the case of a hash fragment.
      if (pathURL.includes('#'))
      {
         const match = pathURL.split(/(?<=\.html)/);

         // Try setting initial result again with the base URL without the hash fragment.
         if (!initialResult)
         {
            const noHashURL = match[0];
            if (noHashURL && this.#initialCurrentPath(noHashURL)) { this.#navData.setCurrentPathURL(noHashURL); }
         }

         // Chrome for whatever reason doesn't automatically scroll to the hash fragment, so manually do it.
         const hashFragment = match[1];
         const targetElement = document.querySelector(`div.col-content a[href^="${hashFragment}"]`);
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

      this.#hashAnchorLinks();
   }
}
