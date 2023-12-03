<script>
   import {
      getContext,
      onMount,
      setContext }               from 'svelte';

   import { writable }           from 'svelte/store';

   import { slideFade }          from '#runtime/svelte/transition';

   import SearchResults          from './SearchResults.svelte';

   import { processSearchQuery } from './processSearchQuery.js';

   /**
    * Stores the current selected ID for navigating search query results in {@link SearchResults}.
    *
    * @type {Writable<number|undefined>}
    */
   const storeCurrentId = writable(void 0);

   setContext('#currentId', storeCurrentId);

   /** @type {Writable<boolean>} */
   const storeVisible = getContext('#visible');

   /**
    * Stores the input query string from the main search input element.
    *
    * @type {Writable<string>}
    */
   const storeQuery = writable('');

   let currentIndex = 0;

   /** @type {HTMLInputElement} */
   let inputEl;

   /** @type {ProcessedSearchDocument[]} */
   let results;

   /**
    * Bound from {@link SearchResults} to check for window pointer down events outside input & results elements.
    *
    * @type {HTMLUListElement}
    */
   let resultsEl;

   // Focus input element on mount.
   onMount(() => inputEl.focus());

   $: {
      results = processSearchQuery($storeQuery);
      currentIndex = -1;
      storeCurrentId.set(void 0);
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
            if (results.length === 0) { return; }

            if (currentIndex < results.length - 1)
            {
               storeCurrentId.set(results[++currentIndex].id);
               event.preventDefault();
            }
            break;

         case 'ArrowUp':
            if (results.length === 0) { return; }

            if (currentIndex > 0)
            {
               storeCurrentId.set(results[--currentIndex].id);
               event.preventDefault();
            }
            break;

         case 'Enter':
            if (currentIndex >= 0)
            {
               window.location.href = results[currentIndex].href;
            }
            event.preventDefault();
            break;

         case 'Escape':
            if ($storeVisible) { $storeVisible = false; }
            break;

         case 'Tab':
            if (results.length === 0) { event.preventDefault(); return; }

            if (event.shiftKey)
            {
               if (currentIndex > 0) { storeCurrentId.set(results[--currentIndex].id); }
            }
            else if (currentIndex < results.length - 1)
            {
               storeCurrentId.set(results[++currentIndex].id);
            }
            event.preventDefault();
            break;
      }

      // Prevents global key commands from activating when main search is active.
      event.stopPropagation();
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

      /* Override styles from default theme */
      top: 0;
      padding: 0;
      opacity: 1;
      border: revert;
      background: revert;
   }
</style>
