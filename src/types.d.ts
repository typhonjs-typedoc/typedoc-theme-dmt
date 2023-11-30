/**
 * Provides the shared data types between the DMT plugin backend and component front end. The global / window
 * declaration defines the data available on the front end runtime.
 *
 * @module
 */

import type lunr                    from 'lunr';
import type { ReflectionKind }      from 'typedoc';

import type { NavigationElement }   from 'typedoc';

import type { TrieSearch }          from '#runtime/data/struct/search/trie';

import type {
   inflateAndUnpack,
   inflateAndUnpackB64 }            from '#runtime/data/format/msgpack/compress';

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

export type DMTComponentData = {
   /**
    * Default navigation links
    */
   navigationLinks?: Record<string, string>;

   /**
    * Default navigation index.
    */
   navigationIndex?: NavigationElement[];

   /**
    * Default sidebar links.
    */
   sidebarLinks?: Record<string, string>;
}

/**
 * Defines the global DMT options available in the frontend runtime.
 */
export type DMTGlobalOptions = {
   /**
    * The base path from the current page.
    */
   basePath: string;

   /**
    * When true and there is more than one top level tree node navigation controls are displayed.
    */
   navControls: boolean;

   /**
    * Removes the top level namespace / module SVG icon. This is useful when documenting packages w/ sub-path exports.
    */
   removeNavTopLevelIcon: boolean;

   /**
    * The `dmtSearch` option; when true the main search index is active.
    */
   search: boolean;

   /**
    * The `dmtSearchLimit` option; The max number of documents returned in the main search query processing.
    */
   searchLimit: number;

   /**
    * The `dmtSearchQuick` option; when true the quick search index is active.
    */
   searchQuick: boolean;

   /**
    * The `dmtSearchQuickLimit` option; The max number of documents returned in the main search query processing.
    */
   searchQuickLimit: number;

   /**
    * Provides a key based on the package name or a random string to prepend to local / session storage keys.
    */
   storagePrepend: string;
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

      /**
       * Defines DMT plugin options used at the global scope. Configured in DMT plugin / `PageRenderer.#addAssets`.
       */
      dmtOptions: DMTGlobalOptions
   }
}
