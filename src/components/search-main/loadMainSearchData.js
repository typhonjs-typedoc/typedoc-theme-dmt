import { Index }              from 'lunr';

import { inflateAndUnpack }   from '#runtime/data/format/msgpack/compress';

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

      globalThis.dmtSearchMainData = inflateAndUnpack(new Uint8Array(arrayBuffer));
      globalThis.dmtSearchMainIndex = Index.load(globalThis.dmtSearchMainData.index);
   }
   catch (err)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load search index.`);
      console.error(err);
      return false;
   }

   // TODO: Remove - initial testing ---------------------------------------------------------------------------------

   let searchString = '';

   globalThis.document.addEventListener('keyup', (event) =>
   {
      const key = event.key;

      if ((/^[A-Za-z0-9.]$/i).test(key))
      {
         searchString += key;

         const res = searchString ? globalThis.dmtSearchMainIndex.search(`*${searchString}*`) : [];
         console.log(res);
      }
      else if (event.key === 'Backspace')
      {
         if (searchString.length)
         {
            searchString = searchString.substring(0, searchString.length - 1);
         }

         if (searchString.length)
         {
            let res = searchString ? globalThis.dmtSearchMainIndex.search(`*${searchString}*`) : [];
            console.log(res);
         }
      }
      else if (event.key === 'Escape')
      {
         searchString = '';
      }
   });

   return true;
}