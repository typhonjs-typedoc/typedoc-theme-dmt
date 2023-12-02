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
      navAnimate: true,
      navControls: true,
      navTopModuleRemoveIcon: false,
      removeBreadcrumb: false,
      search: true,
      searchLimit: 10,
      searchQuick: false,
      SearchQuickLimit: 10,
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
         defaultValue: null
      });

      app.options.addDeclaration({
         name: 'dmtNavAnimate',
         help: `${ID} When true navigation uses WAAPI to animate folder open / close state.`,
         type: ParameterType.Boolean,
         defaultValue: true
      });

      app.options.addDeclaration({
         name: 'dmtNavControls',
         help: `${ID} When true and there is more than one top level tree node navigation controls are displayed.`,
         type: ParameterType.Boolean,
         defaultValue: true
      });

      app.options.addDeclaration({
         name: 'dmtNavTopModuleRemoveIcon',
         help: `${ID} When true the top level SVG icon for all module / namespace entries is removed.`,
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

   /** @returns {{filepath?: string, filename?: string, url?: string}} favicon option */
   get favicon() { return this.#options.favicon; }

   /** @returns {boolean} Animate navigation folders w/ WAAPI */
   get navAnimate() { return this.#options.navAnimate; }

   /** @returns {boolean} Display top level navigation controls */
   get navControls() { return this.#options.navControls; }

   /** @returns {boolean} navTopModuleRemoveIcon option */
   get navTopModuleRemoveIcon() { return this.#options.navTopModuleRemoveIcon; }

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
      this.#options.navAnimate = app.options.getValue('dmtNavAnimate');
      this.#options.navControls = app.options.getValue('dmtNavControls');
      this.#options.navTopModuleRemoveIcon = app.options.getValue('dmtNavTopModuleRemoveIcon');
      this.#options.removeBreadcrumb = app.options.getValue('dmtRemoveBreadcrumb');
      this.#options.search = app.options.getValue('dmtSearch');
      this.#options.searchLimit = app.options.getValue('dmtSearchLimit');
      this.#options.searchQuick = app.options.getValue('dmtSearchQuick');
      this.#options.searchQuickLimit = app.options.getValue('dmtSearchQuickLimit');

      // Validate options --------------------------------------------------------------------------------------------

      const ID = '[typedoc-theme-default-modern]';

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
            app.logger.warn(`${ID} 'dmtFavicon' path / URL did not resolve: ${dmtFavicon}`);
         }
      }

      // Verify search limits.
      if (!Number.isInteger(this.#options.searchLimit) || this.#options.searchLimit < 1)
      {
         app.logger.warn(
          `${ID} 'dmtSearchLimit' must be a positive integer greater than '0'; setting to default of '10'`);

         this.#options.searchLimit = 10;
      }

      if (!Number.isInteger(this.#options.searchQuickLimit) || this.#options.searchQuickLimit < 1)
      {
         app.logger.warn(
          `${ID} 'dmtSearchQuickLimit' must be a positive integer greater than '0'; setting to default of '10'`);

         this.#options.searchQuickLimit = 10;
      }
   }
}

/**
 * @typedef {object} DMTOptions
 *
 * @property {{ filepath?: string, filename?: string, url?: string }} [favicon] Parsed data about any defined favicon.
 *
 * @property {boolean} navAnimate When true navigation uses WAAPI to animate folder open / close state.

 * @property {boolean} navControls When true and there is more than one tree node navigation controls are displayed.
 *
 * @property {boolean} navTopModuleRemoveIcon When true the top level SVG icon for each entry / namespace is removed.
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
