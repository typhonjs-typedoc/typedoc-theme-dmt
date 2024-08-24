import { TreeStateControl }   from './TreeStateControl.js';

/**
 * Provides state and control for all navigation components.
 */
export class NavigationData
{
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
    * @returns {TreeStateControl} The tree state control.
    */
   get treeState()
   {
      return this.#treeStateControl;
   }
}
