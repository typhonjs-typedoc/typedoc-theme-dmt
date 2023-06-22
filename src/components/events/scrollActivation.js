/**
 * This function registers pointer event listeners to programmatically focus the scrolling element beneath the input
 * device. This allows keyboard control of the appropriate scrolling container. However, due to this theme being an
 * augmentation of the default theme there are some layout aspects we can't control. There isn't a clean separation
 * between the left side navigation, main container, and new `On This Page` content scrolling element. In particular
 * when entering the `.col-content` element the main `.container-main` element is focused. Due to the left hand
 * navigation and `On This Page` element being children of the .container-main` element when programmatically focusing
 * a reflow will be triggered. This can't be solved without a rework of the HTML layout. Since this theme is an
 * augmentation of the default theme there is only so much that can be done.
 *
 * The target scrolling elements are set to have a `tabindex` of `-1` in {@link PageRenderer.#augmentGlobal}. There are
 * styles in `dmt-theme.scss` to set the outline of the scroll containers to transparent for `:focus-visible`.
 *
 * While it's nice to have a layout that doesn't reflow so often in practice this is not a performance issue despite the
 * warnings that will post in the developer console. This can be fixed with a more hands on rework of the layout which
 * is beyond the scope of this theme currently. In other words don't freak out if you see what looks like reflow /
 * layout thrashing. It is due to the code below / manual programmatic focusing which serves a purpose and makes for a
 * really nice fluid keyboard control. It also allows intuitive start of explicit focus traversal.
 */
export function scrollActivation()
{
   // Direct focus target.
   const navContainer = globalThis.document.querySelector('div.site-menu');

   // Direct focus target / will be null when not on page.
   const onThisPageInnerEl = globalThis.document.querySelector('details.tsd-page-navigation .tsd-accordion-details');

   // Ambient focus target for colContentEl.
   const mainContainer = globalThis.document.querySelector('div.container.container-main');

   // Focus targets that activate mainContainer.
   const colContentEl = globalThis.document.querySelector('div.col-content');

   /**
    * Allow a focus change to occur if any explicitly focused element is one of the following.`null` handles the case
    * when there is no current explicitly focused element / result from `querySelector(':focus-visible')`.
    *
    * @type {Set<Element|null>}
    */
   const focusContainers = new Set([mainContainer, navContainer, onThisPageInnerEl, null]);

   // Direct focus targets -------------------------------------------------------------------------------------------

   if (navContainer)
   {
      navContainer.addEventListener('pointerenter', (event) =>
      {
         event.preventDefault();
         event.stopImmediatePropagation();

         const explicitlyFocusedEl = globalThis.document.querySelector(':focus-visible');

         // Abort if the explicitly focused element is not on of the target elements tracked.
         if (globalThis.document.activeElement !== navContainer && focusContainers.has(explicitlyFocusedEl))
         {
            globalThis.requestAnimationFrame(() => navContainer.focus({ preventScroll: true }));
         }
      });
   }

   // Will be null when not on page.
   if (onThisPageInnerEl)
   {
      onThisPageInnerEl.addEventListener('pointerenter', (event) =>
      {
         event.preventDefault();
         event.stopImmediatePropagation();

         const explicitlyFocusedEl = globalThis.document.querySelector(':focus-visible');

         // Abort if the explicitly focused element is not on of the target elements tracked.
         if (globalThis.document.activeElement !== onThisPageInnerEl && focusContainers.has(explicitlyFocusedEl))
         {
            globalThis.requestAnimationFrame(() => onThisPageInnerEl.focus({ preventScroll: true }));
         }
      });
   }

   // Indirect focus targets / activates mainContainer ---------------------------------------------------------------

   if (colContentEl)
   {
      colContentEl.addEventListener('pointerenter', (event) =>
      {
         event.preventDefault();
         event.stopImmediatePropagation();

         const explicitlyFocusedEl = globalThis.document.querySelector(':focus-visible');

         if (globalThis.document.activeElement !== mainContainer && focusContainers.has(explicitlyFocusedEl))
         {
            globalThis.requestAnimationFrame(() => mainContainer.focus({ preventScroll: true }));
         }
      });
   }
}