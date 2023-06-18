import QuickSearch               from './QuickSearch.svelte';

import { loadQuickSearchData }   from './loadQuickSearchData.mjs';

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   await loadQuickSearchData();

   new QuickSearch({
      target: globalThis.document.body,
      intro: true
   });
});