<script>
   import { getContext }   from 'svelte';

   import NavigationBar    from './NavigationBar.svelte';
   import SidebarLinks     from './SidebarLinks.svelte';
   import NavigationTree   from './NavigationTree.svelte';

   /** @type {NavigationData} */
   const navigationData = getContext('#dmtNavigationData');
</script>

<svelte:options accessors={true}/>

<SidebarLinks />

{#if navigationData.treeState.markdown.hasData}
   <section>
      <NavigationTree treeState={navigationData.treeState.markdown} />
   </section>
{/if}

<NavigationBar />

<NavigationTree treeState={navigationData.treeState.source} bottomMargin={true} />

<style>
   section {
      display: flex;
      flex-direction: column;
      gap: 0.25em;

      background: var(--dmt-container-background);
      border: var(--dmt-container-border);
      border-radius: var(--dmt-container-border-radius);
      box-shadow: var(--dmt-container-box-shadow);
      margin: 0.5rem 1rem 0.25rem 0;
   }
</style>
