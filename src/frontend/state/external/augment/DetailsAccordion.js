import { toggleDetails }      from '#runtime/svelte/action/dom/properties';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

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
   static #toggleDetailsActionReturns = [];

   /**
    * @type {TJSSessionStorage}
    */
   static #detailsSessionStorage = new TJSSessionStorage();

   /**
    * Stores the `On This Page` storage key.
    *
    * @type {string}
    */
   static #onThisPageKey;

   /**
    * @returns {TJSSessionStorage} The session storage manager for all details elements.
    */
   static get sessionStorage() { return this.#detailsSessionStorage; }

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

   /**
    * Opens `On This Page` and potentially focuses summary element.
    *
    * @param {object} [options] - Optional parameters.
    *
    * @param {boolean} [options.focus=true] - Focus first internal element.
    */
   static openOnThisPage({ focus = true } = {})
   {
      /** @type {HTMLDetailsElement} */
      const detailsEl = globalThis.document.querySelector('details.tsd-page-navigation');
      if (detailsEl)
      {
         const summaryEl = detailsEl.querySelector('summary');

         if (summaryEl)
         {
            if (this.#detailsSessionStorage.hasStore(this.#onThisPageKey))
            {
               this.#detailsSessionStorage.getStore(this.#onThisPageKey).set(true);
            }

            if (focus) { setTimeout(() => summaryEl.focus({ focusVisible: true }), 0); }
         }
      }
   }

   // Internal implementation ----------------------------------------------------------------------------------------

   static #initializeDetails(storagePrepend)
   {
      const detailElList = /** @type {NodeListOf<HTMLDetailsElement>} */ document.querySelectorAll(
       'details.tsd-accordion');

      /** @type {Map<string, Set<HTMLDetailsElement>>} */
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

         if (key === `${storagePrepend}-accordion-on-this-page`) { this.#onThisPageKey = key; }

         if (typeof key === 'string' && key.length)
         {
            const detailElSet = detailElMap.get(key);

            if (detailElSet)
            {
               detailElSet.add(detailEl);
            }
            else
            {
               detailElMap.set(key, new Set([detailEl]));
            }
         }
      }

      const urlHash = globalThis.location.hash;

      // Hook up paired details elements with the same store / shared key.
      for (const [key, detailElSet] of detailElMap)
      {
         const store = this.#detailsSessionStorage.getStore(key, true);

         // If there is a URL hash check if any child element of details element matches the hash and set the backing
         // session store open. This handles the case if the section is closed and the page is reloaded with a hash in
         // the closed section ensuring that scrolling to the hash occurs.
         if (urlHash)
         {
            for (const detailEl of detailElSet)
            {
               const forceOpen = Array.from(detailEl.querySelectorAll('*')).find((child) => `#${child.id}` === urlHash);
               if (forceOpen) { store.set(true); }
            }
         }

         for (const detailEl of detailElSet)
         {
            this.#toggleDetailsActionReturns.push(toggleDetails(detailEl, { store }));

            // Ensure that when TypeDoc modifies the open state to update store.
            detailEl.addEventListener('toggle', (event) => store.set(event.target.open));
         }
      }

      // Add class to provide transition for svg chevron. This is manually added to avoid transform on page load.
      setTimeout(() =>
      {
         for (const detailElSet of detailElMap.values())
         {
            for (const detailEl of detailElSet)
            {
               const svgEl = detailEl.querySelector('summary svg');
               if (svgEl) { svgEl.classList.add('dmt-summary-svg'); }
            }
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
      for (const actionReturn of this.#toggleDetailsActionReturns) { actionReturn?.update({ animate }); }
   }
}
