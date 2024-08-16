<script>
   import { getContext }      from 'svelte';

   import LabeledCheckbox     from './LabeledCheckbox.svelte';

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeAnimate = getContext('#dmtStoreSettingAnimate');
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
