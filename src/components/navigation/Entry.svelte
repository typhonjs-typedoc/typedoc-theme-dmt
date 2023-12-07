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

   export let indentIcon = void 0;

   /**
    * Any associated sessionStorage key set as a data attribute.
    *
    * @type {string|null}
    */
   export let storageKey = null;

   const { basePath, storeCurrentPathURL } = /** @type {NavigationData} */ getContext('#navigationData');

   const icon = !removeIcon && entry.kind ? entry.kind : void 0;

   const path = entry.path ? `${basePath}${entry.path}` : void 0;

   $: isCurrent = entry.path ? entry.path === $storeCurrentPathURL : false;
</script>

{#if path}
   <a href={path}
      on:click|stopPropagation
      class:current={isCurrent}
      class:indent-icon={indentIcon === 'indent-icon'}
      class:indent-no-icon={indentIcon === 'indent-no-icon'}
      data-storage-key={storageKey}>
      {#if icon}
         <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${icon}`}></use></svg>
      {/if}
      <span>{entry.text}</span>
   </a>
{:else}
   <span class:indent-icon={indentIcon === 'indent-icon'}
         class:indent-no-icon={indentIcon === 'indent-no-icon'}>
      {entry.text}
   </span>
{/if}

<style>
   a {
      width: fit-content;
   }

   svg, span {
      pointer-events: none;
   }

   .indent-icon {
      margin-left: var(--dmt-nav-entry-indent-icon, 28px);
   }

   .indent-no-icon {
      margin-left: var(--dmt-nav-entry-indent-no-icon, 18px);
   }
</style>
