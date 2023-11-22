<script>
   import TJSSvgFolder  from './TJSSvgFolder.svelte';

   /** @type {object} */
   export let entry;

   /** @type {string} */
   export let prepend;

   const folderProps = {
      options: { focusIndicator: true }
   }
</script>

<TJSSvgFolder {...folderProps}>
   <a href={`${prepend}${entry.path}`} slot=label>
      <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${entry.kind}`}></use></svg>
      <span>{entry.text}</span>
   </a>

   {#each entry.children as child (child.path)}
      {#if Array.isArray(child.children)}
         <svelte:self entry={child} {prepend}/>
      {:else}
         <a href={`${prepend}${child.path}`}>
            <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${child.kind}`}></use></svg>
            <span>{child.text}</span>
         </a>
      {/if}
   {/each}
</TJSSvgFolder>
