<script>
   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   const { dmtURL } = dmtComponentData;

   const linksIcon = dmtComponentData?.linksIcon ?? [];
   const linksService = dmtComponentData?.linksService ?? [];
</script>

<section>
   <!--{#each linksIcon as entry (entry.url)}-->
   <!--   <a href={entry.url} target="_blank" title={entry.title}>-->
   <!--      <img src={`${dmtURL}${entry.dmtPath}`} alt={entry.title} />-->
   <!--   </a>-->
   <!--{/each}-->

   {#each linksService as entry (entry.url)}
      <a href={entry.url} target="_blank" title={entry.title}>
         <img src={`${dmtURL}${entry.dmtPath}`} alt={entry.title} />
      </a>
   {/each}
</section>

<style>
   a {
      display: flex;
      align-items: center;
   }

   a:focus-visible img {
      filter: brightness(1.5);
   }

   img {
      height: 24px;
      width: auto;
   }

   img:hover {
      filter: brightness(1.5);
   }

   section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-right: 0.5rem;
   }
</style>
