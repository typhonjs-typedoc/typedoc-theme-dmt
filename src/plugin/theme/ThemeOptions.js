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
      favicon: void 0,
      linksIcon: [],
      linksService: [],
      moduleRemap: {
         isPackage: false,
         names: {},
         readme: {}
      },
      navigation: {
         moduleIcon: false,
         style: 'full'
      },
      search: {
         fullName: false,
         limit: 10
      }
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
         name: 'dmtModuleRemap',
         help: 'Alters aspects with how modules are represented.',
         type: ParameterType.Mixed,
         defaultValue: {
            isPackage: false,
            names: {},
            readme: {}
         },
         validate(value)
         {
            const knownKeys = new Map([
               ['isPackage', 'boolean'],
               ['names', 'object'],
               ['readme', 'object']
            ]);

            if (!value || typeof value !== 'object') { throw new Error(`'dmtModuleRemap' must be an object.`); }

            for (const [key, val] of Object.entries(value))
            {
               if (!knownKeys.has(key))
               {
                  throw new Error(
                   `'dmtModuleRemap' can only include the following keys: ${Array.from(knownKeys.keys()).join(', ')}`);
               }

               if (typeof val !== knownKeys.get(key))
               {
                  throw new Error(`'dmtModuleRemap.${key}' must be a '${knownKeys.get(key)}'.`);
               }
            }
         }
      });

      app.options.addDeclaration({
         name: 'dmtNavigation',
         help: 'Additional DMT navigation sidebar options.',
         type: ParameterType.Mixed,
         defaultValue: {
            moduleIcon: false,
            style: 'full'
         },
         validate(value)
         {
            if (!value || typeof value !== 'object') { throw new Error(`'dmtNavigation' must be an object.`); }

            const knownKeys = new Map([
               ['moduleIcon', 'boolean'],
               ['style', 'string']
            ]);

            const knownStyle = new Set(['compact', 'flat', 'full']);

            for (const [key, val] of Object.entries(value))
            {
               if (!knownKeys.has(key))
               {
                  throw new Error(
                   `'dmtNavigation' can only include the following keys: ${Array.from(knownKeys.keys()).join(', ')}`);
               }

               if (typeof val !== knownKeys.get(key))
               {
                  throw new Error(`'dmtNavigation.${key}' must be a '${knownKeys.get(key)}'.`);
               }

               if (key === 'style' && !knownStyle.has(val))
               {
                  throw new Error(`'dmtNavigation.style' must be: 'compact', 'flat', or 'full'.`);
               }
            }
         }
      });

      app.options.addDeclaration({
         name: 'dmtSearch',
         help: 'Set to false to disable main search index or provide an object with `fullName` / `limit`.',
         type: ParameterType.Mixed,
         defaultValue: {
            fullName: false,
            limit: 10
         },
         validate(value)
         {
            // Early out if `boolean`.
            if (typeof value === 'boolean') { return; }

            const knownKeys = new Map([
               ['fullName', 'boolean'],
               ['limit', 'number']
            ]);

            if (!value || typeof value !== 'object') { throw new Error(`'dmtSearch' must be a boolean or object.`); }

            for (const [key, val] of Object.entries(value))
            {
               if (!knownKeys.has(key))
               {
                  throw new Error(
                   `'dmtSearch' can only include the following keys: ${Array.from(knownKeys.keys()).join(', ')}`);
               }

               if (typeof val !== knownKeys.get(key))
               {
                  throw new Error(`'dmtSearch.${key}' must be a '${knownKeys.get(key)}'.`);
               }

               if (key === 'limit' && (!Number.isInteger(val) || val < 1))
               {
                  throw new Error(
                   `'dmtSearch.limit' must be a positive integer greater than '0'.`);
               }
            }
         }
      });
   }

   /**
    * Adjusts default and DMT options. The DMT handles navigation index parsing for folders.
    *
    * @param {import('typedoc').Application} app -
    */
   static adjustDefaultOptions(app)
   {
      const navigation = app.options.getValue('navigation');

      // Must only adjust `includeFolders` if it exists `0.25.5+`.
      if (typeof navigation?.includeFolders === 'boolean')
      {
         const includeFolders = navigation.includeFolders ?? true;

         // Always set default theme `includeFolders` to false so DMT controls the navigation index parsing.
         navigation.includeFolders = false;

         // Set DMT navigation to flat mode to generate full paths if `includeFolders` is set to false.
         if (!includeFolders)
         {
            const dmtNavigation = app.options.getValue('dmtNavigation');
            if (typeof dmtNavigation.style === 'string') { dmtNavigation.style = 'flat'; }
            app.options.setValue('dmtNavigation', dmtNavigation);
         }

         app.options.setValue('navigation', navigation);
      }
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
      this.#parseDMTOptions(app);
   }

   /** @returns {FileOrURL | undefined} favicon option */
   get favicon() { return this.#options.favicon; }

   /** @returns {DMTIconLinkOption[]} linksIcon option */
   get linksIcon() { return this.#options.linksIcon; }

   /** @returns {DMTIconLinkOption[]} linksService option */
   get linksService() { return this.#options.linksService; }

   /** @returns {DMTModuleRemap} moduleRemap option */
   get moduleRemap() { return this.#options.moduleRemap; }

   /** @returns {DMTNavigation} navigation option */
   get navigation() { return this.#options.navigation; }

   /** @returns {DMTSearchOptions} search option */
   get search() { return this.#options.search; }

   /**
    * Parses DMT options.
    *
    * @param {import('typedoc').Application} app -
    */
   #parseDMTOptions(app)
   {
      this.#options.moduleRemap = Object.assign(this.#options.moduleRemap, app.options.getValue('dmtModuleRemap'));
      this.#options.navigation = Object.assign(this.#options.navigation, app.options.getValue('dmtNavigation'));

      const dmtSearch = app.options.getValue('dmtSearch');

      // When `true` use default values already set.
      this.#options.search = typeof dmtSearch === 'boolean' && dmtSearch ? this.#options.search :
       Object.assign(this.#options.search, dmtSearch);

      // Validate options --------------------------------------------------------------------------------------------

      this.#options.favicon = ThemeOptions.#validateFileOrURL(app, app.options.getValue('dmtFavicon'), 'dmtFavicon');

      // Validate remapped module `names` warning if values are not a string.
      if (this.#options.moduleRemap.names)
      {
         for (const key of Object.keys(this.#options.moduleRemap.names))
         {
            if (typeof this.#options.moduleRemap.names[key] !== 'string')
            {
               app.logger.warn(`${ThemeOptions.#ID} [dmtModuleNames]: Value for key '${key}' is not a string.`);
               delete this.#options.moduleRemap.names[key];
            }
         }
      }

      // Validate remapped module `readme` file paths warning if paths do not exist.
      if (this.#options.moduleRemap.readme)
      {
         for (const key of Object.keys(this.#options.moduleRemap.readme))
         {
            if (!fs.existsSync(this.#options.moduleRemap.readme[key]))
            {
               app.logger.warn(`${ThemeOptions.#ID} [dmtModuleReadme]: File path for key '${key}' does not exist.`);
               delete this.#options.moduleRemap.readme[key];
            }
         }
      }

      const linksIcon = app.options.getValue('dmtLinksIcon');
      this.#validateLinksIcon(linksIcon, app);

      /** @type {Record<string, string>} */
      const linksService = app.options.getValue('dmtLinksService');
      this.#validateLinksService(linksService, app);
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

         const entry = s_SERVICE_LINKS.get(key);

         this.#options.linksService.push({
            asset: entry.asset,
            title: entry.title,
            url: linksService[key]
         });
      }
   }
}

const s_ASSET_PATH = fileURLToPath(import.meta.url.replace(/dist\/index\.js$/, 'assets/'));

/**
 * @type {Map<string, { asset: FileOrURL, title: string }>}
 */
const s_SERVICE_LINKS = new Map([
   ['BitBucket', {
      asset: { filepath: path.join(s_ASSET_PATH, 'icons/service/bitbucket.png'), filename: 'bitbucket.png' },
      title: 'BitBucket Repo'
   }],
   ['Discord', {
      asset: { filepath: path.join(s_ASSET_PATH, 'icons/service/discord.png'), filename: 'discord.png' },
      title: 'Discord Chat'
   }],
   ['GitHub', {
      asset: { filepath: path.join(s_ASSET_PATH, 'icons/service/github.png'), filename: 'github.png' },
      title: 'GitHub Repo'
   }],
   ['GitLab', {
      asset: { filepath: path.join(s_ASSET_PATH, 'icons/service/gitlab.png'), filename: 'gitlab.png' },
      title: 'GitLab Repo'
   }],
   ['NPM', {
      asset: { filepath: path.join(s_ASSET_PATH, 'icons/service/npm.png'), filename: 'npm.png' },
      title: 'NPM Package'
   }],
]);

/**
 * @typedef {object} DMTOptions
 *
 * @property {FileOrURL | undefined} [favicon] Parsed data about any defined favicon.
 *
 * @property {DMTIconLinkOption[]} linksIcon Provided icon links placed in the toolbar links.
 *
 * @property {DMTIconLinkOption[]} linksService Built-in service icon links placed in the toolbar links.
 *
 * @property {DMTModuleRemap} moduleRemap - Module remap options.
 *
 * @property {DMTNavigation} navigation - Navigation options.
 *
 * @property {DMTSearchOptions} search Search options.
 */
