<script>
   import { unescapeAttr } from '#utils';

   export let data = void 0;

   $: if (data)
   {
      try
      {
         const unescaped = unescapeAttr(data)
      }
      catch (err)
      {
         console.warn(`[dmt-theme] Wrap WC - Failure to deserialize link data: `, data);
      }
   }
</script>

<div class=wrap-test>
  <slot />
</div>

<style>
  /*div {*/
  /*   color: red;*/
  /*}*/
</style>