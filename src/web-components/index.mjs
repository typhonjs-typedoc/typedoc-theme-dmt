import './WrapTest.svelte';

// Removes the `opacity: 0` inline style on `body` element after all scripts have loaded. This allows a smooth
// transition for the `main.js` default template script to take effect along with loading web components before
// the page is initially visible.
globalThis.document.addEventListener('DOMContentLoaded', () =>
{
   globalThis.requestAnimationFrame(() => globalThis.document.querySelector('body').style = null);
});