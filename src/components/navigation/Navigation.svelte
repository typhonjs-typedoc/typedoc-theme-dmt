<script>
   import Folder  from './Folder.svelte';

   const index = globalThis.dmtInflateAndUnpackB64(globalThis.dmtNavigationIndex);

   const baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
   const pathURL = globalThis.location.href.replace(baseURL, '');

   const depth = (pathURL.match(/\//) ?? []).length;

   const prepend = '../'.repeat(depth);
</script>

{#each index as entry (entry.path)}
   {#if Array.isArray(entry.children)}
      <Folder {entry} {prepend}/>
   {:else}
      <a href={`${prepend}${entry.path}`}>
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${entry.kind}`}></use></svg>
         <span>{entry.text}</span>
      </a>
   {/if}
{/each}