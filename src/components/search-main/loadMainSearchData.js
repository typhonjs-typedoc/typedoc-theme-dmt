import { Index }  from 'lunr';

/**
 * Loads main search index.
 *
 * @returns {Promise<boolean>} Did the search index load.
 */
export async function loadMainSearchData()
{
   const dmtURL = import.meta.url.replace(/\/dmt-components.js/, '');

   const response = await fetch(`${dmtURL}/search.cmp`);

   if (!response.ok)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load search index.`);
      return false;
   }

   try
   {
      const arrayBuffer = await response.arrayBuffer();

      /** @type {{ rows: SearchDocument[], index: [] }} */
      const data = globalThis.dmtInflateAndUnpack(new Uint8Array(arrayBuffer));

      globalThis.dmtSearchMainRows = data.rows;
      globalThis.dmtSearchMainIndex = Index.load(data.index);
   }
   catch (err)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load search index.`);
      console.error(err);
      return false;
   }

   return true;
}
