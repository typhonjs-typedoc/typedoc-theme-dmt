import SearchMain                from './search-main/SearchMain.svelte';
import SearchQuick               from './search-quick/SearchQuick.svelte';

import { loadMainSearchData }    from './search-main/loadMainSearchData.js';
import { loadQuickSearchData }   from './search-quick/loadQuickSearchData.js';

import { scrollActivation }      from './scrollActivation.js';

// Loads the Navigation web component.
import './dmt-nav-web-component.js';

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   // Only load main search index if enabled.
   if (globalThis?.dmtOptions?.search)
   {
      loadMainSearchData().then((result) =>
      {
         if (result) { new SearchMain({ target: document.querySelector('#dmt-search-main') }); }
      });
   }

   // Only load quick search index if enabled.
   if (globalThis?.dmtOptions?.searchQuick)
   {
      loadQuickSearchData().then((result) =>
      {
         if (result)
         { new SearchQuick({target: globalThis.document.body}); }
      });
   }

   // Provide automatic focusing of DMT scrollable containers on `pointerover` when there is no explicitly focused
   // element allowing intuitive scrolling.
   scrollActivation();

   // Dynamically load main script now as it will reach the elements loaded by any web components.
   await import('../main.js');

   // Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
   // transition for the `main.js` default template script to take effect along with loading web components before
   // the page is initially visible. There is no flicker as this is handled by a rAF callback.
   globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);
});