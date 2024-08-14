import type {
   Readable,
   Writable }                       from 'svelte/store';

import type { NavigationElement }   from 'typedoc';

export type DMTNavigationElement = NavigationElement & {
   /**
    * A storage key if this element / entry is a tree node w/ children.
    */
   storageKey?: string;

   /**
    * On initial load `TreeState.openCurrentPath` searches the navigation index and sets `opened` for any
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
    * Markdown tree state control.
    *
    * @type {import('./TreeState.js').TreeState}
    */
   treeStateMarkdown: import('./TreeState.js').TreeState;

   /**
    * Navigation tree state control.
    *
    * @type {import('./TreeState.js').TreeState}
    */
   treeStateSource: import('./TreeState.js').TreeState;

   /**
    * A derived store with the open / close state of all session stores.
    *
    * @type {import('svelte/store').Readable<boolean>}
    */
   storeSessionAllOpen: Readable<boolean>;

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
