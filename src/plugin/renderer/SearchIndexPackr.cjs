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
 * A plugin that exports an index of the project to a javascript file.
 *
 * The resulting javascript file can be used to build a simple search function.
 */
class SearchIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {boolean} */
   searchComments;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.once(RendererEvent.BEGIN, this.#onRendererBegin, this)
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

      const builder = new Builder();
      builder.pipeline.add(trimmer);

      builder.ref('i');
      for (const [key, boost] of Object.entries(indexEvent.searchFieldWeights))
      {
         builder.field(key, { boost });
      }

      for (const reflection of indexEvent.searchResults)
      {
         if (!reflection.url) { continue; }

         const boost = reflection.relevanceBoost ?? 1;
         if (boost <= 0) { continue; }

         let parent = reflection.parent;
         if (parent instanceof ProjectReflection) { parent = undefined; }

         /** @type {SearchDocument} */
         const row = {
            k: reflection.kind,
            n: reflection.name,
            u: reflection.url,
            c: this.#app.renderer.theme.getReflectionClasses(reflection),
         };

         if (parent) { row.p = parent.getFullName(); }

         const externalSearchField = indexEvent.searchFields[rows.length];

         builder.add({
             n: externalSearchField?.name ?? reflection.name,
             c: externalSearchField?.comment ?? this.#getCommentSearchText(reflection),
             i: rows.length,
          },
          { boost }
         );
         rows.push(row);
      }

      const index = builder.build();

      const packrFileName = path.join(event.outputDirectory, 'assets', 'search.msgpack');

      fs.writeFileSync(packrFileName, pack({ rows, index }));
   }

   /**
    * @param {DeclarationReflection} reflection
    *
    * @returns {string}
    */
   #getCommentSearchText(reflection)
   {
      if (!this.searchComments) { return; }

      /** @type {Comment[]} */
      const comments = [];

      if (reflection.comment) { comments.push(reflection.comment); }

      reflection.signatures?.forEach((s) => s.comment && comments.push(s.comment));

      reflection.getSignature?.comment && comments.push(reflection.getSignature.comment);
      reflection.setSignature?.comment && comments.push(reflection.setSignature.comment);

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