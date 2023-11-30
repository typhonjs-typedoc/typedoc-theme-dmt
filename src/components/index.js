import Navigation                from './navigation/Navigation.svelte';

import SearchMain                from './search-main/SearchMain.svelte';
// import SearchQuick               from './search-quick/SearchQuick.svelte';

import { loadMainSearchData }    from './search-main/loadMainSearchData.js';
// import { loadQuickSearchData }   from './search-quick/loadQuickSearchData.js';

import {
   inflateAndUnpack,
   inflateAndUnpackB64 }         from '#runtime/data/format/msgpack/compress';

import {
   keyCommands,
   scrollActivation }            from './events/index.js';

// Loads compressed global component data.
import './componentData.js';

// Expose the compression / MessagePack handling functions into the global scope. This reduces any duplication across
// plugins that might work with compressed data.
globalThis.dmtInflateAndUnpack = inflateAndUnpack;
globalThis.dmtInflateAndUnpackB64 = inflateAndUnpackB64;

/** @type {DMTComponentData} */
const dmtComponentData = typeof globalThis.dmtComponentDataBCMP === 'string' ?
 globalThis.dmtInflateAndUnpackB64(globalThis.dmtComponentDataBCMP) : {};

const navigation = new Navigation({
   target: document.querySelector('nav.tsd-navigation'),
   props: {
      navigationIndex: dmtComponentData?.navigationIndex,
      sidebarLinks: dmtComponentData?.sidebarLinks
   }
});

// Stores references to DMT Svelte components.
globalThis.dmtComponents = {
   navigation
};

// Only load main search index if enabled.
if (globalThis?.dmtOptions?.search)
{
   loadMainSearchData().then((result) =>
   {
      if (result)
      {
         globalThis.dmtComponents.searchMain = new SearchMain({ target: document.querySelector('#dmt-search-main') });
      }
   });
}

// TODO: Work in progress
// // Only load quick search index if enabled.
// if (globalThis?.dmtOptions?.searchQuick)
// {
//    loadQuickSearchData().then((result) =>
//    {
//       if (result) { new SearchQuick({ target: globalThis.document.body }); }
//    });
// }

// Provides global keyboard commands.
keyCommands();

// Provide automatic focusing of DMT scrollable containers on `pointerover` when there is no explicitly focused
// element allowing intuitive scrolling.
scrollActivation();

// Dynamically load main script now as it will reach the elements loaded by any web components.
// await import('../main.js');

// Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
// transition for the `main.js` default template script to take effect along with loading web components before
// the page is initially visible. There is no flicker as this is handled by a rAF callback.
// globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);

document.querySelector('body').style = null;
