/**
 * @param {string}   query - A search query.
 *
 * @returns {[]} Processed query results.
 */
export function processSearchQuery(query)
{
   const search = query.trim();

   console.log(`!! processSearchQuery - search: `, search);

   const results = search.length && globalThis.dmtSearchMainIndex ?
    globalThis.dmtSearchMainIndex.search(`*${search}*`) : [];

   return results;
}