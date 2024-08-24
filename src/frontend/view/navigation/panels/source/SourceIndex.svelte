<script>
   import { getContext } from 'svelte';

   import NavigationBar  from './NavigationBar.svelte';
   import NavigationTree from '../../tree/NavigationTree.svelte';

   const { navigation } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');
</script>

<section class=source-index>
   <NavigationBar />
   <NavigationTree treeState={navigation.treeState.source} />
</section>

<style>
   section {
       /* This allows the bottom most element in the tree to be visible above browser URL hint. */
      --dmt-nav-tree-bottom-margin: 1rem;
   }
</style>
