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
    * @returns {string} The relative path prepend for all entry path links.
    */
   get basePath(): string;

   /**
    * @returns {string} The documentation base URL.
    */
   get baseURL(): string;

   /**
    * @returns {string} The current tree state entry path URL.
    */
   get currentPathURL(): string;

   /**
    * @returns {string} The initial path URL.
    */
   get initialPathURL(): string;

   /**
    * @returns {Readable<string>} The current tree state entry path URL store.
    */
   get storeCurrentPathURL(): Readable<string>;

   /**
    * @returns {Writable<boolean>}
    */
   get storeHelpPanelOpen(): Writable<boolean>;

   /**
    * @returns The tree state control.
    */
   get treeState(): import('./navigation/TreeStateControl.js').TreeStateControl;

   /**
    * Sets the current path URL local data and store.
    *
    * @param {string}   pathURL - New current path URL.
    */
   setCurrentPathURL(pathURL: string): void;

   /**
    * Swaps the help panel open state.
    */
   swapHelpPanelOpen(): void;
}
