import { A11yHelper }         from '#runtime/util/browser';

/**
 * Provides the following global keyboard commands:
 * - <Alt-C>: Focus main content
 * - <Alt-E>: Expand / collapse all navigation folders.
 * - <Alt-H>: Open / close the help panel.
 * - <Alt-I>: Go to home page / main index.html
 * - <Alt-M>: If there is a `modules.html` index then go to it.
 * - <Alt-N>: Scroll to current page in navigation panel and focus it.
 * - <Alt-O>: If available, focus first anchor in `On This Page` container.
 *
 * @param {NavigationData} navigationData - NavigationData instance.
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
         {
            const mainContentEl = document.querySelector('.col-content');
            if (mainContentEl)
            {
               const focusableEl = A11yHelper.getFirstFocusableElement(mainContentEl);
               if (focusableEl) { focusableEl.focus({ focusVisible: true }); }
            }
            event.preventDefault();
            break;
         }

         case 'KeyE':
            // Only open / close source folders in source navigation tree state.
            navigationData.treeState.source.swapFoldersAllOpen();

            event.preventDefault();
            break;

         case 'KeyH':
            navigationData.swapHelpPanelOpen();
            event.preventDefault();
            break;

         case 'KeyI':
            window.location.href = `${navigationData.baseURL}index.html`;
            event.preventDefault();
            break;

         case 'KeyM':
            if (navigationData.hasModulesIndex)
            {
               window.location.href = `${navigationData.baseURL}modules.html`;
            }
            event.preventDefault();
            break;

         case 'KeyN':
         {
            // Ensure current path is open and focus current path navigation entry.
            navigationData.treeState.ensureCurrentPath({ focus: true });

            event.preventDefault();
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
               }
            }
            event.preventDefault();
            break;
         }
      }
   });
}
