<script>
   /**
    * Provides the main horizontal view for toolbar icons when space is available.
    *
    * @componentDescription
    */
   import { getContext }         from 'svelte';

   const { componentStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const { toolbarIconLinks } = componentStores;
</script>

<section>
   {#each $toolbarIconLinks.icons as entry (entry.url)}
      <a href={entry.url} target="_blank" title={entry.title}>
         <img src={entry.iconURL} alt={entry.title} />
      </a>
   {/each}
</section>

<style>
   a {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      /* When changed update `createStoreToolbarIconLinks` */
      margin: 4px;
   }

   a:focus-visible img {
      filter: brightness(1.5);
   }

   img {
      /* When changed update `createStoreToolbarIconLinks` */
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
      margin-left: auto;
      min-width: 0;
      overflow: hidden;

      /* When changed update `createStoreToolbarIconLinks` */
      gap: 0.35rem;
   }
</style>
