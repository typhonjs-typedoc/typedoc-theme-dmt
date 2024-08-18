<script>
   import { getContext }   from 'svelte';

   /** @type {import('#types/frontend').DMTNavigationElement} */
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

   /** @type {NavigationData} */
   const navigationData = getContext('#dmtNavigationData');

   /** @type {import('svelte/store').Readable<string>} */
   const storeCurrentPathURL = navigationData.treeState.storeCurrentPathURL;

   const icon = !removeIcon && entry.kind ? entry.kind : void 0;

   const path = entry.path ? `${navigationData.basePath}${entry.path}` : void 0;

   $: isCurrent = entry.path ? entry.path === $storeCurrentPathURL : false;

   /**
    * Disables default browser downloading when `Alt-Click` is pressed. This helps to protect users as `Alt-Click` on
    * Folder components closes all children folders and this protects an easy mistake when clicking on an anchor.
    */
   function onClick()
   {
      globalThis.location.href = path;
   }
</script>

{#if path}
   <a href={path}
      on:click|preventDefault|stopPropagation={onClick}
      class:current={isCurrent}
      class:indent-icon={indentIcon === 'indent-icon'}
      class:indent-no-icon={indentIcon === 'indent-no-icon'}
      class:indent-none={indentIcon === 'indent-none'}
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

   a, span {
      margin-right: 0.25rem;
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

   /* Small indent for border */
   .indent-none {
      margin-left: 0.25rem;
   }
</style>
