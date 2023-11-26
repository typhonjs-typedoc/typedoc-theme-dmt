/**
 * Finds the child nodes that match the given path URL by a depth first search and sets a new `opened` attribute
 * used to override any stored values from session storage on initial render ensuring that the current entry is always
 * visible.
 *
 * @param {import('typedoc').NavigationElement[]} navigationIndex - The navigation index.
 *
 * @param {string}   pathURL - The path URL to locate.
 */
export function openCurrentPath(navigationIndex, pathURL)
{
   if (!navigationIndex?.length) { return; }

   // Scan all top level entries first.
   for (const entry of navigationIndex)
   {
      if (Array.isArray(entry.children)) { continue; }

      // If the path is found at the top level do nothing and return early.
      if (entry?.path === pathURL) { return; }
   }

   // Depth first search for path setting a new variable `opened` for all leaves up to path entry.
   for (const entry of navigationIndex)
   {
      if (!Array.isArray(entry.children)) { continue; }

      if (searchPath(entry, pathURL)) { return; }
   }
}

/**
 * Helper function to recursively search for the path and set the 'opened' property.
 *
 * @param {import('typedoc').NavigationElement} entry - Current NavigationElement.
 *
 * @param {string}   pathURL - The path URL to locate.
 *
 * @returns {boolean} Whether the path URL matched an entry in this branch.
 */
function searchPath(entry, pathURL)
{
   // If the path matches, return true to indicate the path has been found.
   if (entry.path === pathURL) { return true; }

   // If the entry has children, continue the search recursively.
   if (Array.isArray(entry.children))
   {
      for (const child of entry.children)
      {
         const found = searchPath(child, pathURL);
         if (found)
         {
            entry.opened = true; // Set the 'opened' property for the parent.
            return true;
         }
      }
   }

   // If the path has not been found in this branch, return false.
   return false;
}
