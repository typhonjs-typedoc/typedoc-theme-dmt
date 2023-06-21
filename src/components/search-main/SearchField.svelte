<script>
   import {
      getContext,
      onMount }                  from 'svelte';

   import { writable }           from 'svelte/store';

   import SearchResults          from './SearchResults.svelte';

   import { processSearchQuery } from './processSearchQuery.js';

   import { slideFade }          from '../transition/slideFade.js';

   const storeVisible = getContext('#visible');
   const storeQuery = writable('');

   let inputEl;

   let results;

   onMount(() => inputEl.focus());

   $: results = processSearchQuery($storeQuery);

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
       bind:value={$storeQuery}
       type=text
       id=dmt-search-field
       aria-label=Search
       transition:slideFade={{ duration: 200 }}
>
{#if results.length}
   <SearchResults {results} />
{/if}

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