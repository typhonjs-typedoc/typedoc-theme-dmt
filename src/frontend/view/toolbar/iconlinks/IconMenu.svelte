<script>
   import {
      getContext,
      onMount }            from 'svelte';

   import { quintIn }      from 'svelte/easing';

   import { slideFade }    from '#runtime/svelte/transition';

   import { A11yHelper }   from '#runtime/util/browser';

   import TJSFocusWrap     from '../../external/TJSFocusWrap.svelte';

   const { componentStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');
   const { toolbarIconLinks } = componentStores;

   // Provides options to `A11yHelper.getFocusableElements` to ignore TJSFocusWrap by CSS class.
   const s_IGNORE_CLASSES = { ignoreClasses: ['tjs-focus-wrap'] };

   const menuVisible = getContext('menuVisible');

   let menuEl;

   onMount(async () =>
   {
      // Must wait for all images to load so that `menuEl` has the proper `offsetWidth`.
      const promises = Array.from(menuEl.querySelectorAll('img')).map((img) => img.complete ? Promise.resolve() :
       new Promise(resolve => img.onload = resolve));

      await Promise.allSettled(promises);

      // Set `menuEl` `right` style by the hard coded button width to center the menu.
      menuEl.style.right = `${(menuEl.offsetWidth - 32) / 2}px`;

      menuEl.focus();
   });

   /**
    * Handle `Shift-Tab` to focus cycle to last element.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeydown(event)
   {
      switch (event.code)
      {
         case 'Tab':
         event.stopPropagation();

         // Handle reverse focus cycling with `<Shift-Tab>`.
         if (event.shiftKey)
         {
            // Collect all focusable elements from `elementRoot` and ignore TJSFocusWrap.
            const allFocusable = A11yHelper.getFocusableElements(menuEl, s_IGNORE_CLASSES);

            // Find first and last focusable elements.
            const firstFocusEl = allFocusable.length > 0 ? allFocusable[0] : void 0;
            const lastFocusEl = allFocusable.length > 0 ? allFocusable[allFocusable.length - 1] : void 0;

            // Only cycle focus to the last keyboard focusable app element if `elementRoot` or first focusable
            // element is the active element.
            if (menuEl === globalThis.document.activeElement || firstFocusEl === globalThis.document.activeElement)
            {
               if (lastFocusEl instanceof HTMLElement && firstFocusEl !== lastFocusEl) { lastFocusEl.focus(); }

               event.preventDefault();
            }
         }

         break;
      }

      event.stopPropagation();
   }

   /**
    * Close menu on `Escape` key up.
    *
    * @param {KeyboardEvent}  event -
    */
   function handleKeyup(event)
   {
      switch (event.code)
      {
         case 'Escape':
            $menuVisible = false;
            event.preventDefault();
            break;
      }

      event.stopPropagation();
   }

   /**
    * Close the menu if a pointer down event occurs outside the button host.
    *
    * @param {PointerEvent} event - Pointer event.
    */
   function handlePointerdown(event)
   {
      if (!menuEl?.parentElement?.contains?.(event.target)) { $menuVisible = false; }
   }
</script>

<svelte:window on:pointerdown={handlePointerdown} />

<section bind:this={menuEl}
         transition:slideFade|global={{ duration: 250, easing: quintIn }}
         on:keydown={handleKeydown}
         on:keyup={handleKeyup}
         role=menu
         tabindex=-1>
   {#each $toolbarIconLinks.icons as entry (entry.url)}
      <a href={entry.url} target="_blank" title={entry.title}>
         <img src={entry.iconURL} alt={entry.title} />
      </a>
   {/each}
   <TJSFocusWrap elementRoot={menuEl} />
</section>

<style>
   section {
      background: var(--color-background);
      border-radius: var(--dmt-container-border-radius);
      border: var(--dmt-container-border);

      position: fixed;
      width: fit-content;
      height: max-content;
      overflow: hidden;

      top: 45px;

      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;

      box-shadow: 0 0 6px #000;

      align-items: center;

      gap: 0.35rem;
   }

   section:focus-visible {
      outline: 2px solid transparent;
   }

   a {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      margin: 4px;
   }

   a:focus-visible img {
      filter: brightness(1.5);
   }

   img {
      height: 24px;
      width: auto;
   }

   img:hover {
      filter: brightness(1.5);
   }
</style>
