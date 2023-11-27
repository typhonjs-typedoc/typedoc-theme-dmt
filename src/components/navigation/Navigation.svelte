<script>
   import { setContext }         from 'svelte';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';

   import { NavigationData }     from './NavigationData.js';

   /** @type {import('./types').DMTNavigationElement[]} */
   export let navigationIndex = [];

   const navigationData = new NavigationData(navigationIndex);

   setContext('#navigationData', navigationData);

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis?.dmtOptions?.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;
</script>

<svelte:window on:hashchange={navigationData.state.onHashchange} />

<div class=dmt-navigation-content>
   {#each navigationData.index as entry (entry.path)}
      {#if Array.isArray(entry.children)}
         <Folder {entry} removeIcon={removeTopLevelIcon} />
      {:else}
         <Entry {entry} />
      {/if}
   {/each}
</div>

<style>
   .dmt-navigation-content {
      display: flex;
      flex-direction: column;

      --tjs-folder-summary-font-weight: normal;
      --tjs-folder-summary-font-size: 1em;
      --tjs-folder-summary-margin: 0;
      --tjs-folder-summary-padding: 0;
      --tjs-folder-summary-width: 100%;
   }
</style>
