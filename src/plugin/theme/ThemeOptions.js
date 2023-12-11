import fs                  from 'node:fs';
import path                from 'node:path';
import {
   fileURLToPath,
   URL }                   from 'node:url';

import { isObject }        from '#runtime/util/object';

import { ParameterType }   from 'typedoc';

/**
 * Defines and stores parsed DMT options.
 */
export class ThemeOptions
{
   static #ID = '[typedoc-theme-default-modern]';

   /** @type {DMTOptions} */
   #options = {
      breadcrumb: true,
      favicon: {},
      linksIcon: [],
      linksService: [],
      moduleAsPackage: false,
      navModuleDepth: Number.MAX_SAFE_INTEGER,
      navModuleIcon: false,
      search: true,
      searchFullName: false,
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
         name: 'dmtBreadcrumb',
         help: `${ID} When true the breadcrumb is enabled.`,
         type: ParameterType.Boolean,
         defaultValue: true
      });

      app.options.addDeclaration({
         name: 'dmtFavicon',
         help: `${ID} Specify the file path or URL of the favicon file.`,
         type: ParameterType.String,
         defaultValue: ''
      });

      app.options.addDeclaration({
         name: 'dmtLinksIcon',
         help: `${ID} Places provided icon links in toolbar links.`,
         type: ParameterType.Mixed,
         validate: (value) =>
         {
            if (!Array.isArray(value)) { throw new Error(`Expected an array of objects for 'dmtLinksIcon'`); }

            for (const entry of value)
            {
               if (!isObject(entry)) { throw new Error(`Expected an array of objects for 'dmtLinksIcon'`); }
            }
         },
         defaultValue: []
      });

      app.options.addDeclaration({
         name: 'dmtLinksService',
         help: `${ID} Places built-in icon links in toolbar links; supported services: BitBucket, Discord, GitHub, GitLab, NPM`,
         type: ParameterType.Object,
         defaultValue: {}
      });

      app.options.addDeclaration({
         name: 'dmtModuleAsPackage',
         help: `${ID} When true 'Module' in page titles is replaced with 'Package'.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtNavModuleDepth',
         help: `${ID} The depth where the navigation index begins concatenating module paths.`,
         type: ParameterType.Number,
         defaultValue: Number.MAX_SAFE_INTEGER
      });

      app.options.addDeclaration({
         name: 'dmtNavModuleIcon',
         help: `${ID} When true SVG icons for all navigation module entries are displayed.`,
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
         name: 'dmtSearchFullName',
         help: `${ID} When true the main search index stores parent reflection full names.`,
         type: ParameterType.Boolean,
         defaultValue: false
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

   /** @returns {boolean} breadcrumb option */
   get breadcrumb() { return this.#options.breadcrumb; }

   /** @returns {FileOrURL | undefined} favicon option */
   get favicon() { return this.#options.favicon; }

   /** @returns {DMTIconLink[]} linksIcon option */
   get linksIcon() { return this.#options.linksIcon; }

   /** @returns {DMTIconLink[]} linksService option */
   get linksService() { return this.#options.linksService; }

   /** @returns {boolean} moduleAsPackage option */
   get moduleAsPackage() { return this.#options.moduleAsPackage; }

   /** @returns {number} navModuleDepth option */
   get navModuleDepth() { return this.#options.navModuleDepth; }

   /** @returns {boolean} navModuleIcon option */
   get navModuleIcon() { return this.#options.navModuleIcon; }

   /** @returns {boolean} search option */
   get search() { return this.#options.search; }

   /** @returns {boolean} searchFullName option */
   get searchFullName() { return this.#options.searchFullName; }

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
      this.#options.breadcrumb = app.options.getValue('dmtBreadcrumb');
      this.#options.moduleAsPackage = app.options.getValue('dmtModuleAsPackage');
      this.#options.navModuleDepth = app.options.getValue('dmtNavModuleDepth');
      this.#options.navModuleIcon = app.options.getValue('dmtNavModuleIcon');
      this.#options.search = app.options.getValue('dmtSearch');
      this.#options.searchFullName = app.options.getValue('dmtSearchFullName');
      this.#options.searchLimit = app.options.getValue('dmtSearchLimit');
      this.#options.searchQuick = app.options.getValue('dmtSearchQuick');
      this.#options.searchQuickLimit = app.options.getValue('dmtSearchQuickLimit');

      // Validate options --------------------------------------------------------------------------------------------

      this.#options.favicon = ThemeOptions.#validateFileOrURL(app, app.options.getValue('dmtFavicon'), 'dmtFavicon');

      // Verify `navModuleDepth`.
      if (!Number.isInteger(this.#options.navModuleDepth) || this.#options.navModuleDepth < 0)
      {
         app.logger.warn(`${ThemeOptions.#ID
         } 'dmtNavModuleDepth' must be an integer greater than or equal to '0'; setting to default.`);

         this.#options.navModuleDepth = Number.MAX_SAFE_INTEGER;
      }

      const linksIcon = app.options.getValue('dmtLinksIcon');
      this.#validateLinksIcon(linksIcon, app);

      /** @type {Record<string, string>} */
      const linksService = app.options.getValue('dmtLinksService');
      this.#validateLinksService(linksService, app);

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
    * @param {string}   [optionName] - Associated DMT option name; when defined posts a warning message on validation
    *        failure.
    *
    * @returns {FileOrURL | undefined} Parsed FileOrURL object or undefined.
    */
   static #validateFileOrURL(app, pathOrURL, optionName = void 0)
   {
      if (typeof pathOrURL !== 'string' || pathOrURL.length === 0) { return void 0; }

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
         if (optionName)
         {
            app.logger.warn(`${ThemeOptions.#ID} '${optionName}' path / URL did not resolve: ${pathOrURL}`);
         }
         return void 0;
      }

      return result;
   }

   /**
    * @param {Record<string, string>[]}      linksIcon - Service link option.
    *
    * @param {import('typedoc').Application} app - TypeDoc Application.
    */
   #validateLinksIcon(linksIcon, app)
   {
      let cntr = -1;

      for (const entry of linksIcon)
      {
         cntr++;

         if (!isObject(entry))
         {
            app.logger.warn(`${ThemeOptions.#ID} [dmtLinksIcon]: Invalid entry[${cntr}] is not an object.`);
            continue;
         }

         const asset = ThemeOptions.#validateFileOrURL(app, entry.icon);
         if (!asset)
         {
            app.logger.warn(
             `${ThemeOptions.#ID} [dmtLinksIcon]: Invalid entry[${cntr}].icon is not a valid file path or URL.`);
            continue;
         }

         if (entry.title !== void 0 && typeof entry.title !== 'string')
         {
            app.logger.warn(`${ThemeOptions.#ID} [dmtLinksIcon]: Invalid entry[${cntr}].title is not a string.`);
            continue;
         }

         if (!ThemeOptions.#isURL(entry.url))
         {
            app.logger.warn(`${ThemeOptions.#ID} [dmtLinksIcon]: Invalid entry[${cntr}].url is not an URL.`);
            continue;
         }

         this.#options.linksIcon.push({
            asset,
            title: entry.title,
            url: entry.url
         });
      }
   }

   /**
    * @param {Record<string, string>}        linksService - Service link option.
    *
    * @param {import('typedoc').Application} app - TypeDoc Application.
    */
   #validateLinksService(linksService, app)
   {
      for (const key in linksService)
      {
         if (!s_SERVICE_LINKS.has(key))
         {
            app.logger.warn(`${ThemeOptions.#ID} Unknown service link '${key}'; supported services: ${
             [...s_SERVICE_LINKS.keys()].join(', ')}`);
            continue;
         }

         if (!ThemeOptions.#isURL(linksService[key]))
         {
            app.logger.warn(`${ThemeOptions.#ID} Invalid URL for service link '${key}'.`);
            continue;
         }

         this.#options.linksService.push({
            asset: s_SERVICE_LINKS.get(key),
            title: key,
            url: linksService[key]
         });
      }
   }
}

const s_ASSET_PATH = fileURLToPath(import.meta.url.replace(/dist\/index\.js$/, 'assets/'));

/**
 * @type {Map<string, FileOrURL>}
 */
const s_SERVICE_LINKS = new Map([
   ['BitBucket', { filepath: path.join(s_ASSET_PATH, 'icons/service/bitbucket.png'), filename: 'bitbucket.png' }],
   ['Discord', { filepath: path.join(s_ASSET_PATH, 'icons/service/discord.png'), filename: 'discord.png' }],
   ['GitHub', { filepath: path.join(s_ASSET_PATH, 'icons/service/github.png'), filename: 'github.png' }],
   ['GitLab', { filepath: path.join(s_ASSET_PATH, 'icons/service/gitlab.png'), filename: 'gitlab.png' }],
   ['NPM', { filepath: path.join(s_ASSET_PATH, 'icons/service/npm.png'), filename: 'npm.png' }],
]);


/**
 * @typedef {object} DMTOptions
 *
 * @property {FileOrURL | undefined} [favicon] Parsed data about any defined favicon.
 *
 * @property {DMTIconLink[]} linksIcon Provided icon links placed in the toolbar links.
 *
 * @property {DMTIconLink[]} linksService Built-in service icon links placed in the toolbar links.
 *
 * @property {boolean} moduleAsPackage When true 'Module' in page titles is replaced with 'Package'.
 *
 * @property {number} navModuleDepth The depth where the navigation index begins concatenating module paths.
 *
 * @property {boolean} navModuleIcon When true SVG icons for all navigation module entries are displayed.
 *
 * @property {boolean} breadcrumb When true the breadcrumb is enabled.
 *
 * @property {boolean} search When true the main search index is enabled.
 *
 * @property {boolean} searchFullName When true the main search index stores parent reflection full names.
 *
 * @property {number} searchLimit A positive integer greater than 0 providing a limit on main search query results.
 *
 * @property {boolean} searchQuick When true the quick search index is enabled.
 *
 * @property {number} searchQuickLimit A positive integer greater than 0 providing a limit on quick search query
 *           results.
 */
