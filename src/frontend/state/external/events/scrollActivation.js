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
   const navigationBarEl = globalThis.document.querySelector('section.dmt-navigation-bar');

   // Direct focus target / all navigation trees.
   const navigationTrees = [...globalThis.document.querySelectorAll('div.dmt-navigation-tree')];

   // Direct focus target / will be null when not on page.
   const onThisPageInnerEl = globalThis.document.querySelector('details.tsd-page-navigation .tsd-accordion-details');

   // Direct focus target for root column sidebar.
   const rootColSidebarEl = globalThis.document.querySelector('div.col-sidebar');

   // Direct focus target / will be null when not on page.
   const sidebarLinksEl = globalThis.document.querySelector('section.dmt-sidebar-links');

   // Direct focus target.
   const siteMenuEl = globalThis.document.querySelector('div.site-menu');

   // -------

   // Ambient focus target for colContentEl.
   const mainContainerEl = globalThis.document.querySelector('div.container.container-main');

   // Focus targets that activate mainContainerEl.
   const colContentEl = globalThis.document.querySelector('div.col-content');

   /**
    * Allow a focus change to occur if any explicitly focused element is one of the following.`null` handles the case
    * when there is no current explicitly focused element / result from `querySelector(':focus-visible')`.
    *
    * @type {Set<Element|null>}
    */
   const focusContainers = new Set([
      mainContainerEl,
      navigationBarEl,
      ...navigationTrees,
      onThisPageInnerEl,
      rootColSidebarEl,
      sidebarLinksEl,
      siteMenuEl,
      null
   ]);

   /**
    * @param {HTMLElement} el - Element to add `pointerenter` handling.
    *
    * @param {HTMLElement} [focusEl] - Optional focus target.
    */
   function focusOnPointerenter(el, focusEl)
   {
      focusEl = focusEl ?? el;

      el.addEventListener('pointerenter', (event) =>
      {
         event.preventDefault();
         event.stopImmediatePropagation();

         const explicitlyFocusedEl = globalThis.document.querySelector(':focus-visible');

         // Abort if the explicitly focused element is not on of the target elements tracked.
         if (globalThis.document.activeElement !== focusEl && focusContainers.has(explicitlyFocusedEl))
         {
            globalThis.requestAnimationFrame(() => focusEl.focus({ preventScroll: true }));
         }
      });
   }

   // Direct focus targets -------------------------------------------------------------------------------------------

   if (navigationBarEl) { focusOnPointerenter(navigationBarEl); }

   if (navigationTrees.length)
   {
      for (const navTreeEl of navigationTrees) { focusOnPointerenter(navTreeEl); }
   }

   // Will be null when not on page.
   if (onThisPageInnerEl) { focusOnPointerenter(onThisPageInnerEl); }

   if (rootColSidebarEl) { focusOnPointerenter(rootColSidebarEl); }

   // Will be null when not on page.
   if (sidebarLinksEl) { focusOnPointerenter(sidebarLinksEl); }

   // Will be null when not on page.
   if (siteMenuEl) { focusOnPointerenter(siteMenuEl); }

   // Indirect focus targets / activates mainContainerEl ---------------------------------------------------------------

   if (colContentEl) { focusOnPointerenter(colContentEl, mainContainerEl); }
}
