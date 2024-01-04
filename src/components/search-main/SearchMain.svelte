<script>
   import { setContext }      from 'svelte';
   import { writable }        from 'svelte/store';

   import SearchButton        from './SearchButton.svelte';
   import SearchField         from './SearchField.svelte';

   import { localConstants }  from '#constants';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeVisible = writable(false);

   setContext('#basePath', dmtComponentData.basePath)
   setContext('#navModuleIcon', dmtComponentData.navModuleIcon)
   setContext('#searchFullName', dmtComponentData.search.fullName)
   setContext('#searchLimit', dmtComponentData.search?.limit ?? 10)
   setContext('#storeVisible', storeVisible)
   setContext('#storeSettingAnimate', dmtComponentData.dmtLocalStorage.getStore(localConstants.dmtThemeAnimate));

   /**
    * Open search when <Alt-s> is pressed.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeydown(event)
   {
      if (!event.altKey || event.repeat) { return; }

      switch (event.code)
      {
         case 'KeyS':
            event.preventDefault();
            $storeVisible = true;
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
