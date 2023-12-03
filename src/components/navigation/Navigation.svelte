<script>
   import { setContext }         from 'svelte';

   import { nextAnimationFrame } from '#runtime/util/animate';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';
   import NavigationBar          from './NavigationBar.svelte';
   import SidebarLinks           from './SidebarLinks.svelte';

   import { NavigationData }     from './NavigationData.js';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   /** @type {import('./types').DMTNavigationElement[]} */
   const navigationIndex = dmtComponentData?.navigationIndex;

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
         // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
         nextAnimationFrame().then(
          () => navigationEl.querySelector(`a[href*="${currentPathURL}"]`)?.focus({ focusVisible: true }));
      }

      return result;
   }

   const navigationData = new NavigationData(navigationIndex);

   setContext('#navigationData', navigationData);

   const {
      currentPathURLStore,
      topLevelNodesStore } = navigationData;

   // Determine if the top level icon for namespace / module folders is removed.
   const removeIcon = typeof globalThis?.dmtOptions?.navTopModuleRemoveIcon === 'boolean' ?
    globalThis.dmtOptions.navTopModuleRemoveIcon : false;

   let navigationEl;

   $: if ($currentPathURLStore)
   {
      // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
      nextAnimationFrame().then(() =>
      {
         const targetEl = navigationEl.querySelector(`a[href*="${navigationData.currentPathURL}"]`);
         if (targetEl) { targetEl.scrollIntoView({ block: 'center', inline: 'center' }); }
      });
   }

   // Always indent first level entries to match any module / namespace entries w/ children.
   const indentIcon = 'indent-no-icon';
</script>

<svelte:options accessors={true}/>
<svelte:window on:hashchange={navigationData.state.onHashchange} />

<SidebarLinks {dmtComponentData} />

{#if $topLevelNodesStore > 1 && globalThis.dmtOptions.navControls}
   <NavigationBar />
{/if}

<div bind:this={navigationEl} class=dmt-navigation-content tabindex=-1>
   {#each navigationData.index as entry (entry.path)}
      {#if Array.isArray(entry.children)}
         <Folder {entry} {removeIcon} />
      {:else}
         <!-- Potentially remove icons when entry.kind is `module` or `namespace` -->
         <Entry {entry} {indentIcon} removeIcon={removeIcon && (entry?.kind === 2 || entry?.kind === 4)} />
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

      --tjs-folder-contents-margin: var(--dmt-nav-folder-contents-margin, 0 0 0 7px);
      --tjs-folder-contents-border-left: var(--dmt-nav-folder-contents-border-left, 2px solid rgba(0, 0, 0, 0.2));
      --tjs-folder-contents-padding: var(--dmt-nav-folder-contents-padding, 0 0 0 9px);

      outline: transparent;
      overflow-x: auto;
      padding-top: 0.25rem;
      touch-action: pan-x pan-y;
   }

   /* This allows the bottom most element in the nav bar to be visible above browser URL hint. */
   .dmt-navigation-content > :global(:last-child) {
      padding-bottom: 1rem;
   }
</style>
