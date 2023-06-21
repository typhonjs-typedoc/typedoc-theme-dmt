import fs                from 'node:fs';
import path              from 'node:path';
import { URL }           from 'node:url';

import { ParameterType } from 'typedoc';

/**
 * Defines and stores parsed DMT options.
 */
export class ThemeOptions
{
   /** @type {DMTOptions} */
   #options = {
      removeDefaultModule: false
   };

   /**
    * @param {import('typedoc').Application} app -
    */
   static addDeclarations(app)
   {
      app.options.addDeclaration({
         name: 'dmtFavicon',
         help: '[typedoc-theme-default-modern] Specify the file path or URL of the favicon file.',
         type: ParameterType.String,
         defaultValue: null
      });

      app.options.addDeclaration({
         name: 'dmtRemoveBreadcrumb',
         help: '[typedoc-theme-default-modern] When true the entire breadcrumb is removed.',
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtRemoveDefaultModule',
         help: '[typedoc-theme-default-modern] When true the default module / namespace is removed from navigation ' +
          'and breadcrumbs.',
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtSearch',
         help: '[typedoc-theme-default-modern] When true the main search index is enabled.',
         type: ParameterType.Boolean,
         defaultValue: true
      });

      app.options.addDeclaration({
         name: 'dmtSearchQuick',
         help: '[typedoc-theme-default-modern] When true the quick search index is enabled.',
         type: ParameterType.Boolean,
         defaultValue: true
      });
   }

   /**
    * Helper function to test if value is a URL.
    *
    * @param {string}   value - String to test.
    *
    * @returns {boolean} Is valid URL?
    */
   static #isURL(value)
   {
      try
      {
         new URL(value);
         return true;
      }
      catch (err)
      {
         return false;
      }
   }

   /**
    * Verifies and parses theme related options.
    *
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#parseOptions(app);
   }

   /** @returns {{filepath?: string, filename?: string, url?: string}} favicon option */
   get favicon() { return this.#options.favicon; }

   /** @returns {boolean} removeBreadcrumb option */
   get removeBreadcrumb() { return this.#options.removeBreadcrumb; }

   /** @returns {boolean} removeDefaultModule option */
   get removeDefaultModule() { return this.#options.removeDefaultModule; }

   /** @returns {boolean} search option */
   get search() { return this.#options.search; }

   /** @returns {boolean} searchQuick option */
   get searchQuick() { return this.#options.searchQuick; }

   /**
    * Parses DMT options.
    *
    * @param {import('typedoc').Application} app -
    */
   #parseOptions(app)
   {
      this.#options.removeBreadcrumb = app.options.getValue('dmtRemoveBreadcrumb');
      this.#options.removeDefaultModule = app.options.getValue('dmtRemoveDefaultModule');
      this.#options.search = app.options.getValue('dmtSearch');
      this.#options.searchQuick = app.options.getValue('dmtSearchQuick');

      const dmtFavicon = app.options.getValue('dmtFavicon');

      // Verify dmtFavicon path if defined.
      if (typeof dmtFavicon === 'string' && dmtFavicon.length)
      {
         try
         {
            const favicon = {};

            if (ThemeOptions.#isURL(dmtFavicon))
            {
               favicon.url = dmtFavicon;
            }
            else
            {
               const faviconPath = path.resolve(dmtFavicon);

               fs.accessSync(faviconPath, fs.constants.R_OK);

               favicon.filepath = faviconPath;
               favicon.filename = path.basename(faviconPath);
            }

            this.#options.favicon = favicon;
         }
         catch (err)
         {
            app.logger.warn(`[typedoc-theme-default-modern] 'dmtFavicon' path / URL did not resolve: ${dmtFavicon}`);
         }
      }
   }
}

/**
 * @typedef {object} DMTOptions
 *
 * @property {{ filepath?: string, filename?: string, url?: string }} [favicon] Parsed data about any defined favicon.
 *
 * @property {boolean} [removeBreadcrumb] When true the entire breadcrumb is removed.
 *
 * @property {boolean} [removeDefaultModule] When true the default module / namespace is removed from navigation and
 *           breadcrumbs.
 *
 * @property {boolean} [search] When true the main search index is enabled.
 *
 * @property {boolean} [searchQuick] When true the quick search index is enabled.
 */