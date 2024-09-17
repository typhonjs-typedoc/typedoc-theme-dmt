<script>
   import {
      getContext,
      onMount }            from 'svelte';

   import { quintIn }      from 'svelte/easing';

   import { slideFade }    from '#runtime/svelte/transition';

   import { A11yHelper }   from '#runtime/util/browser';

   import TJSFocusWrap     from '../../external/TJSFocusWrap.svelte';

   const {
      componentStores,
      settingStores } = /** @type {DMTComponentData} */ getContext('#dmtComponentData');

   const { toolbarIconLinks } = componentStores;
   const { themeAnimate } = settingStores;

   // Choose `slideFade` if animation is enabled otherwise no-op transition function.
   const transitionFn = $themeAnimate ? slideFade : () => void 0;

   // Provides options to `A11yHelper.getFocusableElements` to ignore TJSFocusWrap by CSS class.
   const s_IGNORE_CLASSES = { ignoreClasses: ['tjs-focus-wrap'] };

   const menuVisible = getContext('menuVisible');

   let menuEl;

   onMount(() => menuEl.focus());

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
         transition:transitionFn|global={{ duration: 250, easing: quintIn }}
         on:keydown={handleKeydown}
         on:keyup={handleKeyup}
         role=menu
         tabindex=-1>
   <div>
      {#each $toolbarIconLinks.icons as entry (entry.url)}
         <a href={entry.url} target="_blank" title={entry.title}>
            <img src={entry.iconURL} alt={entry.title} />
         </a>
      {/each}
   </div>
   <TJSFocusWrap elementRoot={menuEl} />
</section>

<style>
   section {
      background: var(--color-background);
      border-radius: var(--dmt-container-border-radius);
      border: var(--dmt-container-border);

      position: absolute;
      width: max-content;
      height: max-content;
      overflow: hidden;

      top: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);

      box-shadow: 0 0 6px #000;
      padding: 0.25rem;
      z-index: 1;
   }

   div {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;

      align-items: center;
      gap: 0.5rem;
   }

   section:focus-visible {
      outline: 2px solid transparent;
   }

   a {
      display: flex;
      align-items: center;
      flex-shrink: 0;
   }

   a:focus-visible img {
      filter: brightness(1.5);
   }

   img {
      max-height: 24px;
      width: auto;
   }

   img:hover {
      filter: brightness(1.5);
   }
</style>
