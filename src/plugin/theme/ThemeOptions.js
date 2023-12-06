import fs                  from 'node:fs';
import path                from 'node:path';
import { URL }             from 'node:url';

import { isObject }        from '#runtime/util/object';

import { ParameterType }   from 'typedoc';

/**
 * Defines and stores parsed DMT options.
 */
export class ThemeOptions
{
   static #ID = '[typedoc-theme-default-modern]';

   /**
    * @type {Map<string, FileOrURL>}
    */
   static #serviceLinks = new Map([
      ['BitBucket', {}],
      ['Discord', { filepath: './assets/icons/service/discord.png', filename: 'discord.png' }],
      ['GitHub', {}],
      ['GitLab', {}],
      ['NPM', {}],
   ]);

   /** @type {DMTOptions} */
   #options = {
      favicon: {},
      linksIcon: [],
      linksService: [],
      navRemoveModuleIcon: false,
      removeBreadcrumb: false,
      search: true,
      searchLimit: 10,
      searchQuick: false,
      searchQuickLimit: 10,
   };

   /**
    * @param {import('typedoc').Application} app -
    */
   static addDeclarations(app)
   {
      const ID = '[typedoc-theme-default-modern]';

      app.options.addDeclaration({
         name: 'dmtFavicon',
         help: `${ID} Specify the file path or URL of the favicon file.`,
         type: ParameterType.String,
         defaultValue: ''
      });

      app.options.addDeclaration({
         name: 'dmtLinksIcon',
         help: `${ID} Places provided icon links in toolbar links.`,
         type: ParameterType.Object,
         defaultValue: null
      });

      app.options.addDeclaration({
         name: 'dmtLinksService',
         help: `${ID} Places built-in icon links in toolbar links; supported services: BitBucket, Discord, GitHub, GitLab, NPM`,
         type: ParameterType.Object,
         defaultValue: null
      });

      app.options.addDeclaration({
         name: 'dmtNavRemoveModuleIcon',
         help: `${ID} When true SVG icons for all navigation module entries are removed.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtRemoveBreadcrumb',
         help: `${ID} When true the entire breadcrumb is removed.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtSearch',
         help: `${ID} When true the main search index is enabled.`,
         type: ParameterType.Boolean,
         defaultValue: true
      });

      app.options.addDeclaration({
         name: 'dmtSearchLimit',
         help: `${ID} A positive integer greater than 0 providing a limit on main search query results.`,
         type: ParameterType.Number,
         defaultValue: 10
      });

      app.options.addDeclaration({
         name: 'dmtSearchQuick',
         help: `${ID} When true the quick search index is enabled.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtSearchQuickLimit',
         help: `${ID} A positive integer greater than 0 providing a limit on quick search query results.`,
         type: ParameterType.Number,
         defaultValue: 10
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

   /** @returns {FileOrURL} favicon option */
   get favicon() { return this.#options.favicon; }

   /** @returns {DMTIconLink[]} linksIcon option */
   get linksIcon() { return this.#options.linksIcon; }

   /** @returns {DMTIconLink[]} linksService option */
   get linksService() { return this.#options.linksService; }

   /** @returns {boolean} navRemoveModuleIcon option */
   get navRemoveModuleIcon() { return this.#options.navRemoveModuleIcon; }

   /** @returns {boolean} removeBreadcrumb option */
   get removeBreadcrumb() { return this.#options.removeBreadcrumb; }

   /** @returns {boolean} search option */
   get search() { return this.#options.search; }

   /** @returns {number} search limit option */
   get searchLimit() { return this.#options.searchLimit; }

   /** @returns {boolean} searchQuick option */
   get searchQuick() { return this.#options.searchQuick; }

   /** @returns {number} search quick limit option */
   get searchQuickLimit() { return this.#options.searchQuickLimit; }

   /**
    * Parses DMT options.
    *
    * @param {import('typedoc').Application} app -
    */
   #parseOptions(app)
   {
      this.#options.navRemoveModuleIcon = app.options.getValue('dmtNavRemoveModuleIcon');
      this.#options.removeBreadcrumb = app.options.getValue('dmtRemoveBreadcrumb');
      this.#options.search = app.options.getValue('dmtSearch');
      this.#options.searchLimit = app.options.getValue('dmtSearchLimit');
      this.#options.searchQuick = app.options.getValue('dmtSearchQuick');
      this.#options.searchQuickLimit = app.options.getValue('dmtSearchQuickLimit');

      // Validate options --------------------------------------------------------------------------------------------

      this.#options.favicon = ThemeOptions.#validateFileOrURL(app, app.options.getValue('dmtFavicon'), 'dmtFavicon');

      const linksIcon = app.options.getValue('dmtLinksIcon');

      /** @type {Record<string, string>} */
      const linksService = app.options.getValue('dmtLinksService');

      if (isObject(linksService))
      {
         for (const key in linksService)
         {
            if (!ThemeOptions.#serviceLinks.has(key))
            {
               app.logger.warn(`${ThemeOptions.#ID} Unknown service link '${key}'; supported services: ${
                [...ThemeOptions.#serviceLinks.keys()].join(', ')}`);

               continue;
            }

            if (!ThemeOptions.#isURL(linksService[key]))
            {
               app.logger.warn(`${ThemeOptions.#ID} Invalid URL for service link '${key}'.`);

               continue;
            }

            this.#options.linksService.push({
               asset: ThemeOptions.#serviceLinks.get(key),
               title: key,
               url: linksService[key]
            });
         }
      }

      // Verify search limits.
      if (!Number.isInteger(this.#options.searchLimit) || this.#options.searchLimit < 1)
      {
         app.logger.warn(`${ThemeOptions.#ID
          } 'dmtSearchLimit' must be a positive integer greater than '0'; setting to default of '10'`);

         this.#options.searchLimit = 10;
      }

      if (!Number.isInteger(this.#options.searchQuickLimit) || this.#options.searchQuickLimit < 1)
      {
         app.logger.warn(`${ThemeOptions.#ID
          } 'dmtSearchQuickLimit' must be a positive integer greater than '0'; setting to default of '10'`);

         this.#options.searchQuickLimit = 10;
      }
   }

   /**
    * @param {import('typedoc').Application} app - Typedoc Application.
    *
    * @param {string}   pathOrURL - File path or URL to validate.
    *
    * @param {string}   optionName - Associated DMT option name.
    *
    * @returns {FileOrURL} Parsed FileOrURL object; may be empty.
    */
   static #validateFileOrURL(app, pathOrURL, optionName)
   {
      if (typeof pathOrURL !== 'string' || pathOrURL.length === 0) { return {}; }

      const result = {};

      try
      {
         if (ThemeOptions.#isURL(pathOrURL))
         {
            result.url = pathOrURL;
         }
         else
         {
            const filepath = path.resolve(pathOrURL);

            fs.accessSync(filepath, fs.constants.R_OK);

            result.filepath = filepath;
            result.filename = path.basename(filepath);
         }
      }
      catch (err)
      {
         app.logger.warn(`${ThemeOptions.#ID} '${optionName}' path / URL did not resolve: ${pathOrURL}`);
      }

      return result;
   }
}

/**
 * @typedef {object} DMTOptions
 *
 * @property {{ filepath?: string, filename?: string, url?: string }} [favicon] Parsed data about any defined favicon.
 *
 * @property {DMTIconLink[]} linksIcon Provided icon links placed in the toolbar links.
 *
 * @property {DMTIconLink[]} linksService Built-in service icon links placed in the toolbar links.
 *
 * @property {boolean} navRemoveModuleIcon When true SVG icons for all navigation module entries are removed.
 *
 * @property {boolean} removeBreadcrumb When true the entire breadcrumb is removed.
 *
 * @property {boolean} search When true the main search index is enabled.
 *
 * @property {number} searchLimit A positive integer greater than 0 providing a limit on main search query results.
 *
 * @property {boolean} searchQuick When true the quick search index is enabled.
 *
 * @property {number} searchQuickLimit A positive integer greater than 0 providing a limit on quick search query
 *           results.
 */
