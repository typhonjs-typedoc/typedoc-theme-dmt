<script>
   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   /** @type {Record<string, string>} */
   const sidebarLinks = dmtComponentData?.sidebarLinks ?? {};

   /** @type {Record<string, string>} */
   const navigationLinks = dmtComponentData?.navigationLinks ?? {};
</script>

<section>
   {#each Object.keys(navigationLinks) as key (navigationLinks[key])}
      <a href={`${navigationLinks[key]}`} target=_blank><span>{key}</span></a>
   {/each}
   {#each Object.keys(sidebarLinks) as key (sidebarLinks[key])}
      <a href={`${sidebarLinks[key]}`} target=_blank><span>{key}</span></a>
   {/each}
</section>

<style>
   section {
      display: flex;
      flex-direction: column;
      gap: 0.25em;

      background: var(--dmt-container-background);
      border: var(--dmt-container-border);
      border-radius: var(--dmt-container-border-radius);
      box-shadow: var(--dmt-container-box-shadow);
      margin: 0.5rem 1rem 0.25rem 0;
      padding: 0.25rem;

   }

   a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
   }
</style>
