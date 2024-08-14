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
    * @param {string}   [packageName] Any associated package name.
    *
    * @returns {({
    *    markdownIndex: import('typedoc').NavigationElement[],
    *    navigationIndex: import('typedoc').NavigationElement[]
    * })} Processed navigation index.
    */
   static transform(index, options, packageName)
   {
      const markdownIndex = this.#parseMarkdownTree(index);

      // No processing necessary so directly return the index.
      const tree = options.navigation.style === 'flat' ? index : this.#parseModuleTree(index, options, packageName);

      return {
         markdownIndex,
         navigationIndex: options.navigation.style === 'compact' ? ModuleTreeMap.compactSingularPaths(tree) : tree
      };
   }

   /**
    * Parses and separates top level Markdown documents from the main navigation index.
    *
    * @param {import('typedoc').NavigationElement[]} index

    * @returns {import('typedoc').NavigationElement[]}
    */
   static #parseMarkdownTree(index)
   {
      const markdownIndex = [];

      // Determine if there is a top level "Modules" group node. This is the case when Typedoc option
      // `navigation: { includeGroups: true }` is set.
      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];
         if (node?.kind === ReflectionKind.Document)
         {
            markdownIndex.unshift(node);

            index.splice(i, 1);
         }
      }

      // Remove TypeDoc fabricated root module when there are markdown files present in the index.
      if (markdownIndex.length && index.length === 1 && index[0]?.kind === ReflectionKind.Module)
      {
         const children = index[0]?.children ?? [];

         index.pop();
         index.push(...children);
      }

      return markdownIndex;
   }

   /**
    * @param {import('typedoc').NavigationElement[]}  index - Navigation index.
    *
    * @param {ThemeOptions} options - Theme options.
    *
    * @param {string}   [packageName] Any associated package name.
    *
    * @returns {import('typedoc').NavigationElement[]} Processed navigation index.
    */
   static #parseModuleTree(index, options, packageName)
   {
      const moduleTreeMap = new ModuleTreeMap(Number.MAX_SAFE_INTEGER, packageName);

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

            // Potentially change text to `Packages` given `isPackage` option.
            if (options.moduleRemap.isPackage) { moduleGroup.text = 'Packages'; }

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
