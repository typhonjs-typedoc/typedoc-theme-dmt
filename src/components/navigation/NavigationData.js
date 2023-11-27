import { writable }           from 'svelte/store';

import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

import { NavigationState }    from './NavigationState.js';

export class NavigationData
{
   /**
    * The documentation base URL.
    *
    * @type {string}
    */
   baseURL;

   /**
    * The current entry path URL.
    *
    * @type {string}
    */
   currentPathURL;

   /**
    * The current path URL store.
    *
    * @type {import('svelte/store').Writable<string>}
    */
   currentPathURLStore;

   /**
    * The navigation session storage store manager.
    *
    * @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage}
    */
   dmtSessionStorage;

   /**
    * The navigation index.
    *
    * @type {import('./types').DMTNavigationElement[]}
    */
   index;

   /**
    * The initial path URL.
    *
    * @type {string}
    */
   initialPathURL;

   /**
    * The relative path prepend for all entry path links.
    *
    * @type {string}
    */
   pathPrepend;

   /**
    * Navigation state control.
    *
    * @type {import('./NavigationState').NavigationState}
    */
   state;

   constructor(navigationIndex)
   {
      this.index = navigationIndex;

      this.dmtSessionStorage = new TJSSessionStorage();

      // Determine the depth in the static HTML paths to adjust a prepended relative path for all navigation links.
      this.baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
      this.initialPathURL = globalThis.location.href.replace(this.baseURL, '');

      // Find the path URL match without any additional URL fragment.
      const depth = (this.initialPathURL.match(/\//) ?? []).length;

      this.currentPathURL = this.initialPathURL;
      this.currentPathURLStore = writable(this.initialPathURL);

      this.pathPrepend = '../'.repeat(depth);

      this.state = new NavigationState(this);
   }

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL)
   {
      this.currentPathURL = pathURL;
      this.currentPathURLStore.set(pathURL);
   }
}
