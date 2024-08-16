import { TJSLocalStorage }    from '#runtime/svelte/store/web-storage';
import { A11yHelper }         from '#runtime/util/browser';

import { DetailsAnimation }   from '../augment/DetailsAnimation.js';

import { localConstants }     from '#constants';

export class DMTLocalStorage extends TJSLocalStorage
{
   constructor()
   {
      super();

      // Ensure that the setting / animate local storage store is initialized with A11y motion preference.
      const storeAnimate = this.getStore(localConstants.dmtThemeAnimate, !A11yHelper.prefersReducedMotion);

      // Manages the native TypeDoc details elements adding animation.
      new DetailsAnimation(storeAnimate);
   }
}
