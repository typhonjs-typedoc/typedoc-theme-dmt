<script>
   import {
      getContext,
      onMount }         from 'svelte';

   import { slideFade } from '../transition/slideFade.js';

   const storeVisible = getContext('#visible');

   let inputEl;

   onMount(() =>
   {
      inputEl.focus();
   });

   /**
    * @param {PointerEvent}   event -
    */
   function handlePointerdown(event)
   {
      if (event.target !== inputEl) { $storeVisible = false; }
   }
</script>

<svelte:window on:pointerdown={handlePointerdown} />

<input bind:this={inputEl}
       type=text
       id=dmt-search-field
       aria-label=Search
       transition:slideFade={{ duration: 200 }}
>

<style>
   #dmt-search-field {
      box-sizing: border-box;
      position: relative;
      z-index: 10;
      width: 100%;
      height: 35px;
      outline: 0;
      right: 4px;
      color: var(--color-text);
   }
</style>