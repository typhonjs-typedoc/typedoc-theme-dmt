<script>
   import { getContext }   from 'svelte';

   import NavigationTree   from '../tree/NavigationTree.svelte';
   import TJSSvgFolder     from '../../external/TJSSvgFolder.svelte';

   const {
      dmtSessionStorage,
      navigation,
      settingStores,
      storagePrepend } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeThemeAnimate = settingStores.themeAnimate;

   const store = dmtSessionStorage.getStore(`${storagePrepend}-document-index`, true);

   // If the active tree is the markdown tree then ensure that the document index is open.
   if (navigation.treeState.activeTreeName === 'markdown') { $store = true; }

   const folder = {
      store,
      label: 'Document Index',
      options: { focusChevron: true }
   }
</script>

{#if navigation.treeState.markdown.hasData}
   <section class=dmt-document-index>
      <TJSSvgFolder {folder} animate={$storeThemeAnimate}>
         <hr>
         <NavigationTree treeState={navigation.treeState.markdown} />
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
      --tjs-folder-summary-margin: 0 0.25rem;
      --tjs-folder-summary-width: 100%;

      background: var(--dmt-container-background);
      border: var(--dmt-container-border);
      border-radius: var(--dmt-container-border-radius);
      box-shadow: var(--dmt-container-box-shadow);
      margin: 0 1rem 0 0;
      padding-bottom: 0.25rem;
   }
</style>
