import { writable }              from 'svelte/store';

import { toggleDetails }         from '#runtime/svelte/action/animate';

import {
   inflateAndUnpack,
   inflateAndUnpackB64 }         from '#runtime/data/format/msgpack/compress';

import Navigation                from './navigation/Navigation.svelte';
import Toolbar                   from './toolbar/Toolbar.svelte';

import SearchMain                from './search-main/SearchMain.svelte';
// import SearchQuick               from './search-quick/SearchQuick.svelte';

import { loadMainSearchData }    from './search-main/loadMainSearchData.js';
// import { loadQuickSearchData }   from './search-quick/loadQuickSearchData.js';

import {
   keyCommands,
   scrollActivation }            from './events/index.js';

// Loads compressed global component data.
import './componentData.js';
import {NavigationData} from "./navigation/NavigationData.js";

// Expose the compression / MessagePack handling functions into the global scope. This reduces any duplication across
// plugins that might work with compressed data.
globalThis.dmtInflateAndUnpack = inflateAndUnpack;
globalThis.dmtInflateAndUnpackB64 = inflateAndUnpackB64;

const dmtComponentData = typeof globalThis.dmtComponentDataBCMP === 'string' ? /** @type {DMTComponentData} */
 globalThis.dmtInflateAndUnpackB64(globalThis.dmtComponentDataBCMP) : {};

// Create navigation data / state.
dmtComponentData.navigationData = new NavigationData(dmtComponentData.navigationIndex);

const navigation = new Navigation({
   target: document.querySelector('nav.tsd-navigation'),
   props: { dmtComponentData }
});

const toolbar = new Toolbar({
   target: document.querySelector('#dmt-toolbar'),
   props: { dmtComponentData }
})

// Stores references to DMT Svelte components.
globalThis.dmtComponents = {
   navigation,
   toolbar
};

// Only load main search index if enabled.
if (globalThis?.dmtOptions?.search)
{
   loadMainSearchData();
   globalThis.dmtComponents.searchMain = new SearchMain({ target: document.querySelector('#dmt-search-main') });
}

// Add WAAPI animation to all default theme details elements.
if (globalThis?.dmtOptions.navAnimate)
{
   const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
    'details.tsd-index-accordion');

   for (const detailEl of detailElList)
   {
      // Add class to provide transition for svg chevron.
      const svgEl = detailEl.querySelector('summary svg');
      if (svgEl) { svgEl.classList.add('dmt-summary-svg'); }

      toggleDetails(detailEl, { store: writable(detailEl.open) });
   }
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
keyCommands(dmtComponentData.navigationData);

// Provide automatic focusing of DMT scrollable containers on `pointerover` when there is no explicitly focused
// element allowing intuitive scrolling.
scrollActivation();

// Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
// transition for the `main.js` default template script to take effect along with loading web components before
// the page is initially visible. There is no flicker as this is handled by a rAF callback.
// globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);

document.querySelector('body').style = null;
