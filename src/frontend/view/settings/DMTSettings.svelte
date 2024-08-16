<script>
   import { A11yHelper }      from '#runtime/util/browser';

   import LabeledCheckbox     from './LabeledCheckbox.svelte';

   import { localConstants }  from '#constants';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   const storeAnimate = dmtComponentData.dmtLocalStorage.getStore(localConstants.dmtThemeAnimate,
    !A11yHelper.prefersReducedMotion);
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
