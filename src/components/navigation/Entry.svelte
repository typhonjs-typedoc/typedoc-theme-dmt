<script>
   import { getContext }   from 'svelte';

   /** @type {import('./types').DMTNavigationElement} */
   export let entry;

   /**
    * Whether to render the SVG icon for top level modules / namespaces.
    *
    * @type {boolean}
    */
   export let removeIcon = false;

   /**
    * Any associated sessionStorage key set as a data attribute.
    *
    * @type {string|null}
    */
   export let storageKey = null;

   const { pathPrepend, currentPathURLStore } = /** @type {NavigationData} */ getContext('#navigationData');

   const icon = !removeIcon && entry.kind ? entry.kind : void 0;

   const path = entry.path ? `${pathPrepend}${entry.path}` : void 0;

   $: isCurrent = entry.path ? entry.path === $currentPathURLStore : false;
</script>

{#if path}
   <a href={path}
      on:click|stopPropagation
      class:current={isCurrent}
      data-storage-key={storageKey}>
      {#if icon}
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${icon}`}></use></svg>
      {/if}
      <span>{entry.text}</span>
   </a>
{:else}
   <span>{entry.text}</span>
{/if}

<style>
   a {
      width: fit-content;
   }

   svg, span {
      pointer-events: none;
   }
</style>
