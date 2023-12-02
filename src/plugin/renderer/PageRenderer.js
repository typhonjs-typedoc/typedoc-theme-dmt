import fs                     from 'node:fs';
import path                   from 'node:path';

import { fileURLToPath }      from 'node:url';

import {
   PageEvent,
   RendererEvent }            from 'typedoc';

import { load }               from 'cheerio';

import { copyDirectory }      from '#utils';

export class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * Caches the initial Project / index.html navigation sidebar content.
    *
    * @type {string}
    */
   #navContent;

   /** @type {ThemeOptions} */
   #options;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   constructor(app, options)
   {
      this.#app = app;
      this.#options = options;

      // this.#app.converter.once(Converter.EVENT_BEGIN, this.#parseOptions, this);
      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);

      // this.#app.renderer.once(RendererEvent.BEGIN, this.#parseOptions, this);
      this.#app.renderer.once(RendererEvent.END, this.#handleRendererEnd, this);
   }

   /**
    * Adds a script links to load DMT source bundles. Also removes TypeDoc scripts as necessary (search).
    *
    * @param {import('cheerio').Cheerio} $ -
    *
    * @param {PageEvent}   page -
    */
   #addAssets($, page)
   {
      // Get asset path to script by counting the number of `/` characters then building the relative path.
      const count = (page.url.match(/\//) ?? []).length;
      const basePath = '../'.repeat(count);

      const headEl = $('head');

      // Append stylesheet to the head element.
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt/dmt-components.css" />`));
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt/dmt-theme.css" />`));

      // Append DMT components script to the head element.
      headEl.append($(`<script src="${basePath}assets/dmt/dmt-components.js" type="module" />`));

      // Use the project packageName or create a random string to prepend for all session storage keys.
      const storagePrepend = `docs-${page?.project?.packageName ?? Math.random().toString(36).substring(2, 18)}`

      /**
       * Configures the global options available in frontend runtime.
       *
       * @type {DMTGlobalOptions}
       */
      const dmtGlobalOptions = {
         basePath,
         navAnimate: this.#options.navAnimate,
         navControls: this.#options.navControls,
         navRemoveTopLevelIcon: this.#options.navRemoveTopLevelIcon,
         search: this.#options.search,
         searchLimit: this.#options.searchLimit,
         searchQuick: this.#options.searchQuick,
         searchQuickLimit: this.#options.searchQuickLimit,
         storagePrepend
      };

      // Append DMT options for search index enabled state; if not enabled loading code is disabled.
      headEl.append(
       $(`<script type="application/javascript">globalThis.dmtOptions = ${JSON.stringify(dmtGlobalOptions)}</script>`));

      if (this.#options?.favicon?.url)
      {
         // Append favicon URL to the head element.
         headEl.append($(`<link rel="icon" href="${this.#options.favicon.url}" />`));
      }
      else if (this.#options?.favicon?.filename)
      {
         // Append favicon to the head element.
         headEl.append($(`<link rel="icon" href="${basePath}${this.#options.favicon.filename}" />`));
      }

      // Remove unused default theme assets --------------------------------------------------------------------------

      headEl.find('script[src$="assets/search.js"]').remove();
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
      // On load set opacity to 0 on the body as there is a DOMContentLoaded handler in the `dmt-nav-web-component`
      // bundle that on first rAF makes the body visible. This allows the default theme `main.js` script to load before
      // display along with the DMT web components providing a seamless load with no flicker.
      $('body').prop('style', 'opacity: 0');

      // Wrap the title header in a flex box to allow additional elements to be added right aligned.
      $('.tsd-page-title h1').wrap('<div class="dmt-title-header-flex"></div>');

      // Replace default main search with DMT main search ------------------------------------------------------------

      // Empty default theme search div to make space for the DMT search component.
      const tsdSearchEl = $($('#tsd-search-field').parent());
      tsdSearchEl.attr('id', 'dmt-search-main');
      tsdSearchEl.empty();

      // Remove default theme search results.
      $('ul.results').remove();

      // Move generator element to column content --------------------------------------------------------------------

      const generatorEl = $('.tsd-generator');
      if (generatorEl.length)
      {
         $('.col-content').append(generatorEl.clone());
         generatorEl.remove();
      }

      // Augment scroll containers making them programmatically focusable --------------------------------------------

      // Main container
      $('div.container.container-main').attr('tabindex', -1);

      // Nav sidebar
      $('div.site-menu').attr('tabindex', -1);

      // On This Page / Inner Element
      $('details.tsd-page-navigation .tsd-accordion-details').attr('tabindex', -1);
   }

   /**
    * Modifications for every page based on DMT options.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobalOptions($)
   {
      // Always remove the default theme top level default module / namespace from breadcrumb links.
      const breadCrumbListElements = $('.tsd-breadcrumb li');
      const breadcrumbArray = breadCrumbListElements.toArray();
      if (breadcrumbArray.length > 2)
      {
         $(breadcrumbArray[0]).remove();
      }
      else
      {
         // There is only one link level besides the module, so remove all links.
         breadCrumbListElements.remove();
      }

      // Remove all breadcrumb links.
      if (this.#options.removeBreadcrumb) { $('.tsd-breadcrumb').remove(); }
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load(page.contents);

      // TODO: Potentially remove.
      // Remove the `main.js` script as it is loaded after the DOM is loaded in the DMT components bundle.
      // $('script[src*="/main.js"]').remove();

      // Remove the default theme navigation script.
      $('script[src*="/navigation.js"]').remove();

      const siteMenu = $('div.site-menu');

      siteMenu.empty().append($(`<nav class="tsd-navigation"></nav>`));

      // Append scripts to load web components.
      this.#addAssets($, page);

      // A few global modifications tweaks like the favicon and slight modifications to the layout to allow right
      // aligning of additional elements in flexbox layouts.
      this.#augmentGlobal($);

      // Further global modifications based on DMT options.
      this.#augmentGlobalOptions($);

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    *
    * @param {RendererEvent} output -
    */
   #handleRendererEnd(output)
   {
      const outAssets = path.join(output.outputDirectory, 'assets', 'dmt');
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      if (this.#options?.favicon?.filepath && this.#options?.favicon?.filename)
      {
         this.#app.logger.verbose(`[typedoc-theme-default-modern] Copying 'dmtFavicon' to output directory.`);

         fs.copyFileSync(this.#options.favicon.filepath, path.join(output.outputDirectory,
          this.#options.favicon.filename));
      }

      this.#app.logger.verbose(`[typedoc-theme-default-modern] Copying assets to output assets directory.`);
      copyDirectory(path.join(localDir, 'assets'), outAssets);

      // Update main.js default theme removing `initSearch` function -------------------------------------------------

      // TypeDoc 0.25.3+

      // This can be a potentially fragile replacement. The regex below is anchored with a negative lookbehind
      // assertion on `be;` which is the `initNav();` function minified. It removes the previous function call
      // before / `initSearch();` which is `he();` minified. This works for mangled / minified code.

      // See: https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/bootstrap.ts#L25

      // I'll attempt to submit a PR to TypeDoc for a new default theme option `searchEnabled` that will disable the
      // default theme search index creation and loading code.

      const mainJSPath = path.join(output.outputDirectory, 'assets', 'main.js');
      if (fs.existsSync(mainJSPath))
      {
         const mainData = fs.readFileSync(mainJSPath, 'utf-8');

         const regex = /he\(\);be\(\);/gm;

         if (regex.test(mainData))
         {
            fs.writeFileSync(mainJSPath, mainData.replace(regex, ''), 'utf-8');
         }
         else
         {
            this.#app.logger.error(
             `[typedoc-theme-default-modern] Failed to remove default theme search initialization in 'main.js' asset.`);
         }
      }
      else
      {
         this.#app.logger.error(`[typedoc-theme-default-modern] Could not locate 'main.js' asset.`);
      }

      // Update style.css default theme removing search field rule ---------------------------------------------------

      // This can be a potentially fragile replacement. The regex below removes the `#tsd-search .field input` rule
      // from the main styles as sadly it doesn't target a specific selector re `.field input`.

      // See: https://github.com/TypeStrong/typedoc/blob/master/static/style.css#L869-L881

      // I'll attempt to submit a PR to TypeDoc to provide a more specific selector.

      const stylesPath = path.join(output.outputDirectory, 'assets', 'style.css');
      if (fs.existsSync(stylesPath))
      {
         const stylesData = fs.readFileSync(stylesPath, 'utf-8');
         const regex = /#tsd-search \.field input \{[\s\S]*?}/gm;

         if (regex.test(stylesData))
         {
            fs.writeFileSync(stylesPath, stylesData.replace(regex, ''), 'utf-8');
         }
         else
         {
            this.#app.logger.error(
             `[typedoc-theme-default-modern] Failed to remove rule in default theme 'styles.css' asset.`);
         }
      }
      else
      {
         this.#app.logger.error(`[typedoc-theme-default-modern] Could not locate 'styles.css' asset.`);
      }
   }
}
