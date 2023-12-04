import { TJSLocalStorage } from '#runtime/svelte/store/web-storage';

/**
 * Provides a TJSLocalStorage instance prefetching storage stores of interest.
 */
export class DMTLocalStorage extends TJSLocalStorage
{
   constructor()
   {
      super();

      this.getStore('docs-dmt-animate', true);

      this.getStore('tsd-accordion-index', false);
      this.getStore('tsd-accordion-on-this-page', false);
      this.getStore('tsd-accordion-settings', false);
   }
}
