<script>
   import { getContext }   from 'svelte';

   /** @type {object} */
   export let entry;

   export let removeIcon = false;

   const pathURL = getContext('#pathURL');
   const pathPrepend = getContext('#pathPrepend');

   const icon = !removeIcon && entry.kind ? entry.kind : void 0;

   const path = entry.path ? `${pathPrepend}${entry.path}` : void 0;
   const isCurrent = entry.path ? entry.path === pathURL : false;
</script>

{#if path}
   <a href={path}
      on:click|stopPropagation
      class:current={isCurrent}>
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
