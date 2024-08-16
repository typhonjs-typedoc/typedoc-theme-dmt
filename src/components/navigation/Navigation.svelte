<script>
   import { setContext }         from 'svelte';

   import NavigationBar          from './NavigationBar.svelte';
   import SidebarLinks           from './SidebarLinks.svelte';
   import NavigationTree         from './NavigationTree.svelte';

   import { DetailsAnimation }   from './DetailsAnimation.js';

   import { localConstants }     from '#constants';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   /** @type {NavigationData} */
   const { navigationData } = dmtComponentData;

   const { storeCurrentPathURL } = dmtComponentData.navigationData;

   $: console.log(`!!! DMT - Navigation.svelte - storeCurrentPathURL: `, $storeCurrentPathURL)

   const detailsAnimation = new DetailsAnimation();
   const storeSettingsAnimate = dmtComponentData.dmtLocalStorage.getStore(localConstants.dmtThemeAnimate);

   setContext('#dmtComponentData', dmtComponentData);
   setContext('#storeSettingAnimate', storeSettingsAnimate);

   // Handle setting animation state for default theme detail elements.
   $: detailsAnimation.setEnabled($storeSettingsAnimate);
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
