<script>
   /**
    * Manages the toolbar icon links showing a horizontal icon bar when there is enough space otherwise a
    * hamburger button to control icons is displayed.
    *
    * @componentDescription
    */
   import { getContext }   from 'svelte';

   import IconButton       from './IconButton.svelte';
   import IconBar          from './IconBar.svelte';

   const { componentStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   /** @type {import('svelte/store').Writable<number>} */
   const toolbarOffsetWidth = getContext('toolbarOffsetWidth');

   const { toolbarIconLinks } = componentStores;

   let component = IconBar;

   // Pick which component to show based on space available in the toolbar.
   $: if ($toolbarOffsetWidth > 0) {
      // Wait until total icon link width is calculated to swap components.
      if ($toolbarIconLinks.totalWidth > 0)
      {
         component = $toolbarIconLinks.totalWidth > $toolbarOffsetWidth ? IconButton : IconBar;
      }

      // If there is less than 40px space show no component.
      if ($toolbarOffsetWidth < 40) { component = void 0; }
   }
</script>

{#if $toolbarIconLinks.icons.length}
   <svelte:component this={component} />
{/if}

