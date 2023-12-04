import { get }                from 'svelte/store';

import { A11yHelper }         from '#runtime/util/browser';

import { nextAnimationFrame } from "#runtime/util/animate";

/**
 * Provides the following global keyboard commands:
 * - <Alt-C>: Focus main content
 * - <Alt-E>: Expand / collapse all navigation folders.
 * - <Alt-I>: Go to modules.html index.
 * - <Alt-N>: Scroll to current page in navigation panel and focus it.
 * - <Alt-M>: Go to main index.html
 * - <Alt-O>: If available, focus first anchor in `On This Page` container.
 *
 * @param {INavigationData} navigationData - NavigationData instance.
 */
export function keyCommands(navigationData)
{
   // Direct focus target.
   globalThis.document.addEventListener('keydown', (event) =>
   {
      if (!event.altKey || event.repeat) { return; }

      switch (event.code)
      {
         case 'KeyC':
            const mainContentEl = document.querySelector('.col-content');
            if (mainContentEl)
            {
               const focusableEl = A11yHelper.getFirstFocusableElement(mainContentEl);
               if (focusableEl) { focusableEl.focus({ focusVisible: true }); }
            }
            event.preventDefault();
            break;

         case 'KeyE':
            navigationData.setStoresAllOpen(!get(navigationData.storeSessionAllOpen));
            event.preventDefault();
            break;

         case 'KeyI':
            window.location.href = `${navigationData.baseURL}modules.html`;
            event.preventDefault();
            break;

         case 'KeyM':
            window.location.href = `${navigationData.baseURL}index.html`;
            event.preventDefault();
            break;

         case 'KeyN':
         {
            // Ensure current path is open and focus current path navigation entry.
            const currentPathURL = navigationData.currentPathURL;
            navigationData.state.ensureCurrentPath(navigationData.currentPathURL)

            // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
            nextAnimationFrame().then(() => document.querySelector('nav.tsd-navigation')?.querySelector(
             `a[href*="${currentPathURL}"]`)?.focus({ focusVisible: true }));
            break;
         }

         case 'KeyO':
         {
            /** @type {HTMLDetailsElement} */
            const detailsEl = globalThis.document.querySelector('details.tsd-page-navigation');
            if (detailsEl)
            {
               const anchorEl = detailsEl.querySelector('a');
               if (anchorEl)
               {
                  detailsEl.open = true;
                  setTimeout(() => anchorEl.focus({ focusVisible: true }), 0);
                  event.preventDefault();
               }
            }
            break;
         }
      }
   });
}
