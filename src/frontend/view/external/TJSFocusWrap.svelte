<script>
   /**
    * TODO: Add description
    *
    * @componentDocumentation
    */
   import { A11yHelper }    from '#runtime/util/browser';

   /** @type {HTMLElement} */
   export let elementRoot = void 0;

   /** @type {boolean} */
   export let enabled = true;

   let ignoreElements, wrapEl;

   $: if (wrapEl) { ignoreElements = new Set([wrapEl]); }

   function onFocus()
   {
      // Early out if not enabled.
      if (!enabled) { return; }

      if (A11yHelper.isFocusTarget(elementRoot))
      {
         const firstFocusEl = A11yHelper.getFirstFocusableElement(elementRoot, ignoreElements);

         if (A11yHelper.isFocusTarget(firstFocusEl) && firstFocusEl !== wrapEl)
         {
            firstFocusEl.focus();
         }
         else
         {
            // No focus target found, so focus elementRoot.
            elementRoot.focus();
         }
      }
   }
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div bind:this={wrapEl} class=tjs-focus-wrap tabindex=0 on:focus={onFocus} />

<style>
    div {
        width: 0;
        height: 0;
        flex: 0;
    }

    div:focus {
        outline: none;
    }
</style>
