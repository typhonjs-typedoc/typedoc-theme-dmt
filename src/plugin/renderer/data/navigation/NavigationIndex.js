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

      const tree = this.#parseModuleTree(index, options);

      return options.navModuleCompact ? ModuleTreeMap.compactSingularPaths(tree) : tree;
   }

   /**
    * @param {import('typedoc').NavigationElement[]}  index - Navigation index.
    *
    * @param {ThemeOptions} options - Theme options.
    *
    * @returns {import('typedoc').NavigationElement[]} Processed navigation index.
    */
   static #parseModuleTree(index, options)
   {
      const moduleTreeMap = new ModuleTreeMap(options.navModuleDepth);

      let moduleGroup;

      // Determine if there is a top level "Modules" group node. This is the case when Typedoc option
      // `navigation: { includeGroups: true }` is set.
      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];
         if (node?.text === 'Modules' && Array.isArray(node.children) &&
          node.children?.[0]?.kind === ReflectionKind.Module)
         {
            moduleGroup = node;

            // Potentially change text to `Packages` given `moduleAsPackage` option.
            if (options.moduleAsPackage) { moduleGroup.text = 'Packages'; }

            break;
         }
      }

      // Handle the case when modules are in the module group node.
      if (moduleGroup)
      {
         for (let i = moduleGroup.children.length; --i >= 0;)
         {
            const node = moduleGroup.children[i];

            // For all module NavigationElements add to the module tree map and remove original from navigation index.
            if (node.kind === ReflectionKind.Module)
            {
               moduleTreeMap.add(node);

               moduleGroup.children.splice(i, 1);
            }
         }

         moduleGroup.children.unshift(...moduleTreeMap.buildTree());
      }
      else // Filter the main index.
      {
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
      }

      return index;
   }
}
