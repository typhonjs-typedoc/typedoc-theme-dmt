<script>
   import { getContext } from 'svelte';

   import TJSSvgFolder  from './TJSSvgFolder.svelte';

   /** @type {object} */
   export let entry;

   export let removeIcon = false;

   const pathPrepend = getContext('#pathPrepend');
   const sessionStorage = getContext('#sessionStorage');

   // Retrieve the storage prepend string from global DMT options or generate a random string.
   const storagePrepend = globalThis.dmtOptions.storagePrepend ??
    `docs-${Math.random().toString(36).substring(2, 18)}`;

   const folderProps = {
      options: { focusIndicator: true },
      store: sessionStorage.getStore(`${storagePrepend}-nav-${entry.path}`, false)
   }
</script>

<TJSSvgFolder {...folderProps}>
   <a href={`${pathPrepend}${entry.path}`} slot=label>
      {#if !removeIcon}
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${entry.kind}`}></use></svg>
      {/if}
      <span>{entry.text}</span>
   </a>

   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} />
      {:else}
         <a href={`${pathPrepend}${child.path}`}>
            <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${child.kind}`}></use></svg>
            <span>{child.text}</span>
         </a>
      {/if}
   {/each}
</TJSSvgFolder>
