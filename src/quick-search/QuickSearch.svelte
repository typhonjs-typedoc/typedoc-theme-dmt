<script>
   import {
      onDestroy,
      onMount }   from 'svelte';

   /** @type {HTMLElement} */
   let dmtNavEl;

   let visible = false;

   /** @type {'nav'|'page'} */
   let currentTab = 'page'

   onDestroy(() =>
   {
      globalThis.document.removeEventListener('keyup', onKeyup)
      dmtNavEl.removeEventListener('pointerenter', onPointerenter);
      dmtNavEl.removeEventListener('pointerleave', onPointerleave);
   });

   onMount(() =>
   {
      globalThis.document.addEventListener('keyup', onKeyup);
      dmtNavEl = globalThis.document.querySelector('wc-dmt-nav');

      dmtNavEl.addEventListener('pointerenter', onPointerenter);
      dmtNavEl.addEventListener('pointerleave', onPointerleave);
   });

   function onKeyup(event)
   {
      if (!visible)
      {
         const focusVisibleEl = globalThis.document.querySelector(':focus-visible');
         currentTab = dmtNavEl.contains(focusVisibleEl) ? 'nav' : 'page';
      }
   }

   function onPointerenter()
   {
      if (!visible) { currentTab = 'nav' }
   }

   function onPointerleave()
   {
      if (!visible) { currentTab = 'page' }
   }

   $: console.log(`! QuickSearch - $currentTab: ${currentTab}`);
</script>

