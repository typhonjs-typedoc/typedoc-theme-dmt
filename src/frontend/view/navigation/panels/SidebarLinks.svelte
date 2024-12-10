<script>
   import { getContext } from 'svelte';

   const { sidebarLinks } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const hasLinks = Object.keys(sidebarLinks).length > 0;
</script>

{#if hasLinks}
   <section class=dmt-sidebar-links
            tabindex=-1>
      {#each Object.keys(sidebarLinks) as key (sidebarLinks[key])}
         <a href={`${sidebarLinks[key]}`} target=_blank><span>{key}</span></a>
      {/each}
   </section>
{/if}

<style lang=scss>
   a {
      display: block;
      overflow: var(--dmt-sidebarlinks-overflow, unset);
      text-overflow: var(--dmt-sidebarlinks-text-overflow, ellipsis);
      white-space: var(--dmt-sidebarlinks-white-space, normal);
   }

   section.dmt-sidebar-links {
      display: flex;
      flex-direction: column;
      gap: 0.25em;

      background: var(--dmt-container-background);
      border: var(--dmt-container-border);
      border-radius: var(--dmt-container-border-radius);
      box-shadow: var(--dmt-container-box-shadow);
      margin: 0 1rem 0 0;
      padding: 0.25rem;

      &:focus-visible {
         outline: transparent;
      }
   }
</style>
