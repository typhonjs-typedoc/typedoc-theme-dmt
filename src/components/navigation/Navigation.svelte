<script>
   import { setContext }         from 'svelte';

   import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';

   // Inflate and unpack the navigation index.
   const index = typeof globalThis.dmtNavigationIndex === 'string' ?
    globalThis.dmtInflateAndUnpackB64(globalThis.dmtNavigationIndex) : [];

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis.dmtOptions.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;

   // Determine the depth in the static HTML paths to adjust a prepended relative path for all navigation links.
   const baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
   const pathURL = globalThis.location.href.replace(baseURL, '');
   const depth = (pathURL.match(/\//) ?? []).length;

   const pathPrepend = '../'.repeat(depth);

   setContext('#pathPrepend', pathPrepend);
   setContext('#sessionStorage', new TJSSessionStorage());
</script>

{#each index as entry (entry.path)}
   {#if Array.isArray(entry.children)}
      <Folder {entry} removeIcon={removeTopLevelIcon} />
   {:else}
      <Entry {entry} />
   {/if}
{/each}