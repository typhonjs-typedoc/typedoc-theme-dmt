<script>
   import {
      onDestroy,
      onMount,
      setContext }      from 'svelte';

   import { writable }  from 'svelte/store';

   import SearchButton  from './SearchButton.svelte';
   import SearchField   from './SearchField.svelte';

   const storeVisible = writable(false);

   setContext('#visible', storeVisible)

   onDestroy(() =>
   {
   });

   onMount(() =>
   {
   });

   /**
    * Open search when <Alt-s> is pressed.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeydown(event)
   {
      switch (event.code)
      {
         case 'Escape':
            if ($storeVisible) { $storeVisible = false; }
            break;

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
<label for=dmt-search-field class="dmt-widget dmt-toolbar-icon search no-caption">
   <SearchButton />
</label>

<style>
   label {
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


   /*#tsd-search .field input, #tsd-search .title, #tsd-toolbar-links a {*/
   /*   transition: opacity 0.2s;*/
   /*}*/

   /*input {*/
   /*   box-sizing: border-box;*/
   /*   position: relative;*/
   /*   top: -50px;*/
   /*   z-index: 1;*/
   /*   width: 100%;*/
   /*   padding: 0 10px;*/
   /*   opacity: 0;*/
   /*   outline: 0;*/
   /*   border: 0;*/
   /*   background: transparent;*/
   /*   color: var(--color-text);*/
   /*}*/
</style>
