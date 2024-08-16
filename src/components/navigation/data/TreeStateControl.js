import { TreeState } from './TreeState.js';

export class TreeStateControl
{
   /**
    * Markdown document tree state control.
    */
   #treeMarkdown;

   /**
    * Source tree state control.
    *
    * @type {TreeState}
    */
   #treeSource

   /**
    *
    * @param {import('./NavigationData').NavigationData} navData - NavigationData instance.
    *
    * @param {DMTComponentData}  dmtComponentData - DMT component data.
    */
   constructor(navData, dmtComponentData)
   {
      this.#treeMarkdown = new TreeState(navData, dmtComponentData.markdownIndex);
      this.#treeSource = new TreeState(navData, dmtComponentData.navigationIndex);
   }

   get markdown()
   {
      return this.#treeMarkdown;
   }

   get source()
   {
      return this.#treeSource;
   }
}
