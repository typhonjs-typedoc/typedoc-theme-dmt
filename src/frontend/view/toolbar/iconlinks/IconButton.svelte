<script>
   /**
    * When space is limited in the toolbar `IconButton` is displayed and controls the icon link overflow menu.
    *
    * @componentDescription
    */
   import { setContext }   from 'svelte';
   import { writable }     from 'svelte/store';

   import IconMenu         from './IconMenu.svelte';

   // State for when the menu is open.
   const menuVisible = writable(false);
   setContext('menuVisible', menuVisible);

   let buttonHostEl;
</script>

<section bind:this={buttonHostEl}>
   <button on:click={() => $menuVisible = !$menuVisible}
           on:pointerdown|stopPropagation>
      <svg width=16 height=16 viewBox="0 0 16 16" fill=none>
         <circle cx="8" cy="2" r="2"/>
         <circle cx="8" cy="8" r="2"/>
         <circle cx="8" cy="14" r="2"/>
      </svg>
   </button>
   {#if $menuVisible}
      <IconMenu {buttonHostEl} />
   {/if}
</section>

<style>
   button {
      margin: 1px 3px 0 3px;
      width: 33px;
      height: 33px;

      background: transparent;
      border-radius: 50%;
      cursor: pointer;
      line-height: 0;
   }

   section {
      display: flex;
      margin-left: auto;
      min-width: fit-content;
   }

   svg {
      fill: var(--color-text);
   }
</style>
