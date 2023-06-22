<script>
   import { getContext }   from 'svelte';

   import { slideFade }    from '../transition/slideFade.js';

   /** @type {ProcessedSearchDocument[]} */
   export let results = void 0;

   /** @type {HTMLUListElement} */
   export let resultsEl = void 0;

   /** @type {Writable<boolean>} */
   const storeVisible = getContext('#visible');
</script>

<ul bind:this={resultsEl} transition:slideFade={{ duration: 100 }}>
{#each results as result (result.id)}
   <li class="{result.classes}">
      <a href="{result.href}" on:click={() => $storeVisible = false}>
         <span class=parent>{@html result.name}</span>
      </a>
   </li>
{/each}
</ul>

<style>
   li {
      padding: 0 10px;
      background-color: var(--color-background);
      text-overflow: ellipsis;
      overflow: hidden;
   }

   li:nth-child(even) {
      background-color: var(--color-background-secondary);
   }

   li:not(:last-child) {
      border-bottom: var(--dmt-container-separator-border);
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