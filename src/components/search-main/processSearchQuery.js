/**
 * Note: The Lunr processing code in this source file is taken from the TypeDoc project and slightly modified to match
 * the abbreviated fields in the DMT main search index data; {@link SearchDocument}.
 *
 * @see https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/typedoc/components/Search.ts
 */

/**
 * @param {string}   query - A search query.
 *
 * @returns {ProcessedSearchDocument[]} Processed query results.
 */
export function processSearchQuery(query)
{
   const searchText = query.trim();

   if (searchText.length === 0) { return []; }

   const indexResults = globalThis.dmtSearchMainIndex.search(`*${searchText}*`);

   /** @type {ProcessedSearchDocument[]} */
   const processedDocuments = [];

   for (let i = 0; i < indexResults.length; i++)
   {
      const item = indexResults[i];
      const row = globalThis.dmtSearchMainRows[Number(item.ref)];
      let boost = 1;

      // Boost by exact match on name.
      if (row.n.toLowerCase().startsWith(searchText.toLowerCase())) // name
      {
         boost *= 1 + 1 / (1 + Math.abs(row.n.length - searchText.length)); // name
      }

      item.score *= boost;
   }

   indexResults.sort((a, b) => b.score - a.score);

   for (let c = Math.min(globalThis.dmtOptions.searchLimit ?? 10, indexResults.length), i = 0; i < c; i++)
   {
      const indexResult = indexResults[i];
      const index = Number(indexResult.ref);
      const row = globalThis.dmtSearchMainRows[index];

      // Bold the matched part of the query in the search results
      let name = boldMatches(row.n, searchText); // name

      // TypeDoc may set this variable for debugging.
      if (globalThis?.DEBUG_SEARCH_WEIGHTS) { name += ` (score: ${indexResult.score.toFixed(2)})`; }

      if (row.p) // parent
      {
         name = `<span class="parent">${boldMatches(
          row.p,
          searchText
         )}.</span>${name}`;
      }

      processedDocuments.push({
         id: index,
         kind: row.k,
         classes: row.c ?? '', // classes
         href: `${globalThis.dmtOptions.basePath}${row.u}`, // URL
         name
      });
   }

   return processedDocuments;
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
 * @returns {string} Escaped text.
 */
function escapeHtml(text)
{
   return text.replace(/[&<>"']/g, (match) => SPECIAL_HTML[match]);
}

/**
 * @typedef {object} ProcessedSearchDocument Provides parsed presentation data for a SearchDocument found in a query.
 *
 * @property {number}   id A unique ID.
 *
 * @property {import('typedoc').ReflectionKind} kind The reflection kind.
 *
 * @property {string}   classes Any particular classes to apply regarding properties like private / inherited, etc.
 *
 * @property {string}   href The document link.
 *
 * @property {string}   name The document name HTML content.
 */