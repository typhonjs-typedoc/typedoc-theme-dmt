<script>
   import { getContext }   from 'svelte';

   import { slideFade }    from '#runtime/svelte/transition';

   /** @type {ProcessedSearchDocument[]} */
   export let results = void 0;

   /** @type {HTMLUListElement} */
   export let resultsEl = void 0;

   const { settingStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeThemeAnimate = settingStores.themeAnimate;

   /** @type {import('svelte/store').Writable<number>} */
   const storeCurrentId = getContext('#storeCurrentId');

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeVisible = getContext('#storeVisible');

   const animateTransition = $storeThemeAnimate ? slideFade : () => void 0;

   function onClick(href)
   {
      $storeVisible = false;

      globalThis.location.href = href;
   }
</script>

<ul bind:this={resultsEl} transition:animateTransition|global={{ duration: 100 }}>
{#each results as result (result.id)}
   <!-- svelte-ignore a11y-click-events-have-key-events -->
   <li class={result.classes}
       class:selected={result.id === $storeCurrentId}
       on:click={() => onClick(result.href)}
       role=menuitem>
      {#if result.kind}
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${result.kind}`}></use></svg>
      {/if}
      <span class=parent>{@html result.name}</span>
   </li>
{/each}
</ul>

<style>
   li {
      display: flex;
      gap: 0.25rem;
      align-items: center;
      padding: 0 10px;
      background-color: var(--color-background);
      text-overflow: ellipsis;
      overflow: hidden;
      transition: background 0.15s ease-in-out;
      cursor: pointer;
   }

   li.selected {
      background: var(--dmt-menu-item-background-selected);
   }

   li:hover {
      background: var(--dmt-menu-item-background-hover);
   }

   li:not(:last-child) {
      border-bottom: var(--dmt-container-separator-border);
   }

   li:nth-child(even):not(:hover):not(.selected) {
      background-color: var(--color-background-secondary);
   }

   ul {
      position: absolute;
      top: calc(var(--dmt-header-height) - 2px);
      width: calc(100% - 4px);
      margin: 0 0 0 -4px;
      padding: 0;
      list-style: none;
      box-shadow: var(--dmt-container-floating-box-shadow);
      border: var(--dmt-container-floating-border);
      border-bottom-left-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      overflow: hidden;
   }
</style>
