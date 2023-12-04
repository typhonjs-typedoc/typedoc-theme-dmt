import {
   inflateAndUnpack,
   inflateAndUnpackB64 }         from '#runtime/data/format/msgpack/compress';

import { DMTLocalStorage }       from './DMTLocalStorage.js';

import Navigation                from './navigation/Navigation.svelte';
import { NavigationData }        from './navigation/NavigationData.js';

import SettingAnimation          from './settings/SettingAnimation.svelte';

import Toolbar                   from './toolbar/Toolbar.svelte';

import SearchMain                from './search-main/SearchMain.svelte';

import { loadMainSearchData }    from './search-main/loadMainSearchData.js';

// TODO: Implement SearchQuick
// import SearchQuick               from './search-quick/SearchQuick.svelte';
// import { loadQuickSearchData }   from './search-quick/loadQuickSearchData.js';

import {
   keyCommands,
   scrollActivation }            from './events/index.js';

// Loads compressed global component data.
import './dmt-component-data.js';

// Expose the compression / MessagePack handling functions into the global scope. This reduces any duplication across
// plugins that might work with compressed data.
globalThis.dmtInflateAndUnpack = inflateAndUnpack;
globalThis.dmtInflateAndUnpackB64 = inflateAndUnpackB64;

const dmtComponentData = /** @type {DMTComponentData} */ (typeof globalThis.dmtComponentDataBCMP === 'string' ?
 globalThis.dmtInflateAndUnpackB64(globalThis.dmtComponentDataBCMP) : {});

// Create navigation data / state.
dmtComponentData.navigationData = new NavigationData(dmtComponentData.navigationIndex);

dmtComponentData.dmtLocalStorage = new DMTLocalStorage();

const settingAnimation = new SettingAnimation({
   target: document.querySelector('.tsd-navigation.settings .tsd-accordion-details'),
   props: { dmtComponentData }
});

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
   navigation,
   settingAnimation,
   toolbar
};

// Only load main search index if enabled.
if (globalThis?.dmtOptions?.search)
{
   loadMainSearchData();
   globalThis.dmtComponents.searchMain = new SearchMain({
      target: document.querySelector('#dmt-search-main'),
      props: { dmtComponentData }
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
keyCommands(dmtComponentData);

// Provide automatic focusing of DMT scrollable containers on `pointerover` when there is no explicitly focused
// element allowing intuitive scrolling.
scrollActivation();

// Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
// transition for the `main.js` default template script to take effect along with loading web components before
// the page is initially visible. There is no flicker as this is handled by a rAF callback.
// globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);

document.querySelector('body').style = null;
