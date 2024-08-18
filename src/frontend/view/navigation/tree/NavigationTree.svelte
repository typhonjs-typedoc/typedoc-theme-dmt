<script>
   import {
      getContext,
      setContext }               from 'svelte';

   import { nextAnimationFrame } from '#runtime/util/animate';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';

   /** @type {TreeState} */
   export let treeState;

   setContext('#treeState', treeState);

   /** @type {NavigationData} */
   const navigationData = getContext('#dmtNavigationData');

   const { storeCurrentPathURL } = navigationData;

   let navigationEl;

   $: if ($storeCurrentPathURL)
   {
      // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
      nextAnimationFrame().then(() =>
      {
         const targetEl = navigationEl.querySelector(`a[href*="${$storeCurrentPathURL}"]`);
         if (targetEl) { targetEl.scrollIntoView({ block: 'center', inline: 'center' }); }
      });
   }

   // Always indent first level entries to match any module / namespace entries w/ children.
   const indentIcon = treeState.hasFolders ? 'indent-no-icon' : 'indent-none';

   /**
    * Prevents the space key from scrolling the tree view; for Chrome.
    *
    * @param {KeyboardEvent} event - Keyboard Event.
    */
   function onKeydown(event)
   {
      if (event.code === 'Space') { event.preventDefault(); }
   }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={navigationEl}
     class=dmt-navigation-content
     on:keydown|capture={onKeydown}
     tabindex=-1>
   {#each treeState.elementIndex as entry (entry.path)}
      {#if Array.isArray(entry.children)}
         <Folder {entry} />
      {:else}
         <!-- Potentially remove icons when entry.kind is `module` with no children -->
         <Entry {entry} {indentIcon} removeIcon={!navigationData.navModuleIcon && entry?.kind === 2} />
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
      --tjs-folder-contents-border-left: var(--dmt-nav-folder-contents-border-left, 2px solid var(--dmt-nav-folder-contents-border-color, rgba(0, 0, 0, 0.2)));
      --tjs-folder-contents-padding: var(--dmt-nav-folder-contents-padding, 0 0 0 9px);

      outline: transparent;
      overflow-x: auto;
      padding-top: var(--dmt-nav-tree-padding-top, 0.25rem);
      padding-left: var(--dmt-nav-tree-padding-left, 3px); /* space for chevron focus-visible outline */
      touch-action: pan-x pan-y;
   }

   /* Adjust `--dmt-nav-tree-bottom-margin` accordingly for any bottom margin after last child. */
   .dmt-navigation-content > :global(:last-child) {
      margin-bottom: var(--dmt-nav-tree-bottom-margin, 0.25rem);
   }
</style>
