import { ReflectionKind }  from 'typedoc';

import { ModuleTreeMap }   from './ModuleTreeMap.js';

/**
 * Manages modifications to the default theme navigation index.
 */
export class NavigationIndex
{
   /**
    * @param {import('typedoc').NavigationElement[]}  index - Original navigation index.
    *
    * @param {ThemeOptions} options - Theme options.
    *
    * @returns {import('typedoc').NavigationElement[]} Processed navigation index.
    */
   static transform(index, options)
   {
      // No processing necessary so directly return the index.
      if (options.navModuleDepth === 0) { return index; }

      return this.parseModuleTree(index, options.navModuleDepth);
   }

   /**
    * @param {import('typedoc').NavigationElement[]}  index - Navigation index.
    *
    * @param {number} depthMax - Max depth to parse.
    *
    * @returns {import('typedoc').NavigationElement[]} Processed navigation index.
    */
   static parseModuleTree(index, depthMax)
   {
      const moduleTreeMap = new ModuleTreeMap(depthMax);

      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];

         // For all module NavigationElements add to the module tree map and remove original from navigation index.
         if (node.kind === ReflectionKind.Module)
         {
            moduleTreeMap.add(node);

            index.splice(i, 1);
         }
      }

      index.unshift(...moduleTreeMap.buildTree());

      return index;
   }
}
