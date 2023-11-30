<script>
   import {
      setContext,
      tick }                  from 'svelte';

   import Entry               from './Entry.svelte';
   import Folder              from './Folder.svelte';
   import NavigationBar       from './NavigationBar.svelte';

   import { NavigationData }  from './NavigationData.js';

   /** @type {import('./types').DMTNavigationElement[]} */
   export let navigationIndex = [];

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

   const hasTreeStore = navigationData.hasTreeStore;

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis?.dmtOptions?.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;

   let navigationEl;
</script>

<svelte:options accessors={true}/>
<svelte:window on:hashchange={navigationData.state.onHashchange} />

<div bind:this={navigationEl} class=dmt-navigation-content>
   {#if $hasTreeStore}
      <NavigationBar />
   {/if}
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

      touch-action: pan-y;
   }
</style>
