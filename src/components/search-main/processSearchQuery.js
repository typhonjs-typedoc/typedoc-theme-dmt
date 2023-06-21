/**
 * Note: The Lunr processing code in this source file is taken from the TypeDoc project and slightly modified to match
 * the abbreviated fields in the DMT main search index data.
 *
 * @see https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/typedoc/components/Search.ts
 */

/**
 * @param {string}   query - A search query.
 *
 * @returns {[]} Processed query results.
 */
export function processSearchQuery(query)
{
   const searchText = query.trim();

   const res = searchText.length && globalThis.dmtSearchMainLunr ?
    globalThis.dmtSearchMainLunr.search(`*${searchText}*`) : [];

   const results = [];

   for (let i = 0; i < res.length; i++)
   {
      const item = res[i];
      const row = globalThis.dmtSearchMainData.rows[Number(item.ref)];
      let boost = 1;

      // Boost by exact match on name.
      if (row.n.toLowerCase().startsWith(searchText.toLowerCase())) // name
      {
         boost *= 1 + 1 / (1 + Math.abs(row.n.length - searchText.length)); // name
      }

      item.score *= boost;
   }

   res.sort((a, b) => b.score - a.score);

   // TODO Add option for max search results.
   for (let c = Math.min(10, res.length), i = 0; i < c; i++)
   {
      const resultLunr = res[i];
      const index = Number(resultLunr.ref);
      const row = globalThis.dmtSearchMainData.rows[index];

      // Bold the matched part of the query in the search results
      let name = boldMatches(row.n, searchText); // name

      if (globalThis.DEBUG_SEARCH_WEIGHTS) { name += ` (score: ${resultLunr.score.toFixed(2)})`; }

      if (row.p) // parent
      {
         name = `<span class="parent">${boldMatches(
          row.p,
          searchText
         )}.</span>${name}`;
      }

      results.push({
         id: index,
         kind: row.k,
         classes: row.c ?? '', // classes
         href: `${globalThis.dmtOptions.basePath}${row.u}`, // URL
         name
      });
   }

   return results;
}

/**
 * @param {string}   text -
 *
 * @param {string}   search -
 *
 * @returns {string} Text w/ bold matches.
 */
function boldMatches(text, search)
{
   if (search === '') { return text; }

   const lowerText = text.toLocaleLowerCase();
   const lowerSearch = search.toLocaleLowerCase();

   const parts = [];

   let lastIndex = 0;
   let index = lowerText.indexOf(lowerSearch);

   while (index !== -1)
   {
      parts.push(
       escapeHtml(text.substring(lastIndex, index)),
       `<b>${escapeHtml(
        text.substring(index, index + lowerSearch.length)
       )}</b>`
      );

      lastIndex = index + lowerSearch.length;
      index = lowerText.indexOf(lowerSearch, lastIndex);
   }

   parts.push(escapeHtml(text.substring(lastIndex)));

   return parts.join('');
}

const SPECIAL_HTML = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
   "'": "&#039;",
   '"': "&quot;",
};

/**
 * @param {string}   text -
 *
 * @returns {*} Escaped text.
 */
function escapeHtml(text)
{
   return text.replace(/[&<>"']/g, (match) => SPECIAL_HTML[match]);
}
