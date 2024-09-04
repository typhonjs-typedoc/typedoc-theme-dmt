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

import type lunr                       from 'lunr';

import type {
   NavigationElement,
   ReflectionKind }                    from 'typedoc';

export type DMTComponentDataBCMP = {
   /**
    * The combined user icon / service header links.
    */
   iconLinks: {
      service: DMTIconLink[],
      user: DMTIconLink[]
   };

   pageIndex: {
      /**
       * The relative path to any `hierarchy` index.
       */
      hierarchy: string | undefined;

      /**
       * The relative path to any `modules` index.
       */
      modules: string | undefined;
   }

   /**
    * When true 'Module' in page titles is replaced with 'Package'.
    */
   moduleIsPackage: boolean;

   /**
    * Navigation index for separate markdown and source trees.
    */
   navigationIndex: DMTNavigationIndex;

   /**
    * TypeDoc ReflectionKind
    */
   ReflectionKind: Record<string, string|number>;

   /**
    * The `dmtSearch` option; when truthy the main search index is active.
    */
   searchOptions: DMTSearchOptions;

   /**
    * When true SVG icons for all module reflections are displayed.
    */
   showModuleIcon: boolean;

   /**
    * Combined `sidebarLinks` and `navigationLinks`.
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
 * Navigation index for separate markdown and source trees.
 */
export type DMTNavigationIndex = {
   markdown: NavigationElement[];
   source: NavigationElement[];
}

/**
 * Defines the DMT search options; may be a boolean or object. When `false` search is disabled.
 */
export type DMTSearchOptions = false | {
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
