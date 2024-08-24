<script>
   import { getContext }   from 'svelte';

   import SearchButton     from './SearchButton.svelte';
   import SearchField      from './SearchField.svelte';

   const { stateStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeSearchVisible = stateStores.mainSearchVisible;
</script>

{#if $storeSearchVisible}
   <SearchField />
{/if}
<div class="dmt-widget dmt-toolbar-icon search no-caption">
   <SearchButton />
</div>

<style>
   div {
      position: absolute;
      right: -40px;

      box-sizing: border-box;
      line-height: 0;
      padding: 4px 0;
      width: 40px;
   }

   .dmt-widget {
      display: inline-block;
      overflow: hidden;
      opacity: 0.8;
      height: 40px;
      transition: opacity 0.1s, background-color 0.2s;
      vertical-align: bottom;
   }
</style>
