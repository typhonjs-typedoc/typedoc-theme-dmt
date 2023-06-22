/**
 * Provides the following global keyboard commands:
 * - <Alt-I>: Go to main index.
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