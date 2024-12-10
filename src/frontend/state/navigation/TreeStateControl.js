import { writable }           from 'svelte/store';

import { nextAnimationFrame } from '#runtime/util/animate';

import { TreeState }          from './TreeState.js';

/**
 * Provides the ability to access each navigation tree in addition to managing state for initial opened state for
 * entries in any tree and ensuring opened state when URL hash changes occur.
 */
export class TreeStateControl
{
   /**
    * Stores the active tree name set in `setCurrentPathURL`.
    *
    * @type {string}
    */
   #activeTreeName = '';

   /**
    * The current tree state entry path URL.
    *
    * @type {string}
    */
   #currentPathURL;

   /**
    * @type {NavigationData}
    */
   #navData;

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
    * Markdown document tree state control.
    *
    * @type {TreeState}
    */
   #treeMarkdown;

   /**
    * Source tree state control.
    *
    * @type {TreeState}
    */
   #treeSource;

   /**
    * @param {NavigationData} navData - NavigationData instance.
    *
    * @param {DMTComponentData}  dmtComponentData - DMT component data.
    *
    * @param {DMTNavigationIndex} navigationIndex - BCMP navigation index.
    */
   constructor(navData, dmtComponentData, navigationIndex)
   {
      this.#navData = navData;

      this.#currentPathURL = dmtComponentData.initialPathURL;

      const { subscribe, update } = writable(this.#currentPathURL);

      this.#storeCurrentPathURL = Object.freeze({ subscribe });
      this.#storeCurrentPathURLUpdate = update;

      // Retrieve the storage prepend string from global DMT options or use a default key.
      const storagePrepend = dmtComponentData.storagePrepend;

      const setCurrentPathURLBound = this.#setCurrentPathURL.bind(this);

      this.#treeMarkdown = new TreeState({
         currentPathURL: this.#currentPathURL,
         setCurrentPathURL: setCurrentPathURLBound,
         elementIndex: navigationIndex?.markdown ?? [],
         storagePrepend: `${storagePrepend}-markdown`,
         treeName: 'markdown'
      });

      this.#treeSource = new TreeState({
         currentPathURL: this.#currentPathURL,
         setCurrentPathURL: setCurrentPathURLBound,
         elementIndex: navigationIndex?.source ?? [],
         storagePrepend: `${storagePrepend}-source`,
         treeName: 'source'
      });

      // Modify all content links with hash fragments.
      this.#hashAnchorLinks();

      globalThis.addEventListener('hashchange', this.#onHashchange.bind(this));

      // Ensure that the initial navigation tree link is scrolled into view.
      this.ensureCurrentPath();
   }

   /**
    * @returns {string} The currently active tree name.
    */
   get activeTreeName()
   {
      return this.#activeTreeName;
   }

   /**
    * @returns {string} The current tree state entry path URL.
    */
   get currentPathURL()
   {
      return this.#currentPathURL;
   }

   /**
    * @returns {TreeState} The Markdown document tree state.
    */
   get markdown()
   {
      return this.#treeMarkdown;
   }

   /**
    * @returns {TreeState} The source code tree state.
    */
   get source()
   {
      return this.#treeSource;
   }

   /**
    * @returns {import('svelte/store').Readable<string>} The current tree state entry path URL store.
    */
   get storeCurrentPathURL()
   {
      return this.#storeCurrentPathURL;
   }

   /**
    * Ensures that the current or given path from any navigation tree is open.
    *
    * @param {object} [options] - Options.
    *
    * @param {string} [options.pathURL] A new tree entry path URL to select and ensure open.
    *
    * @param {boolean}  [options.focus=false] - Attempt to manually focus the current path entry.
    */
   ensureCurrentPath({ pathURL = this.#currentPathURL, focus = false } = {})
   {
      let result = false;

      result |= this.#treeMarkdown.ensureCurrentPath(pathURL);
      result |= this.#treeSource.ensureCurrentPath(pathURL);

      // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
      if (result)
      {
         nextAnimationFrame().then(() =>
         {
            const linkEl = document.querySelector('nav.tsd-navigation')?.querySelector(`a[href*="${pathURL}"]`);

            if (linkEl)
            {
               linkEl.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });

               if (focus) { linkEl.focus({ focusVisible: true }); }
            }
         });
      }
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Create custom click handlers for all main content anchors that have a hash fragment. `hashAnchorClick` will
    * ensure that the Navigation entry is visible when clicked even if the main URL hash fragment doesn't change.
    */
   #hashAnchorLinks()
   {
      const thisTreeControl = this;

      /**
       * Handle any clicks on content anchors with a hash ensuring that the clicked upon anchor is always visible in the
       * navigation tree.
       *
       * @param {PointerEvent}   event -
       *
       * @this {HTMLAnchorElement}
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

         const pathURL = this.href.replace(thisTreeControl.#navData.baseURL, '');

         if (!thisTreeControl.ensureCurrentPath({ pathURL }) && pathURL.includes('#'))
         {
            // Handle the case where the hash fragment is not in the navigation index. Attempt to ensure current path
            // without the hash fragment.
            const match = pathURL.split('#');

            // No hash URL
            if (match[0])
            {
               thisTreeControl.ensureCurrentPath({ pathURL: match[0] });
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
    * Updates the session storage state opening all tree nodes to the new URL path. This is added as a listener for
    * `hashchange` on `window`.
    *
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   #onHashchange(event)
   {
      const pathURL = event.newURL.replace(this.#navData.baseURL, '');

      // Ensure any tree nodes are open for `newURLPath`.
      if (!this.ensureCurrentPath({ pathURL }) && pathURL.includes('#'))
      {
         // Handle the case where the hash fragment is not in the navigation index. Attempt to ensure current path
         // without the hash fragment.
         const noHashURL = pathURL.split('#')[0];
         if (noHashURL) { this.ensureCurrentPath({ pathURL: noHashURL }); }
      }
   }

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    *
    * @param {string}   treeName - The active tree name.
    */
   #setCurrentPathURL(pathURL, treeName)
   {
      switch (treeName)
      {
         case 'markdown':
         case 'source':
            this.#activeTreeName = treeName;
            break;
         default:
            this.#activeTreeName = '';
      }

      this.#currentPathURL = pathURL;
      this.#storeCurrentPathURLUpdate(() => pathURL);
   }
}
