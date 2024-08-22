import {
   inflateAndUnpack,
   inflateAndUnpackB64 }         from '#runtime/data/format/msgpack/compress';

import { TJSSessionStorage }     from '#runtime/svelte/store/web-storage';

import {
   keyCommands,
   scrollActivation }            from './state/external/events';

import {
   loadMainSearchData,
   // loadQuickSearchData, // TODO: Implement SearchQuick
   DMTLocalStorage,
   NavigationData }              from '#state/frontend';

import {
   DMTSettings,
   Navigation,
   SearchMain,
   // SearchQuick,
   Toolbar }                     from './view';

import { localConstants }        from "#constants";

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

const dmtLocalStorage = new DMTLocalStorage();
const navigationData = new NavigationData(dmtComponentData);

// Mount Svelte components -------------------------------------------------------------------------------------------

// Provides the main context for all Svelte components.
const componentContext = new Map();
componentContext.set('#dmtComponentData', dmtComponentData);
componentContext.set('#dmtLocalStorage', dmtLocalStorage);
componentContext.set('#dmtNavigationData', navigationData);
componentContext.set('#dmtSessionStorage', new TJSSessionStorage());
componentContext.set('#dmtStoreSettingAnimate', dmtLocalStorage.getStore(localConstants.dmtThemeAnimate));

// Must initialize first so that `animate` local storage initially is configured from OS / browser
// `prefersReducedMotion` state.
const dmtSettings = new DMTSettings({
   target: document.querySelector('.tsd-navigation.settings .tsd-accordion-details'),
   context: componentContext
});

// Remove the static sidebar links as DMT navigation includes the links.
const staticSidebarEl = document.querySelector('nav#tsd-sidebar-links');
if (staticSidebarEl) { staticSidebarEl.remove(); }

// Remove all default children from navigation as it is being replaced by the Navigation Svelte component.
const navEl = document.querySelector('nav.tsd-navigation');
if (navEl && navEl.firstChild)
{
   while (navEl.firstChild) { navEl.removeChild(navEl.firstChild); }
}

const navigation = new Navigation({
   target: document.querySelector('nav.tsd-navigation'),
   context: componentContext
});

const toolbar = new Toolbar({
   target: document.querySelector('#dmt-toolbar'),
   context: componentContext
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
      context: componentContext
   });
}

// TODO: Work in progress - Finish `searchQuick` functionality.
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
keyCommands(navigationData);

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

   // Dynamically set CSS variable for the footer element so that scrolling for the details element for `On This Page`
   // can account for the footer height.
   const footerEl = document.querySelector('body main footer');
   if (footerEl)
   {
      document.documentElement.style.setProperty('--dmt-footer-height', `${footerEl.offsetHeight}px`);
   }
});
