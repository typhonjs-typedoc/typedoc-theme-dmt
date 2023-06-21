import SearchMain             from './SearchMain.svelte';

import { loadMainSearchData } from './loadMainSearchData.js';

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   if (await loadMainSearchData())
   {
      new SearchMain({
         target: document.querySelector('#dmt-search-main'),
         intro: true
      });
   }
});