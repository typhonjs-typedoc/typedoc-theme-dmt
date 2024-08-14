<script>
   import { setContext }         from 'svelte';

   import NavigationBar          from './NavigationBar.svelte';
   import SidebarLinks           from './SidebarLinks.svelte';
   import NavigationTree         from './NavigationTree.svelte';

   import { DetailsAnimation }   from './DetailsAnimation.js';

   import { localConstants }     from '#constants';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   const { navigationData } = dmtComponentData;

   const detailsAnimation = new DetailsAnimation();
   const storeSettingsAnimate = dmtComponentData.dmtLocalStorage.getStore(localConstants.dmtThemeAnimate);

   setContext('#dmtComponentData', dmtComponentData);
   setContext('#storeSettingAnimate', storeSettingsAnimate);

   // Handle setting animation state for default theme detail elements.
   $: detailsAnimation.setEnabled($storeSettingsAnimate);

   function onHashchange(event)
   {
      navigationData.treeStateSource.onHashchange(event);
   }
</script>

<svelte:options accessors={true}/>
<svelte:window on:hashchange={onHashchange} />

<SidebarLinks />

{#if navigationData.treeStateMarkdown.hasData}
   <section>
      <NavigationTree treeState={navigationData.treeStateMarkdown} />
   </section>
{/if}

<NavigationBar />

<NavigationTree treeState={navigationData.treeStateSource} bottomMargin={true} />

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
