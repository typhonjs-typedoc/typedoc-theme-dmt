<script>
   import { setContext }         from 'svelte';

   import { TJSSessionStorage }  from "#runtime/svelte/store/web-storage";

   import Folder  from './Folder.svelte';

   const index = globalThis.dmtInflateAndUnpackB64(globalThis.dmtNavigationIndex);

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
      <Folder {entry} />
   {:else}
      <a href={`${pathPrepend}${entry.path}`}>
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${entry.kind}`}></use></svg>
         <span>{entry.text}</span>
      </a>
   {/if}
{/each}