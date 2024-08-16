import { nextAnimationFrame } from '#runtime/util/animate';

import { TreeState }          from './TreeState.js';

export class TreeStateControl
{
   /**
    * @type {NavigationData}
    */
   #navData;

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

      // Retrieve the storage prepend string from global DMT options or use a default key.
      const storagePrepend = dmtComponentData.storagePrepend ?? 'docs-unnamed';

      this.#treeMarkdown = new TreeState(navData, dmtComponentData.markdownIndex ?? [], `${storagePrepend}-markdown`);
      this.#treeSource = new TreeState(navData, dmtComponentData.navigationIndex ?? [], `${storagePrepend}-source`);
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
    * Ensures that the current path from any navigation tree is open.
    *
    * @param {object} [options] - Options.
    *
    * @param {boolean}  [options.focus=false] - Attempt to manually focus the current path entry.
    */
   ensureCurrentPath({ focus = false } = {})
   {
      // Ensure current path is open and focus current path navigation entry.
      const currentPathURL = this.#navData.currentPathURL;

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
}
