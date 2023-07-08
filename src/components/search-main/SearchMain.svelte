<script>
   import { setContext }   from 'svelte';

   import { writable }     from 'svelte/store';

   import SearchButton     from './SearchButton.svelte';
   import SearchField      from './SearchField.svelte';

   /** @type {Writable<boolean>} */
   const storeVisible = writable(false);

   setContext('#visible', storeVisible)

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
      overflow: hidden;
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
