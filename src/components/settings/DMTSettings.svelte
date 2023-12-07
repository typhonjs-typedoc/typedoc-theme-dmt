<script>
   import LabeledCheckbox     from './LabeledCheckbox.svelte';

   import { localConstants }  from '#constants';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   const storeAnimate = dmtComponentData.dmtLocalStorage.getStore(localConstants.dmtThemeAnimate, true);
</script>

<section>
   <LabeledCheckbox store={storeAnimate} label={'Animation'} />
</section>

<style>
   section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.75rem;
   }
</style>
