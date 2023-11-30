<script>
   import {
      setContext,
      tick }                  from 'svelte';

   import Entry               from './Entry.svelte';
   import Folder              from './Folder.svelte';
   import NavigationBar       from './NavigationBar.svelte';
   import SidebarLinks        from './SidebarLinks.svelte';

   import { NavigationData }  from './NavigationData.js';

   /** @type {import('./types').DMTNavigationElement[]} */
   export let navigationIndex = [];

   /** @type {Record<string, string>} */
   export let sidebarLinks = void 0;

   /**
    * Exposes `ensureCurrentPath` externally to the component.
    *
    * @param {object} [options] - Optional parameters.
    *
    * @param {boolean}  [focus=false] - Focus current path anchor element.
    */
   export function ensureCurrentPath({ focus = false } = {})
   {
      const currentPathURL = navigationData.currentPathURL;
      const result = navigationData.state.ensureCurrentPath(navigationData.currentPathURL);

      if (result && focus)
      {
         tick().then(() => navigationEl.querySelector(`a[href*="${currentPathURL}"]`)?.focus({ focusVisible: true }));
      }

      return result;
   }

   const navigationData = new NavigationData(navigationIndex);

   setContext('#navigationData', navigationData);

   const topLevelNodesStore = navigationData.topLevelNodesStore;

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis?.dmtOptions?.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;

   let navigationEl;
</script>

<svelte:options accessors={true}/>
<svelte:window on:hashchange={navigationData.state.onHashchange} />

{#if typeof sidebarLinks === 'object'}
   <SidebarLinks {sidebarLinks} />
{/if}

{#if $topLevelNodesStore > 1 && globalThis.dmtOptions.navControls}
   <NavigationBar />
{/if}

<div bind:this={navigationEl} class=dmt-navigation-content>
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

      padding-top: 0.25rem;
      touch-action: pan-y;
   }
</style>
