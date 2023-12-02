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

   /**
    * Forwarded onto the summary `Entry` to not render the SVG icon for top level modules / namespaces.
    *
    * @type {boolean}
    */
   export let removeIcon = false;

   const { dmtSessionStorage } = /** @type {NavigationData} */ getContext('#navigationData');

   // Determine if the top level icon for namespace / module folders is removed.
   const animate = typeof globalThis?.dmtOptions?.navAnimate === 'boolean' ?
    globalThis.dmtOptions.navAnimate : true;

   const storageKey = entry.storageKey;

   const store = storageKey ? dmtSessionStorage.getStore(storageKey, false) : void 0;

   const indentIcon = !removeIcon && entry.kind ? 'indent-icon' : 'indent-no-icon';

   const folder = {
      animate,
      store
   }
</script>

<TJSSvgFolder {folder}>
   <Entry {entry} {removeIcon} {storageKey} slot=label />
   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} />
      {:else}
         <Entry entry={child} {indentIcon} />
      {/if}
   {/each}
</TJSSvgFolder>
