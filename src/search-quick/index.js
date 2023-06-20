import SearchQuick               from './SearchQuick.svelte';

import { loadQuickSearchData }   from './loadQuickSearchData.js';

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   await loadQuickSearchData();

   new SearchQuick({
      target: globalThis.document.body,
      intro: true
   });
});