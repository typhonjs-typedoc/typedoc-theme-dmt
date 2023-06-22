/**
 * Provides the following global keyboard commands:
 * - <Alt-I>: Go to main index.
 * - <Alt-N>: Scroll to current page in navigation panel and focus it.
 * - <Alt-O>: If available, focus first anchor in `On This Page` container.
 */
export function keyCommands()
{
   // Direct focus target.
   globalThis.document.addEventListener('keydown', (event) =>
   {
      if (!event.altKey) { return; }

      switch (event.code)
      {
         case 'KeyI':
            window.location.href = `${globalThis.dmtOptions.basePath}index.html`;
            event.preventDefault();
            break;

         case 'KeyN':
         {
            const navEl = globalThis.document.querySelector('nav.tsd-navigation');
            if (navEl)
            {
               // First attempt to focus the current anchor element.
               const anchorEl = navEl.querySelector('a.current');
               if (anchorEl)
               {
                  anchorEl.focus({ focusVisible: true });
                  event.preventDefault();
               }
               else
               {
                  // Then attempt the focus first anchor.
                  const firstAnchorEl = navEl.querySelector('a');
                  if (firstAnchorEl)
                  {
                     firstAnchorEl.focus({ focusVisible: true });
                     event.preventDefault();
                  }
               }
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