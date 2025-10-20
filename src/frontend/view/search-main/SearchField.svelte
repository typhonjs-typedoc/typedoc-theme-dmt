<script>
   import {
      getContext,
      onMount,
      setContext }                     from 'svelte';

   import { writable }                 from 'svelte/store';

   import { slideFade }                from '#runtime/svelte/transition';
   import { Timing }                   from '#runtime/util'

   import SearchResults                from './SearchResults.svelte';

   import { processMainSearchQuery }   from '#frontend/state';

   /**
    * Stores the current selected ID for navigating search query results in {@link SearchResults}.
    *
    * @type {import('svelte/store').Writable<number|undefined>}
    */
   const storeCurrentId = writable(void 0);

   setContext('#storeCurrentId', storeCurrentId);

   const {
      basePath,
      showModuleIcon,
      searchOptions,
      settingStores,
      stateStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeSearchVisible = stateStores.mainSearchVisible;
   const storeThemeAnimate = settingStores.themeAnimate;

   /** @type {boolean} */
   const searchFullName = searchOptions?.fullName ?? false;

   /** @type {number} */
   const searchLimit = searchOptions?.limit ?? 10;

   /**
    * Stores the input query string from the main search input element.
    *
    * @type {import('svelte/store').Writable<string>}
    */
   const storeQuery = writable('');

   const animateTransition = $storeThemeAnimate ? slideFade : () => void 0;

   // When the query string has some input, but results are empty use `invalidQuery` to apply an inline color of red.
   let invalidQuery = false;

   // Debounce queries by 250ms.
   const debouncedSearchQuery = Timing.debounce((query, options) =>
   {
      results = processMainSearchQuery(query, options);

      invalidQuery = query.length && !results?.length;

      // When results change reset current index / ID.
      if (results?.length)
      {
         currentIndex = -1;
         storeCurrentId.set(void 0);
      }
   }, 250);

   const queryOptions = {
      basePath,
      showModuleIcon,
      searchFullName,
      searchLimit
   }

   let currentIndex = 0;

   /** @type {HTMLInputElement} */
   let inputEl;

   /** @type {ProcessedSearchDocument[]} */
   let results = [];

   /**
    * Bound from {@link SearchResults} to check for window pointer down events outside input & results elements.
    *
    * @type {HTMLUListElement}
    */
   let resultsEl;

   // Focus input element on mount.
   onMount(() => inputEl.focus());

   // Runs a 250ms debounced query updating `results`.
   $: debouncedSearchQuery($storeQuery, { ...queryOptions });

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

            if (currentIndex < results.length - 1) { storeCurrentId.set(results[++currentIndex].id); }
            event.preventDefault();
            break;

         case 'ArrowUp':
            if (results.length === 0) { return; }

            if (currentIndex > 0) { storeCurrentId.set(results[--currentIndex].id); }
            event.preventDefault();
            break;

         case 'Enter':
            if (currentIndex >= 0)
            {
               window.location.href = results[currentIndex].href;
            }
            event.preventDefault();
            break;

         case 'Escape':
            // Only set visibility to false when the query is empty.
            if ($storeSearchVisible && !$storeQuery.length) { $storeSearchVisible = false; }
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
      if (event.target !== inputEl && !resultsEl?.contains?.(event.target)) { $storeSearchVisible = false; }
   }
</script>

<svelte:window on:pointerdown={handlePointerdown} on:blur={() => $storeSearchVisible = false} />

<div id=dmt-search-field
     transition:animateTransition={{ axis: 'x', duration: 120 }}>
   <input bind:this={inputEl}
          bind:value={$storeQuery}
          style:color={invalidQuery ? 'red' : null}
          style:border-color={invalidQuery ? 'red' : null}
          type=search
          aria-label=Search
          on:keydown={handleKeydown}
          autocomplete=off />

   {#if results.length}
      <SearchResults {results} bind:resultsEl />
   {/if}
</div>


<style lang=scss>
   /* Provide a global override for non-specific default theme CSS. */
   #dmt-search-field {
      // Offset for absolute positioning of search input element for search button.
      --dmt-search-offset: 50px;

      position: absolute;
      display: flex;
      flex-direction: column;
      z-index: 10;

      right: 40px;
      top: 3px;

      width: calc(100vw - 1rem - var(--dmt-search-offset));
      box-sizing: border-box;
   }

   /* Provide a global override for non-specific default theme CSS. */
   input {
      height: 35px;
      padding-left: 0.5rem;
      width: 100%;

      border: 1px solid var(--color-accent);
      border-radius: 0.5em;
      box-sizing: border-box;
      color: var(--color-text);
      font-size: 16px; /* For Safari / iOS to prevent zooming into input */
      outline: 2px solid transparent;
   }

   @media (max-width: 769px) {
      #dmt-search-field {
         // Offset for absolute positioning of search input element for search button + mobile overflow button.
         --dmt-search-offset: 80px;
      }
   }
</style>
