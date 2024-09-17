<script>
   import { getContext }      from 'svelte';

   import { isWritableStore } from '#runtime/util/store';

   import LabeledCheckbox     from './LabeledCheckbox.svelte';

   const { settingStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');
</script>

{#if isWritableStore(settingStores.themeAnimate)}
   <section>
      <LabeledCheckbox store={settingStores.themeAnimate} label={'Animation'} />
   </section>
{/if}

<style>
   section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 0.75rem;
   }
</style>
