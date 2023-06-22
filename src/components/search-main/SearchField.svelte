<script>
   import {
      getContext,
      onMount }                  from 'svelte';

   import { writable }           from 'svelte/store';

   import SearchResults          from './SearchResults.svelte';

   import { processSearchQuery } from './processSearchQuery.js';

   import { slideFade }          from '../transition/slideFade.js';

   /** @type {Writable<boolean>} */
   const storeVisible = getContext('#visible');

   /**
    * Stores the input query string from the main search input element.
    *
    * @type {Writable<string>}
    */
   const storeQuery = writable('');

   /**
    * Stores the current selected ID for navigating search query results in {@link SearchResults}.
    *
    * @type {Writable<number|undefined>}
    */
   const storeCurrentId = writable(void 0);

   /** @type {HTMLInputElement} */
   let inputEl;

   /** @type {ProcessedSearchDocument[]} */
   let results;

   /** @type {HTMLUListElement} */
   let resultsEl;

   onMount(() => inputEl.focus());

   $: {
      results = processSearchQuery($storeQuery);
   }

   /**
    * Detects navigation input modifying current selected ID.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeydown(event)
   {
      switch (event.code)
      {
         case 'ArrowDown':
            break;

         case 'ArrowUp':
            break;

         case 'Tab':
            break;
      }
   }

   /**
    * Handles browser window pointer down events; setting the search query UI not visible if the target is outside the
    * search query UI.
    *
    * @param {PointerEvent}   event -
    */
   function handlePointerdown(event)
   {
      if (event.target !== inputEl && !resultsEl?.contains?.(event.target)) { $storeVisible = false; }
   }
</script>

<svelte:window on:pointerdown={handlePointerdown} />

<input bind:this={inputEl}
       bind:value={$storeQuery}
       type=search
       id=dmt-search-field
       aria-label=Search
       on:keydown={handleKeydown}
       transition:slideFade={{ duration: 200 }}
>
{#if results.length}
   <SearchResults {results} bind:resultsEl />
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