import fs                  from 'node:fs';
import path                from 'node:path';

import { packAndDeflate }  from '#runtime/data/format/msgpack/compress';

import {
   ReflectionKind,
   RendererEvent }         from 'typedoc';

// Keep this in sync with `src/search-quick/SearchQuick.svelte`.
/**
 * @typedef {object} SearchNavDocument
 *
 * @property {number} i Index for trie-search.
 *
 * @property {import('typedoc').ReflectionKind} k The reflection kind.
 *
 * @property {string} n The reflection name.
 *
 * @property {string} u The reflection url.
 */

/**
 * Exports an index of the main navigation URLs and reflection data to a MessagePack file.
 *
 * The resulting MessagePack file can be loaded into `trie-search` for auto-complete quick search functionality.
 */
export class SearchQuickIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.once(RendererEvent.BEGIN, this.#onRendererBegin, this);
   }

   /**
    * Triggered after a document has been rendered, just before it is written to disc.
    *
    * @param {import('typedoc').RendererEvent}  event  An event object describing the current render operation.
    */
   #onRendererBegin(event)
   {
      if (event.isDefaultPrevented) { return; }

      const urlMappings = this.#app.renderer.theme.getUrls(event.project);

      /**
       * Creates a top level URL mapping for all main HTML pages.
       *
       * @type {SearchNavDocument[]}
       */
      const navSearchDocuments = urlMappings.filter((mapping) => mapping.model.kind !== ReflectionKind.Project).map(
       (mapping, i) => ({
         i,
         k: mapping.model.kind,
         n: mapping.model.getFullName(),
         u: mapping.url
      }));

      // Add optionally defined sidebar links to the data set.
      if (this.#app.options.isSet('sidebarLinks'))
      {
         const sidebarLinks = this.#app.options.getValue('sidebarLinks');

         for (const key in sidebarLinks)
         {
            navSearchDocuments.push({
               i: navSearchDocuments.length,
               n: key,
               u: sidebarLinks[key]
            });
         }
      }

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'search-quick.cmp'),
       packAndDeflate(navSearchDocuments));
   }
}