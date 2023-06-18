import { inflateAndUnpack }   from '#runtime/data/format/msgpack/compress';
import { TrieSearch }         from '#runtime/data/struct/search/trie';

/**
 * Loads quick search data.
 *
 * @returns {Promise<void>}
 */
export async function loadQuickSearchData()
{
   const dmtURL = import.meta.url.replace(/\/dmt-quick-search.js/, '');

   const response = await fetch(`${dmtURL}/search-nav.cmp`);

   if (!response.ok)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load navigation search index.`);
      return;
   }

   try
   {
      /** @type {TrieSearch<SearchNavDocument>} */
      // const dmtSearchNav = new TrieSearch('n', { indexField: 'i' });
      const dmtSearchNav = new TrieSearch('n');

      const arrayBuffer = await response.arrayBuffer();
      dmtSearchNav.add(inflateAndUnpack(new Uint8Array(arrayBuffer)));

      /** @type {TrieSearch<SearchNavDocument>} */
      globalThis.dmtSearchNav = dmtSearchNav;
   }
   catch (err)
   {
      console.warn(`[typedoc-theme-default-modern] Could not load navigation search index.`);
      console.error(err);
      return;
   }

   // TODO: Remove - initial testing ---------------------------------------------------------------------------------

   let searchString = '';

   globalThis.document.addEventListener('keyup', (event) =>
   {
      const key = event.key;

      if ((/^[A-Za-z0-9.]$/i).test(key))
      {
         searchString += key;
         console.log(globalThis.dmtSearchNav.search(searchString));
      }
      else if (event.key === 'Backspace')
      {
         if (searchString.length)
         {
            searchString = searchString.substring(0, searchString.length - 1);
         }

         if (searchString.length)
         {
            console.log(globalThis.dmtSearchNav.search(searchString));
         }
      }
      else if (event.key === 'Escape')
      {
         searchString = '';
      }
   });
}