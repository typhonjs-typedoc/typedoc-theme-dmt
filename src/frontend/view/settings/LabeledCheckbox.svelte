<script>
   /** @type {import('svelte/store').Writable<boolean>} */
   export let store = void 0;

   /** @type {string} */
   export let label = void 0;
</script>

<label>
   <input type=checkbox bind:checked={$store}>
   <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect class="tsd-checkbox-background" width="30" height="30" x="1" y="1" rx="6" fill="none"></rect>
      <path class="tsd-checkbox-checkmark" d="M8.35422 16.8214L13.2143 21.75L24.6458 10.25" stroke="none" stroke-width="3.5" stroke-linejoin="round" fill="none"></path>
   </svg>
   <span>{label}</span>
</label>

<style>
   label {
      display: flex;
      width: fit-content;
      align-items: center;
      user-select: none;
      cursor: pointer;
   }

   input {
      cursor: pointer;
      position: absolute;
      width: 1.5em;
      height: 1.5em;
      opacity: 0;
   }

   svg {
      cursor: pointer;
      width: 1.5em;
      height: 1.5em;
      margin-right: 0.5em;
      border-radius: 0.33em;
      opacity: 0.99;
   }
</style>
