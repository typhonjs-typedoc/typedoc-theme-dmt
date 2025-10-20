<script>
   import { getContext }   from 'svelte';

   import SearchButton     from './SearchButton.svelte';
   import SearchField      from './SearchField.svelte';

   const { stateStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeSearchVisible = stateStores.mainSearchVisible;
</script>

<div class="dmt-widget dmt-toolbar-icon">
   {#if $storeSearchVisible}
      <SearchField />
   {/if}

   <SearchButton />
</div>

<style>
   div {
      position: relative;

      box-sizing: border-box;
      line-height: 0;
      padding: 4px 0;
   }

   .dmt-widget {
      height: 40px;
      transition: opacity 0.1s, background-color 0.2s;
   }
</style>
