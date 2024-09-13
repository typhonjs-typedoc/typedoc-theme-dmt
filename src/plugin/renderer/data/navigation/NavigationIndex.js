import { ReflectionKind }  from 'typedoc';

import { NavigationTree }  from '#shared/utils';

import { ModuleTreeMap }   from './ModuleTreeMap.js';

/**
 * Manages modifications to the default theme navigation index.
 */
export class NavigationIndex
{
   /**
    * @type {DMTNavigationIndex} Processed navigation index.
    */
   static #data = { markdown: [], source: [] };

   /**
    * The module NavigationElement name for the fabricated tree index.
    *
    * @type {string}
    */
   static #markdownIndexName = '';

   /**
    * Project package name.
    *
    * @type {string}
    */
   static #packageName = '';

   /**
    * Project name.
    *
    * @type {string}
    */
   static #projectName = '';

   /**
    * @returns {DMTNavigationIndex} Processed navigation index.
    */
   static get data()
   {
      return this.#data;
   }

   /**
    * @returns {boolean} Whether there is Markdown document data.
    */
   static get hasMarkdown()
   {
      return this.#data.markdown.length > 0;
   }

   /**
    * @returns {boolean} Whether there is source data.
    */
   static get hasSource()
   {
      return this.#data.source.length > 0;
   }

   /**
    * @returns {string} The module NavigationElement name for the fabricated tree index.
    */
   static get markdownIndexName()
   {
      return this.#markdownIndexName;
   }

   /**
    * @returns {string} Returns the project package name.
    */
   static get packageName()
   {
      return this.#packageName;
   }

   /**
    * @returns {string} Returns the project name.
    */
   static get projectName()
   {
      return this.#projectName;
   }

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {import('typedoc').ProjectReflection} project -
    *
    * @param {ThemeOptions} options - Theme options.
    *
    * @returns {({
    *    markdown: import('typedoc').NavigationElement[],
    *    source: import('typedoc').NavigationElement[]
    * })} Processed navigation index.
    */
   static transform(app, project, options)
   {
      /** @type {import('typedoc').NavigationElement[]} */
      const index = app.renderer.theme?.getNavigation?.(project) ?? [];

      this.#packageName = project?.packageName;
      this.#projectName = project?.name;

      const markdown = this.#parseMarkdownTree(app, index);

      // No processing necessary so directly return the index.
      const tree = options.navigation.style === 'flat' ? index : this.#parseModuleTree(index, options,
       this.#packageName);

      this.#data = {
         markdown,
         source: options.navigation.style === 'compact' ? ModuleTreeMap.compactSingularPaths(tree) : tree
      };

      return this.#data;
   }

   // Internal Implementation ----------------------------------------------------------------------------------------

   /**
    * @param {import('typedoc').NavigationElement} node - Node to query.
    *
    * @returns {boolean} True if the Node is a folder only node with children.
    */
   static #isFolder(node)
   {
      return typeof node.text === 'string' && Array.isArray(node.children) && node.kind === void 0;
   }

   /**
    * @param {import('typedoc').NavigationElement} node -
    *
    * @param {import('typedoc').ReflectionKind} kind -
    *
    * @returns {boolean} Returns true if `node` is a folder and contains only children that match the reflection kind.
    */
   static #isFolderAllOfKind(node, kind)
   {
      if (!this.#isFolder(node)) { return false; }

      let allOfKind = true;

      /**
       * @type {import('#shared/types').TreeOperation}
       */
      const operation = ({ entry }) =>
      {
         if (entry.kind === void 0) { return; }
         if (entry.kind !== kind) { allOfKind = false; }
      };

      NavigationTree.walkFrom(node, operation);

      return allOfKind;
   }

   /**
    * Parses and separates top level Markdown documents from the main navigation index. Due to the various default
    * options there are various parsing options to handle.
    *
    * @param {import('typedoc').Application} app -
    *
    * @param {import('typedoc').NavigationElement[]} index - The original navigation index.
    *
    * @returns {import('typedoc').NavigationElement[]} Separated Markdown navigation index.
    */
   static #parseMarkdownTree(app, index)
   {
      const markdownIndex = [];

      const navigation = app.options.getValue('navigation');
      const categorizeByGroup = app.options.getValue('categorizeByGroup');

      if (navigation?.includeGroups && navigation?.includeCategories && categorizeByGroup)
      {
         this.#parseMarkdownTreeWithGroups(index, markdownIndex);
      }
      else if (navigation?.includeCategories)
      {
         if (categorizeByGroup)
         {
            this.#parseMarkdownTreeNoCategoriesGroups(index, markdownIndex);
         }
         else
         {
            this.#parseMarkdownTreeWithCategories(index, markdownIndex);
         }
      }
      else if (navigation?.includeGroups)
      {
         this.#parseMarkdownTreeWithGroups(index, markdownIndex);
      }
      else if (!navigation?.includeGroups)
      {
         this.#parseMarkdownTreeNoCategoriesGroups(index, markdownIndex);
      }

      return markdownIndex;
   }

   /**
    * @param {import('typedoc').NavigationElement[]} index - The original navigation index.
    *
    * @param {import('typedoc').NavigationElement[]} markdownIndex - The target tree to separate into.
    */
   static #parseMarkdownTreeNoCategoriesGroups(index, markdownIndex)
   {
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

         const markdownIndexNode = index.pop();

         this.#markdownIndexName = markdownIndexNode.text;

         index.push(...children);
      }
   }

   /**
    * @param {import('typedoc').NavigationElement[]} index - The original navigation index.
    *
    * @param {import('typedoc').NavigationElement[]} markdownIndex - The target tree to separate into.
    */
   static #parseMarkdownTreeWithCategories(index, markdownIndex)
   {
      // Parse top level nodes.
      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];

         // If all children entries are documents then splice entire folder.
         if (this.#isFolderAllOfKind(node, ReflectionKind.Document))
         {
            markdownIndex.unshift(node);
            index.splice(i, 1);
            continue;
         }

         // Otherwise separate out Markdown documents from any folder children.
         if (this.#isFolder(node))
         {
            const children = node.children ?? [];

            const childrenDocuments = [];

            for (let j = children.length; --j >= 0;)
            {
               const childNode = children[j];
               if (childNode.kind === ReflectionKind.Document)
               {
                  childrenDocuments.unshift(childNode);
                  children.splice(j, 1);
               }
            }

            if (childrenDocuments.length)
            {
               markdownIndex.unshift(Object.assign({}, node, { children: childrenDocuments }));
            }
         }
      }

      // Remove remaining `Other` category folder if it only contains modules or if this is a fabricated `index`
      // module.
      if (index.length === 1 && this.#isFolder(index[0]))
      {
         const children = index[0]?.children ?? [];

         let allModules = true;

         for (const node of children)
         {
            if (node.kind !== ReflectionKind.Module) { allModules = false; }
         }

         if (allModules)
         {
            // Remove all nodes.
            index.length = 0;

            // There is a single child matching the fabricated `index` module when markdown files are present.
            if (markdownIndex.length && children.length === 1 && children[0]?.kind === ReflectionKind.Module &&
             children[0]?.text === 'index')
            {
               index.push(...children[0]?.children ?? []);
            }
            else
            {
               // Add all children modules to top level.
               index.push(...children);
            }
         }
      }
   }

   /**
    * @param {import('typedoc').NavigationElement[]} index - The original navigation index.
    *
    * @param {import('typedoc').NavigationElement[]} markdownIndex - The target tree to separate into.
    */
   static #parseMarkdownTreeWithGroups(index, markdownIndex)
   {
      // Parse top level nodes.
      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];

         // If all children entries are documents then splice entire folder.
         if (this.#isFolderAllOfKind(node, ReflectionKind.Document))
         {
            markdownIndex.unshift(node);
            index.splice(i, 1);
         }
      }

      // Remove TypeDoc fabricated root module when there are markdown files present in the index.
      if (index.length === 1 && this.#isFolder(index[0]))
      {
         const children = index[0]?.children ?? [];

         let allModules = true;

         for (const node of children)
         {
            if (node.kind !== ReflectionKind.Module) { allModules = false; }
         }

         if (allModules)
         {
            index.length = 0;

            // There are Markdown documents and there is a single child matching the fabricated `index` module when
            // markdown files are present.
            if (markdownIndex.length && children.length === 1 &&
             children[0]?.kind === ReflectionKind.Module && children[0]?.text === 'index')
            {
               index.push(...children[0]?.children ?? []);
            }
            else
            {
               index.push(...children);
            }
         }
      }
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
