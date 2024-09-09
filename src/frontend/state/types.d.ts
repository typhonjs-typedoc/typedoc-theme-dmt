import type { NavigationElement }   from 'typedoc';

/**
 * Augments the TypeDoc NavigationElement with additional state data.
 */
type DMTNavigationElement = NavigationElement & {
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

/**
 * Defines an icon in {@link DMTToolbarIconLinks}.
 */
type DMTToolbarIconLink = {
   /**
    * URL for icon.
    */
   iconURL?: string;

   /**
    * Element title for hover / display.
    */
   title?: string;

   /**
    * Destination URL.
    */
   url: string;
}

/**
 * Defines the data for the `toolbarIconLinks` store for `IconLinks.svelte`.
 */
type DMTToolbarIconLinks = {
   /**
    * All icon link data combined.
    */
   icons: Iterable<DMTToolbarIconLink>;

   /**
    * Total icon width; used to calculate if hamburger menu is shown.
    */
   totalWidth?: number;
}

export {
   DMTNavigationElement,
   DMTToolbarIconLink,
   DMTToolbarIconLinks
}
