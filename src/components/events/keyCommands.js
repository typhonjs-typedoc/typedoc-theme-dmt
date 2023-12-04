import { get }                from 'svelte/store';

import { nextAnimationFrame } from "#runtime/util/animate";

/**
 * Provides the following global keyboard commands:
 * - <Alt-E>: Expand / collapse all navigation folders.
 * - <Alt-I>: Go to main index.
 * - <Alt-N>: Scroll to current page in navigation panel and focus it.
 * - <Alt-O>: If available, focus first anchor in `On This Page` container.
 *
 * @param {INavigationData} navigationData - NavigationData instance.
 */
export function keyCommands(navigationData)
{
   // Direct focus target.
   globalThis.document.addEventListener('keydown', (event) =>
   {
      if (!event.altKey) { return; }

      switch (event.code)
      {
         case 'KeyE':
            navigationData.setStoresAllOpen(!get(navigationData.storeSessionAllOpen));
            event.preventDefault();
            break;

         case 'KeyI':
            window.location.href = `${globalThis.dmtOptions.basePath}index.html`;
            event.preventDefault();
            break;

         case 'KeyN':
         {
            // Invoke `ensureCurrentPath` from Navigation Svelte component.
            // globalThis?.dmtComponents?.navigation?.ensureCurrentPath?.({ focus: true });

            const currentPathURL = navigationData.currentPathURL;
            if (navigationData.state.ensureCurrentPath(navigationData.currentPathURL))
            {
               // Wait for the next animation frame as this will ensure multiple levels of tree nodes opening.
               nextAnimationFrame().then(() => document.querySelector('.dmt-navigation-content')?.querySelector(
                `a[href*="${currentPathURL}"]`)?.focus({ focusVisible: true }));
            }
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
