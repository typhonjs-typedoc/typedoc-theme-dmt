import { nextAnimationFrame } from '#runtime/util/animate';

import { TreeState }          from './TreeState.js';
import {writable} from "svelte/store";

export class TreeStateControl
{
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
    */
   constructor(navData, dmtComponentData)
   {
      this.#navData = navData;

      this.#currentPathURL = dmtComponentData.initialPathURL;

      const { subscribe, update } = writable(this.#currentPathURL);

      this.#storeCurrentPathURL = Object.freeze({ subscribe });
      this.#storeCurrentPathURLUpdate = update;

      // Retrieve the storage prepend string from global DMT options or use a default key.
      const storagePrepend = dmtComponentData.storagePrepend ?? 'docs-unnamed';

      const setCurrentPathURLBound = this.#setCurrentPathURL.bind(this);

      this.#treeMarkdown = new TreeState({
         baseURL: navData.baseURL,
         currentPathURL: this.#currentPathURL,
         setCurrentPathURL: setCurrentPathURLBound,
         elementIndex: dmtComponentData.markdownIndex ?? [],
         storagePrepend: `${storagePrepend}-markdown`
      });

      this.#treeSource = new TreeState({
         baseURL: navData.baseURL,
         currentPathURL: this.#currentPathURL,
         setCurrentPathURL: setCurrentPathURLBound,
         elementIndex: dmtComponentData.navigationIndex ?? [],
         storagePrepend: `${storagePrepend}-source`
      });
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
    * Ensures that the current path from any navigation tree is open.
    *
    * @param {object} [options] - Options.
    *
    * @param {boolean}  [options.focus=false] - Attempt to manually focus the current path entry.
    */
   ensureCurrentPath({ focus = false } = {})
   {
      // Ensure current path is open and focus current path navigation entry.
      const currentPathURL = this.#currentPathURL;

      let result = false;

      result |= this.#treeMarkdown.ensureCurrentPath(currentPathURL);
      result |= this.#treeSource.ensureCurrentPath(currentPathURL);

      // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
      if (result && focus)
      {
         nextAnimationFrame().then(() => document.querySelector('nav.tsd-navigation')?.querySelector(
          `a[href*="${currentPathURL}"]`)?.focus({ focusVisible: true }));
      }
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   #setCurrentPathURL(pathURL)
   {
      this.#currentPathURL = pathURL;
      this.#storeCurrentPathURLUpdate(() => pathURL);
   }
}
