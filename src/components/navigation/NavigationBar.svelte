<script>
   import { getContext } from 'svelte';
   import { derived }    from 'svelte/store';

   const { dmtSessionStorage } = /** @type {NavigationData} */ getContext('#navigationData');

   const allSessionStores = [...dmtSessionStorage.stores()];

   // Create a derived store from all session storage stores; on any update reduce all values and set `storeAllOpen`
   // to whether all folders are opened or not. This controls the icon and title in the reactive statements below.
   const storeAllOpen = derived(allSessionStores, (stores, set) =>
    set(!!stores.reduce((previous, current) => previous & current, true)));

   $: title = $storeAllOpen ? 'Close All' : 'Open All';

   /**
    * Reverses all session storage states to close or open all folders.
    */
   function onClick()
   {
      const flippedState = !$storeAllOpen;
      for (const store of dmtSessionStorage.stores()) { store.set(flippedState); }
   }
</script>

<section>
   <button on:click={onClick}
           on:pointerdown|stopPropagation
           class:flipped-vertical={$storeAllOpen}
           title={title}>
      <svg viewBox="0 0 1024 1024">
         <path d="M517.408 993.568l-0.448 0.256c-18.592-0.032-37.152-7.168-51.328-21.344L51.392 558.24c-27.904-27.904-28.32-74.624 0.224-103.2 28.768-28.768 74.784-28.672 103.2-0.224l362.272 362.272L879.36 454.816c27.904-27.904 74.624-28.32 103.2 0.224 28.768 28.768 28.672 74.784 0.224 103.2l-414.24 414.24c-13.92 13.92-32.512 20.992-51.2 21.056z m0-397.408l-0.448 0.256c-18.592-0.032-37.152-7.168-51.328-21.344l-414.24-414.24c-27.904-27.904-28.32-74.624 0.224-103.2 28.768-28.768 74.784-28.672 103.2-0.224L517.088 419.68 879.36 57.408c27.904-27.904 74.624-28.32 103.2 0.224 28.768 28.768 28.672 74.784 0.224 103.2l-414.24 414.24c-13.92 13.92-32.512 20.992-51.2 21.056z" />
      </svg>
   </button>
</section>

<style>
   button {
      width: 2em;
      height: 2em;

      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      line-height: 0;
      padding: 0;
   }

   section {
      display: flex;
      position: sticky;
      top: 0;
      z-index: 10;

      align-items: center;
      gap: 0.5em;
      padding: 0.25em 0.25em;
      height: fit-content;
      width: inherit;
      background: var(--color-background);
      border-bottom: var(--dmt-container-border);
   }

   svg {
      width: 1em;
      height: 1em;
      fill: currentColor;
      overflow: hidden;
   }

   .flipped-vertical {
      transform: scale(1, -1);
   }
</style>