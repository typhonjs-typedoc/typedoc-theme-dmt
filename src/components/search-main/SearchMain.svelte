<script>
   import { setContext }   from 'svelte';
   import { writable }     from 'svelte/store';

   import SearchButton     from './SearchButton.svelte';
   import SearchField      from './SearchField.svelte';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeVisible = writable(false);

   setContext('#storeVisible', storeVisible)
   setContext('#storeSettingAnimate', dmtComponentData.dmtLocalStorage.getStore('docs-dmt-animate'));

   /**
    * Open search when <Alt-s> is pressed.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeydown(event)
   {
      switch (event.code)
      {
         case 'KeyS':
            if (event.altKey) { $storeVisible = true; }
            break;
      }
   }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $storeVisible}
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
