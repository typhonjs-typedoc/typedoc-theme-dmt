import Component        from 'svelte-tag';

import NavigationSite   from './NavigationSite.svelte';
import WrapTest         from './WrapTest.svelte';

// Currently in Svelte v3 there is no standard way to create a Svelte based web component that doesn't use the shadow
// DOM. `svelte-tag` provides a workaround. This allows the Svelte components specified below to be loaded as custom
// elements and remain in the main document flow allowing styles and interactivity loaded from the `main.js` to take
// effect. The good news is that Svelte v4 coming soon solves this issue!

new Component({
   component: NavigationSite,
   tagname: 'wc-dmt-nav',
   attributes:['url'],
   shadow: false
});

new Component({
   component: WrapTest,
   tagname: 'wc-dmt-wrap',
   shadow: false
});

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   // Dynamically load main script now as it will reach the elements loaded by the web components.
   await import('./main.js');

   // Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
   // transition for the `main.js` default template script to take effect along with loading web components before
   // the page is initially visible. There is no flicker as this is handled by a rAF callback.
   globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);
});