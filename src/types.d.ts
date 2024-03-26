/**
 * Provides the shared data types between the DMT plugin backend and component front end. The global / window
 * declaration defines the data available on the front end runtime.
 *
 * @module
 */

import type {
   inflateAndUnpack,
   inflateAndUnpackB64 }               from '#runtime/data/format/msgpack/compress';

import type { TrieSearch }             from '#runtime/data/struct/search/trie';
import type { TJSLocalStorage }        from '#runtime/svelte/store/web-storage';

import type lunr                       from 'lunr';

import type {
   NavigationElement,
   ReflectionKind }                    from 'typedoc';

import type { INavigationData }        from './components/navigation/types.ts';

export type DMTComponentData = {
   /**
    * Relative path to the documentation root from current page.
    */
   basePath: string;

   /**
    * Full base URL to documentation root.
    */
   baseURL: string;

   /**
    * Local storage store manager.
    */
   dmtLocalStorage: TJSLocalStorage;

   /**
    * Full URL to assets/dmt.
    */
   dmtURL: string;

   /**
    * True when a project `modules.html` is generated.
    */
   hasModulesIndex: boolean;

   /**
    * Initial path URL for current page.
    */
   initialPathURL: string;

   /**
    * Resolved user icon links.
    */
   linksIcon: DMTIconLink[];

   /**
    * Resolved service icon links.
    */
   linksService: DMTIconLink[];

   /**
    * When true 'Module' in page titles is replaced with 'Package'.
    */
   moduleIsPackage: boolean;

   /**
    * Default navigation links
    */
   navigationLinks?: Record<string, string>;

   /**
    * NavigationData instance.
    */
   navigationData: INavigationData;

   /**
    * Default navigation index.
    */
   navigationIndex: NavigationElement[];

   /**
    * When true SVG icons for all navigation module entries are displayed.
    */
   navModuleIcon: boolean;

   /**
    * The `dmtSearch` option; when true the main search index is active.
    */
   search: DMTSearch;

   /**
    * TypeDoc ReflectionKind
    */
   ReflectionKind: Record<string, string|number>;

   /**
    * Default sidebar links.
    */
   sidebarLinks?: Record<string, string>;

   /**
    * Provides a key based on the package name or a random string to prepend to local / session storage keys.
    */
   storagePrepend: string;
}

/**
 * Defines a toolbar icon link.
 */
export type DMTIconLink = {
   /**
    * Parsed local file or URL.
    */
   asset: FileOrURL;

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
 * Defines module reflection remapping options.
 */
export type DMTModuleRemap = {
   /**
    * When true 'Module' in page titles is replaced with 'Package'.
    */
   isPackage: boolean;

   /**
    * Module reflection name substitution.
    */
   names: Record<string, string>;

   /**
    * Module name to `README.md` file path.
    */
   readme: Record<string, string>;
}

/**
 * Defines navigation options.
 */
export type DMTNavigation = {
   /**
    * Show module icons.
    */
   moduleIcon: boolean;

   /**
    * The navigation style. The default is 'full' for full tree, 'compact' is for the full tree with intermediary
    * folders w/ no children compacted, 'flat' is for no module folders.
    */
   style: 'compact' | 'flat' | 'full';
}

/**
 * Defines the DMT search options; may be a boolean or object. When `false` search is disabled.
 */
export type DMTSearch = false | {
   /**
    * Include full parent names.
    */
   fullName: boolean;

   /**
    * Limit on search results to return.
    */
   limit: number;
};

export type FileOrURL = {
   /**
    * Fully resolved file path.
    */
   filepath: string;

   /**
    * File name
    */
   filename: string;
} | {
   /**
    * Valid URL.
    */
   url: string;
}

/**
 * Provides the main search document entry structure.
 */
export interface SearchDocument {
   /**
    * The reflection kind.
    */
   k: ReflectionKind;

   /**
    * The reflection name.
    */
   n: string;

   /**
    * The reflection url.
    */
   u: string;

   /**
    * Any reflection classes.
    */
   c?: string;

   /**
    * Any reflection parents.
    */
   p?: string;

   /**
    * The parent reflection kind.
    */
   pk?: number;
}

/**
 * Provides the quick search document entry structure.
 */
export interface SearchQuickDocument
{
   /**
    * Index for trie-search.
    */
   i: number;

   /**
    * The TypeDoc reflection kind.
    */
   k: ReflectionKind;

   /**
    * The reflection name.
    */
   n: string;

   /**
    * The reflection url.
    */
   u: string;
}

/**
 * Defines global variables available at runtime for front end components.
 */
declare global {
   interface Window {
      /**
       * Provides the compressed MessagePack global component data.
       */
      dmtComponentDataBCMP: string,

      /**
       * Loaded DMT Svelte components.
       */
      dmtComponents: {
         navigation: { ensureCurrentPath: () => void }
      };

      /**
       * Provides `inflateAndUnpack` to inflate and unpack MessagePack binary data.
       */
      dmtInflateAndUnpack: typeof inflateAndUnpack,

      /**
       * Provides `inflateAndUnpackB64` to decode a base 64 string, inflate, and unpack MessagePack binary data.
       */
      dmtInflateAndUnpackB64: typeof inflateAndUnpackB64,

      /**
       * When the main search is enabled provides a Lunr.Index instance.
       */
      dmtSearchMainIndex?: lunr.Index;

      /**
       * When the main search is enabled provides an array of SearchDocuments.
       */
      dmtSearchMainRows?: SearchDocument[];

      /**
       * When quick search is enabled provides a TrieSearch instance for the children reflections of the current page.
       */
      dmtSearchQuickPage?: TrieSearch<SearchQuickDocument>;

      /**
       * When quick search is enabled provides a TrieSearch instance for the navigation reflections plus sidebar links.
       */
      dmtSearchQuickNav?: TrieSearch<SearchQuickDocument>;
   }
}
