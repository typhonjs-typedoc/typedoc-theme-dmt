<script>
   /** @type {DMTComponentData} */
   export let dmtComponentData = void 0;

   const storeAnimation = dmtComponentData.dmtLocalStorage.getStore('docs-dmt-animate');
</script>

<label class=tsd-filter-input>
   <input type=checkbox id=tsd-filter-inherited name=inherited bind:checked={$storeAnimation}>
   <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect class="tsd-checkbox-background" width="30" height="30" x="1" y="1" rx="6" fill="none"></rect>
      <path class="tsd-checkbox-checkmark" d="M8.35422 16.8214L13.2143 21.75L24.6458 10.25" stroke="none" stroke-width="3.5" stroke-linejoin="round" fill="none"></path>
   </svg>
   <span>Theme Animation</span>
</label>

<style>
   label {
      margin-top: 0.75rem;
   }
</style>
