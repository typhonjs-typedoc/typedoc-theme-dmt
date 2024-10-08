import { A11yHelper }         from '#runtime/util/a11y';

import { DetailsAccordion }   from '../augment/DetailsAccordion.js';

/**
 * Provides the following global keyboard commands:
 * - <Alt-C>: Focus main content
 * - <Alt-E>: Expand / collapse all navigation folders.
 * - <Alt-H>: Open / close the help panel.
 * - <Alt-I>: Go to home page / main index.html
 * - <Alt-M>: If there is a `modules.html` index then go to it.
 * - <Alt-N>: Scroll to current page in navigation panel and focus it.
 * - <Alt-O>: If available, focus first anchor in `On This Page` container.
 * - <Alt-S>: Open main search.
 *
 * @param {DMTComponentData} dmtComponentData - component data.
 */
export function keyCommands(dmtComponentData)
{
   const {
      baseURL,
      dmtSessionStorage,
      pageIndex,
      navigation,
      stateStores,
      storagePrepend } = dmtComponentData;

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

         case 'KeyD':
         {
            // Open / focus document index.
            const documentKey = `${storagePrepend}-document-index`;

            if (dmtSessionStorage.hasStore(documentKey))
            {
               dmtSessionStorage.getStore(documentKey).set(true);

               // Wait for content to display.
               setTimeout(() =>
               {
                  /** @type {HTMLDetailsElement} */
                  const sectionEl = globalThis.document.querySelector('section.dmt-document-index');
                  if (sectionEl)
                  {
                     const anchorEl = sectionEl.querySelector('a');
                     if (anchorEl) { anchorEl.focus({ focusVisible: true }); }
                  }
               }, 0);
            }

            event.preventDefault();
            break;
         }

         case 'KeyE':
            // Only open / close source folders in source navigation tree state.
            navigation.treeState.source.swapFoldersAllOpen();

            event.preventDefault();
            break;

         case 'KeyH':
            stateStores.swapHelpPanelVisible();
            event.preventDefault();
            break;

         case 'KeyI':
            globalThis.location.href = `${baseURL}index.html`;
            event.preventDefault();
            break;

         case 'KeyM':
            if (typeof pageIndex.modules === 'string')
            {
               globalThis.location.href = `${baseURL}${pageIndex.modules}`;
            }
            event.preventDefault();
            break;

         case 'KeyN':
         {
            // Ensure current path is open and focus current path navigation entry.
            navigation.treeState.ensureCurrentPath({ focus: true });

            event.preventDefault();
            break;
         }

         case 'KeyO':
         {
            DetailsAccordion.openOnThisPage();
            event.preventDefault();
            break;
         }

         case 'KeyS':
            stateStores.mainSearchVisible.set(true);
            event.preventDefault();
            break;

         case 'KeyY':
            if (typeof pageIndex.hierarchy === 'string')
            {
               globalThis.location.href = `${baseURL}${pageIndex.hierarchy}`;
            }
            event.preventDefault();
            break;
      }
   });
}
