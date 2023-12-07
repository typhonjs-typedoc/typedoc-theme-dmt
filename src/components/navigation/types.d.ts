import type {
   Readable,
   Writable }                       from 'svelte/store';

import type { TJSSessionStorage }   from '#runtime/svelte/store/web-storage';

import type { NavigationElement }   from 'typedoc';

export type DMTNavigationElement = NavigationElement & {
   /**
    * A storage key if this element / entry is a tree node w/ children.
    */
   storageKey?: string;

   /**
    * On initial load `NavigationState.openCurrentPath` searches the navigation index and sets `opened` for any
    * tree nodes where the path URL matches an entry path.
    */
   opened?: boolean;
}

export interface INavigationData {
   /**
    * The relative path prepend for all entry path links.
    *
    * @type {string}
    */
   basePath: string;

   /**
    * The documentation base URL.
    *
    * @type {string}
    */
   baseURL: string;

   /**
    * The current entry path URL.
    *
    * @type {string}
    */
   currentPathURL: string;

   /**
    * The current path URL store.
    *
    * @type {import('svelte/store').Writable<string>}
    */
   storeCurrentPathURL: Writable<string>;

   /**
    * The navigation session storage store manager.
    *
    * @type {import('#runtime/svelte/store/web-storage').TJSSessionStorage}
    */
   dmtSessionStorage: TJSSessionStorage;

   /**
    * The navigation index.
    *
    * @type {DMTNavigationElement[]}
    */
   index: DMTNavigationElement[];

   /**
    * The initial path URL.
    *
    * @type {string}
    */
   initialPathURL: string;

   /**
    * Navigation state control.
    *
    * @type {import('./NavigationState.js').NavigationState}
    */
   state: NavigationState;

   /**
    * A derived store with the open / close state of all session stores.
    *
    * @type {import('svelte/store').Readable<boolean>}
    */
   storeSessionAllOpen: Readable<boolean>;

   /**
    * Indicates the count of top level nodes if there are entries with children / tree nodes present.
    *
    * @type {import('svelte/store').Writable<number>}
    */
   storeTopLevelNodes: Writable<number>;

   /**
    * Creates derived stores after the navigation tree / index state has been initialized.
    */
   createDerivedStores(): void;

   /**
    * Closes or opens all navigation folders / session store state.
    *
    * @param {boolean}  state - New open / close state.
    */
   setStoresAllOpen(state: boolean): void;

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL: string): void;
}
