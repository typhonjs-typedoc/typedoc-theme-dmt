import {
   inflateAndUnpack,
   inflateAndUnpackB64 }         from '#runtime/data/format/msgpack/compress';

import { TJSLocalStorage }       from '#runtime/svelte/store/web-storage';

import {
   keyCommands,
   scrollActivation }            from './events';

import Navigation                from './navigation/Navigation.svelte';
import { NavigationData }        from './navigation/NavigationData.js';

import DMTSettings               from './settings/DMTSettings.svelte';

import Toolbar                   from './toolbar/Toolbar.svelte';

import SearchMain                from './search-main/SearchMain.svelte';

import { loadMainSearchData }    from './search-main/loadMainSearchData.js';

// TODO: Implement SearchQuick
// import SearchQuick               from './search-quick/SearchQuick.svelte';
// import { loadQuickSearchData }   from './search-quick/loadQuickSearchData.js';

// Loads compressed global component data.
import './dmt-component-data.js';

// Expose the compression / MessagePack handling functions into the global scope. This reduces any duplication across
// plugins that might work with compressed data.
globalThis.dmtInflateAndUnpack = inflateAndUnpack;
globalThis.dmtInflateAndUnpackB64 = inflateAndUnpackB64;

const dmtComponentData = /** @type {DMTComponentData} */ (typeof globalThis.dmtComponentDataBCMP === 'string' ?
 globalThis.dmtInflateAndUnpackB64(globalThis.dmtComponentDataBCMP) : {});

// Setup additional runtime component data ---------------------------------------------------------------------------

dmtComponentData.baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
dmtComponentData.dmtURL = import.meta.url.replace(/dmt-components.js/, '');

dmtComponentData.initialPathURL = globalThis.location.href.replace(dmtComponentData.baseURL, '');

// Find the path URL match without any additional URL fragment.
const depth = (dmtComponentData.initialPathURL.match(/\//) ?? []).length;
dmtComponentData.basePath = '../'.repeat(depth);

// Create navigation data / state.
dmtComponentData.navigationData = new NavigationData(dmtComponentData);

dmtComponentData.dmtLocalStorage = new TJSLocalStorage();

// Mount Svelte components -------------------------------------------------------------------------------------------

// Must initialize first so that `animate` local storage initially is configured from OS / browser
// `prefersReducedMotion` state.
const dmtSettings = new DMTSettings({
   target: document.querySelector('.tsd-navigation.settings .tsd-accordion-details'),
   props: { dmtComponentData }
});

// Remove all default children from navigation as it is being replaced by the Navigation Svelte component.
const navEl = document.querySelector('nav.tsd-navigation');
while (navEl.firstChild) { navEl.removeChild(navEl.firstChild); }

const navigation = new Navigation({
   target: document.querySelector('nav.tsd-navigation'),
   props: { dmtComponentData }
});

const toolbar = new Toolbar({
   target: document.querySelector('#dmt-toolbar'),
   props: { dmtComponentData }
});

// Stores references to DMT Svelte components.
globalThis.dmtComponents = {
   dmtSettings,
   navigation,
   toolbar
};

// Only load main search index if enabled.
if (dmtComponentData.search)
{
   loadMainSearchData();
   globalThis.dmtComponents.searchMain = new SearchMain({
      target: document.querySelector('#dmt-search-main'),
      props: { dmtComponentData }
   });
}

// TODO: Work in progress
// // Only load quick search index if enabled.
// if (dmtComponentData.searchQuick)
// {
//    loadQuickSearchData().then((result) =>
//    {
//       if (result) { new SearchQuick({ target: globalThis.document.body }); }
//    });
// }

// -------------------------------------------------------------------------------------------------------------------

// Provides global keyboard commands.
keyCommands(dmtComponentData);

// Provide automatic focusing of DMT scrollable containers on `pointerover` when there is no explicitly focused
// element allowing intuitive scrolling.
scrollActivation();

// Adds a new style rule to set `body` visibility to `visible` after all scripts have loaded. This allows a smoother
// transition for the `main.js` default template script to take effect along with all Svelte components loaded before
// the page is initially visible. There is minimal flicker.
globalThis.requestAnimationFrame(() =>
{
   const style = document.createElement('style');
   style.innerHTML = 'body { visibility: visible; }';
   document.head.appendChild(style);
});
