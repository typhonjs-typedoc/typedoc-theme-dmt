/**
 * Provides a basic mechanism to walk and query the TypeDoc `NavigationElement` tree structure.
 */
export class NavigationTree
{
   /**
    * Searches the navigation index for the given path URL and performs the given operation on each tree node from the
    * path if found.
    *
    * @param {import('typedoc').NavigationElement[] } tree - The root tree node to walk.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {import('./types').TreeOperation} operation - Tree entry operation to apply.
    *
    * @returns {boolean} If the path is found and operation is applied.
    */
   static searchPath(tree, pathURL, operation)
   {
      if (!tree?.length) { return false; }

      // Scan all top level entries first.
      for (const entry of tree)
      {
         if (Array.isArray(entry.children)) { continue; }

         // If the path is found at the top level do nothing and return early.
         if (entry?.path === pathURL) { return true; }
      }

      // Depth first search for path executing `operation` if found.
      for (const entry of tree)
      {
         if (!Array.isArray(entry.children)) { continue; }

         if (this.#searchPath(entry, pathURL, operation)) { return true; }
      }

      return false;
   }

   /**
    * Recursively walks the navigation index / tree for just tree nodes invoking the given operation.
    *
    * @param {import('typedoc').NavigationElement[] } tree - The root tree node to walk.
    *
    * @param {import('./types').TreeOperation}  operation - Tree entry operation to apply.
    */
   static walk(tree, operation)
   {
      // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
      for (const entry of tree)
      {
         if (!Array.isArray(entry.children)) { continue; }

         this.#walkPath(entry, void 0, operation);
      }
   }

   /**
    * Recursively walks the navigation index / tree for just tree nodes invoking the given operation from the given
    * `entry`.
    *
    * @param {import('typedoc').NavigationElement} entry - The current entry.
    *
    * @param {import('./types').TreeOperation}  operation - Tree entry operation to apply.
    */
   static walkFrom(entry, operation)
   {
      this.#walkPath(entry, void 0, operation);
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Helper function to recursively search for the path and perform the operation given for each tree node.
    *
    * @param {import('typedoc').NavigationElement} entry - Current NavigationElement.
    *
    * @param {string}   pathURL - The path URL to locate.
    *
    * @param {import('./types').TreeOperation} operation - Tree entry operation to apply.
    *
    * @returns {boolean} Whether the path URL matched an entry in this branch.
    */
   static #searchPath(entry, pathURL, operation)
   {
      // If the path matches, return true to indicate the path has been found.
      if (entry.path === pathURL) { return true; }

      // If the entry has children, continue the search recursively.
      if (Array.isArray(entry.children))
      {
         for (const child of entry.children)
         {
            const found = this.#searchPath(child, pathURL, operation);
            if (found)
            {
               operation({ entry });
               return true;
            }
         }
      }

      // If the path has not been found in this branch, return false.
      return false;
   }

   /**
    * Walks the navigation index / tree for each path recursively.
    *
    * @param {import('typedoc').NavigationElement} entry - The current entry.
    *
    * @param {import('typedoc').NavigationElement} parentEntry - The parent entry.
    *
    * @param {import('./types').TreeOperation}  operation - Tree entry operation to apply.
    */
   static #walkPath(entry, parentEntry, operation)
   {
      // If the entry has children, continue the search recursively.
      if (Array.isArray(entry.children))
      {
         for (const child of entry.children) { this.#walkPath(child, entry, operation); }
      }

      operation({ entry, parentEntry });
   }
}
