import { toggleDetails }   from '#runtime/svelte/action/animate';

import { TJSSessionStorage } from '#runtime/svelte/store/web-storage';

/**
 * Provides reactive management of the default theme details elements for session storage and animation controlled by
 * local storage settings state. The `main section` and `On This Page` detail elements are paired with a shared key
 * such that open / closed state is synchronized.
 */
export class DetailsAccordion
{
   /**
    * Stores the `toggleDetails` action return / update functions.
    *
    * @type {import('svelte/action').ActionReturn[]}
    */
   static #actionUpdateFn = [];

   /**
    * @type {TJSSessionStorage}
    */
   static detailsSessionStorage = new TJSSessionStorage();

   /**
    * @param {DMTComponentData}  dmtComponentData - DMT component data.
    */
   static initialize(dmtComponentData)
   {
      globalThis.requestAnimationFrame(() =>
      {
         // Initialize detail element control / handling.
         this.#initializeDetails(dmtComponentData.storagePrepend);

         // Subscribe to the DMT theme animation setting changing the enabled state for all details elements.
         dmtComponentData.settingStores.themeAnimate.subscribe((enabled) => this.#setEnabled(enabled));
      });
   }

   static #initializeDetails(storagePrepend)
   {
      const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
       'details.tsd-accordion');

      const detailElMap = new Map();

      // Add the toggleDetails actions to all default theme detail elements storing the update action.
      for (const detailEl of detailElList)
      {
         const summaryEl = detailEl.querySelector('summary');

         let key;

         if (summaryEl)
         {
            key = `${storagePrepend}-accordion-${
               summaryEl.dataset.key ??
               summaryEl.textContent?.trim?.()?.replace(/\s+/g, "-").toLowerCase()
            }`;
         }

         if (typeof key === 'string' && key.length) { detailElMap.set(key, detailEl); }
      }

      // Find matching accordion pairs between `main section` and `On This Page`.
      const regex = new RegExp(`${storagePrepend}-accordion-(?<type>section-|tsd-otp-)(?<key>.*)`);
      const pairMaps = new Map();

      for (const [key, detailEl] of detailElMap)
      {
         const match = regex.exec(key);

         if (match)
         {
            // Found a paired detail element. Create unique shared key and store the element.
            const pairKey = `${storagePrepend}-accordion-section-otp-${match.groups.key}`;
            const pairSet = pairMaps.get(pairKey) ?? new Set();

            pairSet.add(detailEl);
            pairMaps.set(pairKey, pairSet);
         }
         else
         {
            // Otherwise hook up a "one off" details element.
            const store = this.detailsSessionStorage.getStore(key, detailEl.open);
            this.#actionUpdateFn.push(toggleDetails(detailEl, { store }).update);
         }
      }

      // Hook up paired details elements with the same store / shared key.
      for (const [key, detailElSet] of pairMaps)
      {
         const store = this.detailsSessionStorage.getStore(key, true);
         for (const detailEl of detailElSet)
         {
            this.#actionUpdateFn.push(toggleDetails(detailEl, { store }).update);
         }
      }

      // Add class to provide transition for svg chevron. This is manually added to avoid transform on page load.
      setTimeout(() =>
      {
         for (const detailEl of detailElMap.values())
         {
            const svgEl = detailEl.querySelector('summary svg');
            if (svgEl) { svgEl.classList.add('dmt-summary-svg'); }
         }
      }, 500);
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
