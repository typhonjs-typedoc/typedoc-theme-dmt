<script>
   /**
    * Provides the main toolbar wrapper with resize observer and store available from the context `toolbarOffsetWidth`
    * for children components to adjust dynamically.
    *
    * @componentDescription
    */
   import { setContext }      from 'svelte';
   import { writable }        from 'svelte/store';

   import { resizeObserver }  from '#runtime/svelte/action/dom/observer';

   import IconLinks           from './iconlinks/IconLinks.svelte';

   const toolbarOffsetWidth = writable(0);

   setContext('toolbarOffsetWidth', toolbarOffsetWidth);
</script>

<section use:resizeObserver={(offsetWidth) => $toolbarOffsetWidth = offsetWidth}>
   <IconLinks />
</section>

<style>
   section {
      display: flex;
      flex-wrap: nowrap;

      align-items: center;
      margin-right: 0.5rem;

      height: 100%;
      width: 100%;
   }
</style>
