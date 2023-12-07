<script>
   /**
    * Provides a folder implementation for module / namespaces.
    *
    * Note: Presently, a custom copy of `TJSSvgFolder` is used. When this is switched over to the library version
    * CSS variables for font-weight and width will need to be set.
    */

   import { getContext }   from 'svelte';

   import Entry            from './Entry.svelte';
   import TJSSvgFolder     from './TJSSvgFolder.svelte';

   /** @type {import('./types').DMTNavigationElement} */
   export let entry;

   export let parentIcon = false;

   const { dmtSessionStorage } = /** @type {NavigationData} */ getContext('#navigationData');

   const navModuleIcon = getContext('#navModuleIcon');
   const storeSettingAnimate = getContext('#storeSettingAnimate');

   const storageKey = entry.storageKey;

   const store = storageKey ? dmtSessionStorage.getStore(storageKey, false) : void 0;

   const removeIcon = !navModuleIcon && (entry.kind === void 0 || entry.kind === 2);

   const indentIcon = !removeIcon && entry.kind ? 'indent-icon' : 'indent-no-icon';

   const folder = {
      store,
      options: {
         focusChevron: true
      },
      // Dynamically set the folder margin based on whether the parent folder has a svg icon.
      styles: parentIcon ? { '--tjs-folder-details-margin-left': '3.5px' } : void 0
   }

   // Theme animation local storage state.
   $: animate = $storeSettingAnimate;
</script>

<TJSSvgFolder {folder} {animate}>
   <Entry {entry} {removeIcon} {storageKey} slot=label />
   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} parentIcon={!removeIcon} />
      {:else}
         <Entry entry={child} {indentIcon} removeIcon={!navModuleIcon && child?.kind === 2} />
      {/if}
   {/each}
</TJSSvgFolder>
