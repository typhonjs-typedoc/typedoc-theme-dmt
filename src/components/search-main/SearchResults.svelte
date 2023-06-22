<script>
   import { getContext }   from 'svelte';

   import { slideFade }    from '../transition/slideFade.js';

   /** @type {ProcessedSearchDocument[]} */
   export let results = void 0;

   /** @type {HTMLUListElement} */
   export let resultsEl = void 0;

   /** @type {Writable<number>} */
   const storeCurrentId = getContext('#currentId');

   /** @type {Writable<boolean>} */
   const storeVisible = getContext('#visible');
</script>

<ul bind:this={resultsEl} transition:slideFade={{ duration: 100 }}>
{#each results as result (result.id)}
   <li class="{result.classes}" class:selected={result.id === $storeCurrentId}>
      <a href="{result.href}" on:click={() => $storeVisible = false}>
         <span class=parent>{@html result.name}</span>
      </a>
   </li>
{/each}
</ul>

<style>
   a {
      display: block;
   }

   li {
      padding: 0 10px;
      background-color: var(--color-background);
      text-overflow: ellipsis;
      overflow: hidden;
      transition: background 0.15s ease-in-out;
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