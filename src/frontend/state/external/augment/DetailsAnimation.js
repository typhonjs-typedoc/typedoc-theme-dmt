import { writable }        from 'svelte/store';

import { toggleDetails }   from '#runtime/svelte/action/animate';

/**
 * Provides reactive management of the default theme details elements for animation controlled by local storage state.
 */
export class DetailsAnimation
{
   static #actionUpdateFn = [];

   /**
    * @param {DMTComponentData}  dmtComponentData - DMT component data.
    */
   static initialize(dmtComponentData)
   {
      globalThis.requestAnimationFrame(() =>
      {
         const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
          'details.tsd-accordion, details.tsd-index-accordion');

         // Add the toggleDetails actions to all default theme detail elements storing the update action.
         for (const detailEl of detailElList)
         {
            // Add class to provide transition for svg chevron. This is manually added to avoid transform on page load.
            const svgEl = detailEl.querySelector('summary svg');
            if (svgEl) { svgEl.classList.add('dmt-summary-svg'); }

            this.#actionUpdateFn.push(toggleDetails(detailEl, { store: writable(detailEl.open) }).update);
         }

         // Subscribe to the DMT theme animation setting changing the enabled state for all details elements.
         dmtComponentData.settingStores.themeAnimate.subscribe((enabled) => this.#setEnabled(enabled));
      });
   }

   /**
    * Enables / disables animation for the default theme details elements.
    *
    * @param {boolean}  animate - Current animation state.
    */
   static #setEnabled(animate)
   {
      // Update the toggleDetails actions.
      for (const actionUpdate of this.#actionUpdateFn) { actionUpdate({ animate }); }
   }
}
