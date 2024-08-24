<script>
   import { getContext }   from 'svelte';

   const { dmtURL, iconLinks } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const linksService = iconLinks?.service ?? [];
   const linksUser = iconLinks?.user ?? [];
</script>

<section>
   {#each linksUser as entry (entry.url)}
      <a href={entry.url} target="_blank" title={entry.title}>
         <img src={typeof entry.dmtPath === 'string' ? `${dmtURL}${entry.dmtPath}` : entry.iconURL} alt={entry.title} />
      </a>
   {/each}

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
      flex-shrink: 0;
      margin: 4px;
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
      flex-wrap: nowrap;

      align-items: center;
      gap: 0.35rem;
      margin-left: auto;
      margin-right: 0.5rem;
      min-width: 0;
      overflow: hidden;
      padding-left: 0.5rem;
   }
</style>
