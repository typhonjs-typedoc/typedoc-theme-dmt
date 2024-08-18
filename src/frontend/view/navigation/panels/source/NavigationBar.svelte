<script>
   import { getContext }   from 'svelte';

   import HelpPanel        from './HelpPanel.svelte';

   /** @type {DMTComponentData} */
   const dmtComponentData = getContext('#dmtComponentData');

   /** @type {NavigationData} */
   const navigationData = getContext('#dmtNavigationData');

   const {
      hasModulesIndex,
      moduleIsPackage } = dmtComponentData;

   const hasFolders = navigationData.treeState.source.hasFolders;

   const storeHelpPanelOpen = navigationData.storeHelpPanelOpen;

   const moduleIndexLabel = moduleIsPackage ? 'Package Index' : 'Module Index';

   $: helpTitle = $storeHelpPanelOpen ? 'Close Help' : 'Open Help';

   /**
    * Stops repeat on "Enter" key.
    *
    * @param {KeyboardEvent}  event - Keyboard Event.
    */
   function onKeydownRepeat(event)
   {
      if (event.repeat)
      {
         event.stopPropagation();
         event.preventDefault();
      }
   }
</script>

<section>
   {#if hasFolders > 0}
      <svg style="display: none;">
         <symbol id=dmt-double-icon-arrow viewBox="0 0 1024 1024">
            <path d="M517.408 993.568l-0.448 0.256c-18.592-0.032-37.152-7.168-51.328-21.344L51.392 558.24c-27.904-27.904-28.32-74.624 0.224-103.2 28.768-28.768 74.784-28.672 103.2-0.224l362.272 362.272L879.36 454.816c27.904-27.904 74.624-28.32 103.2 0.224 28.768 28.768 28.672 74.784 0.224 103.2l-414.24 414.24c-13.92 13.92-32.512 20.992-51.2 21.056z m0-397.408l-0.448 0.256c-18.592-0.032-37.152-7.168-51.328-21.344l-414.24-414.24c-27.904-27.904-28.32-74.624 0.224-103.2 28.768-28.768 74.784-28.672 103.2-0.224L517.088 419.68 879.36 57.408c27.904-27.904 74.624-28.32 103.2 0.224 28.768 28.768 28.672 74.784 0.224 103.2l-414.24 414.24c-13.92 13.92-32.512 20.992-51.2 21.056z" />
         </symbol>
      </svg>

      <button on:click={() => navigationData.treeState.source.setFoldersAllOpen(true)}
              on:keydown={onKeydownRepeat}
              on:pointerdown|stopPropagation
              title={'Open All'}>
         <svg>
            <use xlink:href="#dmt-double-icon-arrow"></use>
         </svg>
      </button>

      <button on:click={() => navigationData.treeState.source.setFoldersAllOpen(false)}
              on:keydown={onKeydownRepeat}
              on:pointerdown|stopPropagation
              title={'Close All'}>
         <svg class=flipped-vertical>
            <use xlink:href="#dmt-double-icon-arrow"></use>
         </svg>
      </button>
   {/if}

   <button on:click={() => navigationData.swapHelpPanelOpen()}
           on:keydown={onKeydownRepeat}
           title={helpTitle}>
      <svg viewBox="0 0 973.1 973.1">
         <g>
            <path d="M502.29,788.199h-47c-33.1,0-60,26.9-60,60v64.9c0,33.1,26.9,60,60,60h47c33.101,0,60-26.9,60-60v-64.9 C562.29,815,535.391,788.199,502.29,788.199z"/>
            <path d="M170.89,285.8l86.7,10.8c27.5,3.4,53.6-12.4,63.5-38.3c12.5-32.7,29.9-58.5,52.2-77.3c31.601-26.6,70.9-40,117.9-40
                     c48.7,0,87.5,12.8,116.3,38.3c28.8,25.6,43.1,56.2,43.1,92.1c0,25.8-8.1,49.4-24.3,70.8c-10.5,13.6-42.8,42.2-96.7,85.9
                     c-54,43.7-89.899,83.099-107.899,118.099c-18.4,35.801-24.8,75.5-26.4,115.301c-1.399,34.1,25.8,62.5,60,62.5h49
                     c31.2,0,57-23.9,59.8-54.9c2-22.299,5.7-39.199,11.301-50.699c9.399-19.701,33.699-45.701,72.699-78.1
                     C723.59,477.8,772.79,428.4,795.891,392c23-36.3,34.6-74.8,34.6-115.5c0-73.5-31.3-138-94-193.4c-62.6-55.4-147-83.1-253-83.1
                     c-100.8,0-182.1,27.3-244.1,82c-52.8,46.6-84.9,101.8-96.2,165.5C139.69,266.1,152.39,283.5,170.89,285.8z"/>
         </g>
      </svg>
   </button>

   {#if hasModulesIndex}
      <a href={`${navigationData.baseURL}modules.html`} class:current={navigationData.treeState.currentPathURL === 'modules.html'}>
         {moduleIndexLabel}
      </a>
   {/if}

   {#if $storeHelpPanelOpen}
      <HelpPanel {hasModulesIndex} {moduleIsPackage} {hasFolders} />
   {/if}
</section>

<style>
   a:not(:first-child) {
      margin-left: 0.5rem;
      width: fit-content;
      white-space: nowrap;
   }

   button {
      width: 2rem;
      height: 2rem;

      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      line-height: 0;
   }

   section {
      display: flex;
      position: sticky;
      top: 0;
      z-index: 10;

      align-items: center;
      gap: 0.5em;
      padding: 0.25rem 0.25rem;
      height: fit-content;
      width: inherit;
      background: var(--color-background);
      border-bottom: var(--dmt-container-border);
   }

   svg {
      width: 1rem;
      height: 1rem;
      fill: currentColor;
      overflow: hidden;
   }

   .flipped-vertical {
      transform: scale(1, -1);
   }
</style>
