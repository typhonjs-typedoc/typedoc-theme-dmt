<script>
   /**
    * Provides a folder implementation for module / namespaces.
    *
    * Note: Presently, a custom copy of `TJSSvgFolder` is used. When this is switched over to the library version
    * CSS variables for font-weight and width will need to be set.
    */

   import { getContext }   from 'svelte';

   import Entry            from './Entry.svelte';
   import TJSSvgFolder     from '../../external/TJSSvgFolder.svelte';

   /** @type {import('#frontend/types').DMTNavigationElement} */
   export let entry;

   export let parentIcon = false;

   const {
      settingStores,
      showModuleIcon } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const storeThemeAnimate = settingStores.themeAnimate;

   /** @type {TreeState} */
   const treeState = getContext('#treeState');

   const storageKey = entry.storageKey;

   const store = storageKey ? treeState.sessionStorage.getStore(storageKey, false) : void 0;

   const removeIcon = !showModuleIcon && (entry.kind === void 0 || entry.kind === 2);

   const indentIcon = !removeIcon ? 'indent-icon' : 'indent-no-icon';

   const folder = {
      store,
      options: {
         focusChevron: true
      },
      // Dynamically set the folder margin based on whether the parent folder has a svg icon.
      styles: parentIcon ? { '--tjs-folder-details-margin-left': '3.5px' } : void 0
   }

   /**
    * Handle closing all child folders if the `Alt` key is pressed when this folder is closed.
    *
    * @param {{ event: MouseEvent | KeyboardEvent }} data - On close data.
    */
   function onClose(data)
   {
      if (data?.event?.altKey) { treeState.setChildFolderState(entry, false); }
   }

   /**
    * Handle opening all child folders if the `Alt` key is pressed when this folder is opened.
    *
    * @param {{ event: MouseEvent | KeyboardEvent }} data - On open data.
    */
   function onOpen(data)
   {
      if (data?.event?.altKey) { treeState.setChildFolderState(entry, true); }
   }
</script>

<TJSSvgFolder {folder} {onClose} {onOpen} animate={$storeThemeAnimate}>
   <Entry {entry} {removeIcon} {storageKey} slot=label />
   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} parentIcon={!removeIcon} />
      {:else}
         <Entry entry={child} {indentIcon} removeIcon={!showModuleIcon && child?.kind === 2} />
      {/if}
   {/each}
</TJSSvgFolder>
