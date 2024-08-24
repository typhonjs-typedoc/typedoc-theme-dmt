import { ReflectionKind }  from 'typedoc';

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

      const markdown = this.#parseMarkdownTree(index);

      // No processing necessary so directly return the index.
      const tree = options.navigation.style === 'flat' ? index : this.#parseModuleTree(index, options,
       this.#packageName);

      this.#data = {
         markdown,
         source: options.navigation.style === 'compact' ? ModuleTreeMap.compactSingularPaths(tree) : tree
      };

      return this.#data;
   }

   /**
    * Parses and separates top level Markdown documents from the main navigation index.
    *
    * @param {import('typedoc').NavigationElement[]} index - The original navigation index.
    *
    * @returns {import('typedoc').NavigationElement[]} Separated Markdown navigation index.
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

         const markdownIndex = index.pop();

         this.#markdownIndexName = markdownIndex.text;

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
