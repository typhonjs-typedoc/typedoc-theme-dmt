const fs                   = require('node:fs');
const path                 = require('node:path');
const { pack }             = require('msgpackr');

const { Builder, trimmer } = require('lunr');

const {
   IndexEvent,
   RendererEvent,
   Comment,
   DeclarationReflection,
   ProjectReflection }     = require('typedoc');

/**
 * Keep this in sync with the interface in src/lib/output/themes/default/assets/typedoc/components/Search.ts
 */
// interface SearchDocument {
//    kind: number;
//    name: string;
//    url: string;
//    classes?: string;
//    parent?: string;
// }
/**
 * @typedef {object} SearchDocument
 *
 * @property {import('typedoc').ReflectionKind} k The reflection kind.
 *
 * @property {string} n The reflection name.
 *
 * @property {string} u The reflection url.
 *
 * @property {string} [c] Any reflection classes.
 *
 * @property {string} [p] Any reflection parents.
 */


/**
 * A plugin that exports an index of the project to a MessagePack file.
 *
 * The resulting MessagePack file can be fetched and used to build a simple search function.
 */
class SearchIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {boolean} */
   #searchInComments;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.once(RendererEvent.BEGIN, this.#onRendererBegin, this);

      this.#searchInComments = this.#app.options.getValue('searchInComments');
   }

   /**
    * Triggered after a document has been rendered, just before it is written to disc.
    *
    * @param {import('typedoc').RendererEvent}  event  An event object describing the current render operation.
    */
   #onRendererBegin(event)
   {
      if (event.isDefaultPrevented) { return; }

      /** @type {SearchDocument[]} */
      const rows = [];

      /** @type {DeclarationReflection[]} */
      const initialSearchResults = Object.values(event.project.reflections).filter((refl) =>
      {
         return refl instanceof DeclarationReflection && refl.url && refl.name && !refl.flags.isExternal;
      });

      const indexEvent = new IndexEvent(IndexEvent.PREPARE_INDEX, initialSearchResults);
      this.#app.renderer.trigger(indexEvent);

      if (indexEvent.isDefaultPrevented) { return; }

      /** @type {import('lunr').Builder} */
      const builder = new Builder();
      builder.pipeline.add(trimmer);

      builder.ref('i');
      for (const [key, boost] of Object.entries(indexEvent.searchFieldWeights))
      {
         switch (key)
         {
            case 'comment':
               if (this.#searchInComments)
               {
                  builder.field('c', { boost });
               }
               break;

            case 'name':
               builder.field('n', { boost });
               break;

            default:
               builder.field(key, { boost });
               break;
         }
      }

      for (const reflection of indexEvent.searchResults)
      {
         if (!reflection.url) { continue; }

         const boost = reflection.relevanceBoost ?? 1;
         if (boost <= 0) { continue; }

         let parent = reflection.parent;
         if (parent instanceof ProjectReflection) { parent = void 0; }

         /** @type {SearchDocument} */
         const row = {
            k: reflection.kind,
            n: reflection.name,
            u: reflection.url,
            c: this.#app.renderer.theme.getReflectionClasses(reflection),
         };

         if (parent) { row.p = parent.getFullName(); }

         const externalSearchField = indexEvent.searchFields[rows.length];

         const buildEntry = {
            n: externalSearchField?.name ?? reflection.name,
            i: rows.length,
         };

         if (this.#searchInComments)
         {
            buildEntry.c = externalSearchField?.comment ?? this.#getCommentSearchText(reflection);
         }

         builder.add(
            buildEntry,
            { boost }
         );
         rows.push(row);
      }

      const index = builder.build();

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'search.msgpack'), pack({ rows, index }));
   }

   /**
    * @param {DeclarationReflection} reflection -
    *
    * @returns {string}
    */
   #getCommentSearchText(reflection)
   {
      /** @type {Comment[]} */
      const comments = [];

      if (reflection.comment) { comments.push(reflection.comment); }

      reflection.signatures?.forEach((s) => s.comment && comments.push(s.comment));

      reflection.getSignature?.comment && comments.push(reflection.getSignature.comment);

      if (!comments.length) { return; }

      return comments
       .flatMap((c) => { return [...c.summary, ...c.blockTags.flatMap((t) => t.content)]; })
       .map((part) => part.text)
       .join('\n');
   }
}

module.exports = {
   SearchIndexPackr
};