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

   /** @type {import('typedoc').NavigationElement} */
   export let entry;

   /**
    * To properly support nested categories / groups it is necessary to prepend the parent path to the storage key as
    * the folder stores are reactive. This prevents opening / closing all categories of the same name.
    *
    * @type {string}
    */
   export let parentPath = '';

   /**
    * Forwarded onto the summary `Entry` to not render the SVG icon for top level modules / namespaces.
    *
    * @type {boolean}
    */
   export let removeIcon = false;

   const { dmtSessionStorage } = getContext('#options');

   // Retrieve the storage prepend string from global DMT options or generate a random string.
   const storagePrepend = globalThis?.dmtOptions?.storagePrepend ??
    `docs-${Math.random().toString(36).substring(2, 18)}`;

   const storageKey = `${storagePrepend}-nav-${entry.path ?? `${parentPath}-${entry.text}`}`;

   const store = dmtSessionStorage.getStore(storageKey, false);

   // Force store / opened value depending on result of `openCurrentPath`.
   if (typeof entry.opened === 'boolean' && entry.opened) { $store = true; }

   const folderProps = {
      options: { focusIndicator: true },
      store
   }
</script>

<TJSSvgFolder {...folderProps}>
   <Entry {entry} {removeIcon} {storageKey} slot=label />
   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} parentPath={entry.path ?? entry.text} />
      {:else}
         <Entry entry={child} />
      {/if}
   {/each}
</TJSSvgFolder>
