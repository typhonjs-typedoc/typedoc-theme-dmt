/**
 * Provides a basic mechanism to walk and query the TypeDoc `NavigationElement` tree structure.
 */
export class NavigationTreeSearch
{
   /**
    * Recursively walks the navigation index / tree for just tree nodes invoking the given operation.
    *
    * @param {import('typedoc').NavigationElement[] } tree - The root tree node to walk.
    *
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    */
   static walkTree(tree, operation)
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
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    */
   static walkTreeFrom(entry, operation)
   {
      this.#walkPath(entry, void 0, operation);
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   /**
    * Walks the navigation index / tree for each path recursively.
    *
    * @param {import('#frontend/types').DMTNavigationElement} entry - The current entry.
    *
    * @param {import('#frontend/types').DMTNavigationElement} parentEntry - The parent entry.
    *
    * @param {TreeOperation}  operation - Tree entry operation to apply.
    */
   static #walkPath(entry, parentEntry, operation)
   {
      // If the entry has children, continue the search recursively.
      if (Array.isArray(entry.children))
      {
         for (const child of entry.children)
         {
            if (!Array.isArray(child.children)) { continue; }

            this.#walkPath(child, entry, operation);
         }
      }

      operation(entry, parentEntry);
   }
}

/**
 * @typedef {((
 *    entry: import('typedoc').NavigationElement,
 *    parentEntry?: import('typedoc').NavigationElement) => void
 * )} TreeOperation A function to invoke for tree nodes when walking the tree.
 */
