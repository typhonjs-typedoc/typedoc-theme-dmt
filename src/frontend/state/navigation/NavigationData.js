import {
   get,
   writable }                 from 'svelte/store';

import { TreeStateControl }   from './TreeStateControl.js';

/**
 * Provides state and control for all navigation components.
 */
export class NavigationData
{
   /**
    * The navigation bar help panel opened state.
    *
    * @type {import('svelte/store').Writable<boolean>}
    */
   #storeHelpPanelOpen = writable(false);

   /**
    * Tree state control.
    *
    * @type {TreeStateControl}
    */
   #treeStateControl;

   /**
    * @param {DMTComponentData}  dmtComponentData - Global component data.
    *
    * @param {DMTNavigationIndex} navigationIndex - BCMP navigation index.
    */
   constructor(dmtComponentData, navigationIndex)
   {
      this.#treeStateControl = new TreeStateControl(this, dmtComponentData, navigationIndex);
   }

   /**
    * @returns {import('svelte/store').Writable<boolean>} The navigation bar help panel opened state store.
    */
   get storeHelpPanelOpen()
   {
      return this.#storeHelpPanelOpen;
   }

   /**
    * @returns {TreeStateControl} The tree state control.
    */
   get treeState()
   {
      return this.#treeStateControl;
   }

   /**
    * Swaps the help panel open state.
    */
   swapHelpPanelOpen()
   {
      this.#storeHelpPanelOpen.set(!get(this.#storeHelpPanelOpen));
   }
}
