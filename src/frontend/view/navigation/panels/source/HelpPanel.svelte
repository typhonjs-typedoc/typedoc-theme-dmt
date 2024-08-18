<script>
   import { getContext }   from 'svelte';

   import { slideFade }    from '#runtime/svelte/transition';

   export let hasModulesIndex = false;

   export let moduleIsPackage = false;

   /** @type {boolean} */
   export let hasFolders = false;

   const { ReflectionKind } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   /** @type {import('svelte/store').Writable<boolean>} */
   const storeSettingAnimate = getContext('#dmtStoreSettingAnimate');

   const animateTransition = $storeSettingAnimate ? slideFade : () => void 0;

   const moduleIndexLabel = moduleIsPackage ? 'package' : 'module';

   const reflectionData = [];

   for (const [key, value] of Object.entries(ReflectionKind))
   {
      if (typeof value === 'number') { reflectionData.push({ key, value }); }
   }

   reflectionData.sort((a, b) => a.key.localeCompare(b.key));
</script>

<div transition:animateTransition={{ duration: 100 }}>
   <span class=title>Reflection Icon Reference:</span>
   <section class=reflection-kinds>
      {#each reflectionData as entry (entry.value)}
         <span>
            <svg class=tsd-kind-icon viewBox="0 0 24 24"><use href={`#icon-${entry.value}`}></use></svg>
            {entry.key}
         </span>
      {/each}
   </section>

   <span class=title>Keyboard Shortcuts:</span>
   <span><i class=key>Alt + C</i>Focus main content</span>
   {#if hasFolders}<span><i class=key>Alt + E</i>(Nav) open / close all</span>{/if}
   <span><i class=key>Alt + H</i>Open / close help</span>
   <span><i class=key>Alt + I</i>Go to home / index page</span>
   <span><i class=key>Alt + N</i>(Nav) focus selected</span>
   {#if hasModulesIndex}<span><i class=key>Alt + M</i>Go to {moduleIndexLabel} page</span>{/if}
   <span><i class=key>Alt + O</i>Focus "On This Page"</span>
   <span><i class=key>Alt + S</i>Activate search</span>
   {#if hasFolders}<span><i class=key>Alt</i>Press when opening / closing folders to open / close all child folders.</span>{/if}
</div>

<style>
   div {
      position: absolute;
      top: 2.6rem;

      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      width: calc(100% - 1.5rem); /* Take into account border, padding, scrollbar */
      height: fit-content;

      background: var(--dmt-overlay-panel-background);
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
      border-left: 1px solid rgba(0, 0, 0, 0.2);
      border-right: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 0 0 0.25rem 0.25rem;
      box-shadow:
         -0.25rem 0 0.25rem -0.25rem var(--dmt-box-shadow-color), /* Left shadow */
         0.25rem 0 0.25rem -0.25rem var(--dmt-box-shadow-color),  /* Right shadow */
         0 0.75rem 0.75rem -0.75rem var(--dmt-box-shadow-color);  /* Bottom shadow */
      padding: 0.5rem;
   }

   span {
      display: flex;
      gap: 0.5rem;
      align-items: center;
   }

   svg {
      margin: 0;
   }

   .key {
      padding: 0 3px;
      min-width: 52px;
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid #999;
      border-radius: 0.25rem;
      box-shadow: 1px 1px var(--dmt-help-panel-key-box-shadow-color);
      text-align: center;
   }

   .reflection-kinds {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-row-gap: 0.1rem;
   }

   .title {
      text-decoration: underline;
   }

   :global(:root[data-theme="dark"]) {
      --dmt-help-panel-key-box-shadow-color: #aaa;
   }

   :global(:root[data-theme="light"]) {
      --dmt-help-panel-key-box-shadow-color: #444;
   }

   @media (prefers-color-scheme: dark) {
      :global(:root) {
         --dmt-help-panel-key-box-shadow-color: #aaa;
      }
   }

   @media (prefers-color-scheme: light) {
      :global(:root) {
         --dmt-help-panel-key-box-shadow-color: #444;
      }
   }
</style>
