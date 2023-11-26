/**
 * Provides the ability to walk the navigation index and manage state for initial opened state for entries and ensuring
 * opened state when URL hash changes occur.
 */
export class NavigationState
{
   /** @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage} */
   #dmtSessionStorage;

   /** @type {import('./types').DMTNavigationElement[]} */
   #navigationIndex;

   /**
    * @param {import('#runtime/svelte/store/web-storage').TJSSessionStorage} dmtSessionStorage - DMT session storage.
    *
    * @param {import('./types').DMTNavigationElement[]} navigationIndex - Navigation index.
    */
   constructor(dmtSessionStorage, navigationIndex)
   {
      this.#dmtSessionStorage = dmtSessionStorage;
      this.#navigationIndex = navigationIndex;
   }

   /**
    * @returns {import('./types').DMTNavigationElement[]}
    */
   get index() { return this.#navigationIndex; }

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
         if (entry.storageKey) { this.#dmtSessionStorage.setItem(entry.storageKey, true); }
      }

      return this.#searchTree(pathURL, operation);
   }

   /**
    * Handles setting the initial open state and scrolling the main content div to any hash fragment.
    *
    * @param {object}   options - Navigation options.
    */
   setInitialState(options)
   {
      const pathURL = options.initialPathURL;

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
            if (noHashURL && this.#initialCurrentPath(noHashURL)) { options.pathURL.set(noHashURL); }
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

      // Create custom click handlers for all main content anchors that have a hash fragment. `hashAnchorClick` will
      // ensure that the Navigation entry is visible when clicked even if the main URL hash fragment doesn't change.
      const hashAnchorClick = createHashAnchorClick(this, options.baseURL);

      const hashAnchors = document.querySelectorAll(
       'div.col-content a[href^="#"], details.tsd-page-navigation a[href^="#"]');

      for (const anchorEl of hashAnchors)
      {
console.log(`!! adding click listener: `, anchorEl.href)
         anchorEl.addEventListener('click', hashAnchorClick);
      }
   }

   // Internal implementation ----------------------------------------------------------------------------------------

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
      if (!this.#navigationIndex?.length) { return false; }

      // Scan all top level entries first.
      for (const entry of this.#navigationIndex)
      {
         if (Array.isArray(entry.children)) { continue; }

         // If the path is found at the top level do nothing and return early.
         if (entry?.path === pathURL) { return true; }
      }

      // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
      for (const entry of this.#navigationIndex)
      {
         if (!Array.isArray(entry.children)) { continue; }

         if (this.#searchPath(entry, pathURL, operation)) { return true; }
      }

      return false;
   }
}

/**
 * Handle any clicks on content anchors with a hash ensuring that the clicked upon anchor is always visible in the
 * navigation tree.
 *
 * @param {NavigationState} navigationState - NavigationState instance.
 *
 * @param {string} baseURL - The base URL.
 */
function createHashAnchorClick(navigationState, baseURL)
{
   return function hashAnchorClick(event)
   {
      event.preventDefault(); // Prevent the default anchor click behavior.

console.log(`!! hashAnchorClick - 0 - this.hash: `, this.hash);
console.log(`!! hashAnchorClick - 0 - this.href: `, this.href);

      // If the hash differs then set the window location.
      if (window.location.hash !== this.hash)
      {
console.log(`!! hashAnchorClick - 1 - not the same hash`)
         window.location.hash = this.hash;
      }
      else
      {
         // Otherwise ensure the current path is visible.
         const hashURL = this.href.replace(baseURL, '');

console.log(`!! hashAnchorClick - 2 - hashURL`)

         navigationState.ensureCurrentPath(hashURL);
      }
   }
}
