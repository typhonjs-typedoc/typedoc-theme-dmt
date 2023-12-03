<script>
   import IconLinks from './IconLinks.svelte';

   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;
</script>

<section>
   <IconLinks {dmtComponentData} />
</section>

<style>
   section {
      margin-left: auto;
   }
</style>
