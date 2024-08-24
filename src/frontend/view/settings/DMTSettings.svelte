<script>
   import { getContext }      from 'svelte';

   import LabeledCheckbox     from './LabeledCheckbox.svelte';

   const { settingStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeThemeAnimate = settingStores.themeAnimate;
</script>

<section>
   <LabeledCheckbox store={storeThemeAnimate} label={'Animation'} />
</section>

<style>
   section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.75rem;
   }
</style>
