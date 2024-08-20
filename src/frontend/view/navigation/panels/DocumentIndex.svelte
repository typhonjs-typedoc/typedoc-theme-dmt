<script>
   import { getContext }   from 'svelte';

   import NavigationTree   from '../tree/NavigationTree.svelte';
   import TJSSvgFolder     from '../../external/TJSSvgFolder.svelte';

   const { storagePrepend } = getContext('#dmtComponentData');

   /** @type {NavigationData} */
   const navigationData = getContext('#dmtNavigationData');

   /** @type {import('#runtime/svelte/store/web-storage').TJSWebStorage} */
   const storage = getContext('#dmtSessionStorage');

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeSettingAnimate = getContext('#dmtStoreSettingAnimate');

   const store = storage.getStore(`${storagePrepend}-document-index`, false);

   // If the active tree is the markdown tree then ensure that the document index is open.
   if (navigationData.treeState.activeTreeName === 'markdown') { $store = true; }

   const folder = {
      store,
      label: 'Document Index',
      options: { focusChevron: true }
   }
</script>

{#if navigationData.treeState.markdown.hasData}
   <section>
      <TJSSvgFolder {folder} animate={$storeSettingAnimate}>
         <hr>
         <NavigationTree treeState={navigationData.treeState.markdown} />
      </TJSSvgFolder>
   </section>
{/if}

<style>
   hr {
      border-top: unset;
      border-left: unset;
      border-right: unset;
      border-bottom: var(--dmt-container-border);
      margin: 0.25rem 0.5rem 0 0;
   }

   section {
      --dmt-nav-tree-padding-left: 0;
      --tjs-folder-summary-margin: 0 0.25rem;
      --tjs-folder-summary-width: 100%;

      background: var(--dmt-container-background);
      border: var(--dmt-container-border);
      border-radius: var(--dmt-container-border-radius);
      box-shadow: var(--dmt-container-box-shadow);
      margin: 0 1rem 0 0;
   }
</style>
