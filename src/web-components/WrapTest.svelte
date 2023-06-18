<script>
   import { unescapeAttr } from '../utils.js';

   export let data = void 0;

   $: if (data)
   {
      try
      {
         const unescaped = unescapeAttr(data)
      }
      catch (err)
      {
         console.warn(`[typedoc-theme-default-modern] Wrap WC - Failure to deserialize link data: `, data);
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