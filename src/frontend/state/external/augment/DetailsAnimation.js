import { writable }        from 'svelte/store';

import { toggleDetails }   from '#runtime/svelte/action/animate';

/**
 * Provides reactive management of the default theme details elements for animation controlled by local storage state.
 */
export class DetailsAnimation
{
   #actionUpdateFn = [];

   /**
    * @param {import('svelte/store').Writable<boolean>}  storeSettingsAnimate - Animation setting store.
    */
   constructor(storeSettingsAnimate)
   {
      globalThis.requestAnimationFrame(() =>
      {
         const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
          'details.tsd-accordion');

         // Add the toggleDetails actions to all default theme detail elements storing the update action.
         for (const detailEl of detailElList)
         {
            this.#actionUpdateFn.push(toggleDetails(detailEl, { store: writable(detailEl.open) }).update);
         }

         storeSettingsAnimate.subscribe((enabled) => this.#setEnabled(enabled));
      });
   }

   /**
    * Enables / disables animation for the default theme details elements.
    *
    * @param {boolean}  animate - Current animation state.
    */
   #setEnabled(animate)
   {
      const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
       'details.tsd-accordion');

      for (const detailEl of detailElList)
      {
         // Add class to provide transition for svg chevron. This is manually added to avoid transform on page load.
         const svgEl = detailEl.querySelector('summary svg');
         if (svgEl) { svgEl.classList[animate ? 'add' : 'remove']('dmt-summary-svg'); }
      }

      // Update the toggleDetails actions
      for (const actionUpdate of this.#actionUpdateFn) { actionUpdate({ animate }); }
   }
}
