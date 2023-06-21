import { inflateAndUnpack }   from '#runtime/data/format/msgpack/compress';
import { TrieSearch }         from '#runtime/data/struct/search/trie';

/**
 * Loads quick search index.
 *
 * @returns {Promise<boolean>} Did the search index load.
 */
export async function loadQuickSearchData()
{
   const dmtURL = import.meta.url.replace(/\/dmt-components.js/, '');

   const response = await fetch(`${dmtURL}/search-quick.cmp`);

   if (!response.ok)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load quick search index.`);
      return false;
   }

   try
   {
      /** @type {TrieSearch<SearchNavDocument>} */
       // const dmtSearchQuick = new TrieSearch('n', { min: 2, splitOnRegEx: /\./ });
      const dmtSearchQuick = new TrieSearch('n', { min: 2 });

      const arrayBuffer = await response.arrayBuffer();
      dmtSearchQuick.add(inflateAndUnpack(new Uint8Array(arrayBuffer)));

      /** @type {TrieSearch<SearchNavDocument>} */
      globalThis.dmtSearchQuick = dmtSearchQuick;
   }
   catch (err)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load quick search index.`);
      console.error(err);
      return false;
   }

   // TODO: Remove - initial testing ---------------------------------------------------------------------------------

   // let searchString = '';
   //
   // globalThis.document.addEventListener('keyup', (event) =>
   // {
   //    const key = event.key;
   //
   //    if ((/^[A-Za-z0-9.]$/i).test(key))
   //    {
   //       searchString += key;
   //       console.log(globalThis.dmtSearchQuick.search(searchString));
   //    }
   //    else if (event.key === 'Backspace')
   //    {
   //       if (searchString.length)
   //       {
   //          searchString = searchString.substring(0, searchString.length - 1);
   //       }
   //
   //       if (searchString.length)
   //       {
   //          console.log(globalThis.dmtSearchQuick.search(searchString));
   //       }
   //    }
   //    else if (event.key === 'Escape')
   //    {
   //       searchString = '';
   //    }
   // });

   return true;
}