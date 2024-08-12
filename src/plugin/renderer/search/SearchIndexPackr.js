import fs                  from 'node:fs';
import path                from 'node:path';

import { packAndDeflate }  from '#runtime/data/format/msgpack/compress';

import lunr                from 'lunr';

import {
   IndexEvent,
   RendererEvent,
   DeclarationReflection,
   DocumentReflection,
   ProjectReflection,
   ReflectionKind }        from 'typedoc';

/**
 * A plugin that exports an index of the project to a MessagePack file.
 *
 * The resulting MessagePack file can be fetched and used to build a simple search function.
 */
export class SearchIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {boolean} */
   #searchFullName;

   /** @type {boolean} */
   #searchInComments;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   constructor(app, options)
   {
      this.#app = app;

      this.#app.renderer.on(RendererEvent.BEGIN, this.#onRendererBegin.bind(this), -100);

      this.#searchInComments = this.#app.options.getValue('searchInComments');
      this.#searchFullName = options.search.fullName;
   }

   /**
    * Triggered after a document has been rendered, just before it is written to disc.
    *
    * @param {import('typedoc').RendererEvent}  event  An event object describing the current render operation.
    */
   #onRendererBegin(event)
   {
      /** @type {SearchDocument[]} */
      const rows = [];

      /** @type {(DeclarationReflection | DocumentReflection)[]} */
      const initialSearchResults = Object.values(event.project.reflections).filter((refl) =>
      {
         return (refl instanceof DeclarationReflection || refl instanceof DocumentReflection) && refl.url &&
          refl.name && !refl.flags.isExternal;
      });

      const indexEvent = new IndexEvent(initialSearchResults);
      this.#app.renderer.trigger(IndexEvent.PREPARE_INDEX, indexEvent);

      // Custom trimmer function that allows leading `#` and `@`.
      const customTrimmer = function(token)
      {
         return token.update((s) => s.replace(/^[^\w#@]+/, '').replace(/[^\w#@]+$/, ''));
      };

      // Register the custom trimmer in lunr pipeline.
      lunr.Pipeline.registerFunction(customTrimmer, 'customTrimmer');

      /** @type {import('lunr').Builder} */
      const builder = new lunr.Builder();
      builder.pipeline.add(customTrimmer);

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

         // Filter out intermediary or anonymous reflections from search index ---------------------------------------
         // See: TypeDoc `lib/converter/types.ts`.

         // Ignore anonymous constructor functions.
         if (reflection.kind === ReflectionKind.Constructor && reflection.name === '__type') { continue; }

         // Ignore type literals as they are an intermediary AST node.
         if (reflection.kind === ReflectionKind.TypeLiteral) { continue; }

         let parent = reflection.parent;
         if (parent instanceof ProjectReflection) { parent = void 0; }

         // When the parent is a type literal determine if the further ancestor parent is a DeclarationReflection.
         // If so then assign the ancestor parent as the parent otherwise reject this reflection.
         if (parent && parent.kind === ReflectionKind.TypeLiteral)
         {
            if (parent?.parent instanceof DeclarationReflection) { parent = parent.parent; }
            else { continue; }
         }

         // ----------------------------------------------------------------------------------------------------------

         const boost = reflection.relevanceBoost ?? 1;
         if (boost <= 0) { continue; }

         /** @type {SearchDocument} */
         const row = {
            k: reflection.kind,
            n: reflection.name,
            u: reflection.url,
            c: this.#app.renderer.theme.getReflectionClasses(reflection),
         };

         if (parent)
         {
            // Depending on options store full name or just the parent name.
            row.p = this.#searchFullName ? parent.getFriendlyFullName() : parent.name;
            row.pk = parent.kind;
         }

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

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'dmt-search.cmp'),
       packAndDeflate({ rows, index }));
   }

   /**
    * @param {DeclarationReflection} reflection -
    *
    * @returns {string | undefined} Reflection comment to add.
    */
   #getCommentSearchText(reflection)
   {
      /** @type {import('typedoc').Comment[]} */
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
