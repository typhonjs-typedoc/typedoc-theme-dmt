import fs                  from 'node:fs';
import path                from 'node:path';
import { fileURLToPath }   from 'node:url';

import {
   PageEvent,
   ReflectionKind,
   RendererEvent }         from 'typedoc';

import { load }            from 'cheerio';

import { copyDirectory }   from '#utils';

export class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

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

      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);

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

      const titleEl = $('.tsd-page-title h1');

      // Wrap the title header in a flex box to allow additional elements to be added right aligned.
      titleEl.wrap('<div class="dmt-title-header-flex"></div>');

      // Replace default main search with DMT main search ------------------------------------------------------------

      // Empty default theme search div to make space for the DMT search component.
      const tsdSearchEl = $($('#tsd-search-field').parent());
      tsdSearchEl.attr('id', 'dmt-search-main');
      tsdSearchEl.empty();

      // Remove default theme search results.
      $('ul.results').remove();

      // Replace default toolbar links with DMT toolbar links --------------------------------------------------------

      // Empty and assign a new ID to default theme toolbar links.
      const tsdToolbarEl = $($('#tsd-toolbar-links').parent());
      tsdToolbarEl.attr('id', 'dmt-toolbar');
      tsdToolbarEl.empty();

      // Clone title anchor and append to #dmt-toolbar.
      const tsdTitleEl = $('#tsd-search a.title');
      tsdToolbarEl.append(tsdTitleEl.clone());

      // Remove old anchor.
      tsdTitleEl.remove();

      // Move generator element to column content --------------------------------------------------------------------

      const generatorEl = $('.tsd-generator');
      if (generatorEl.length)
      {
         const newGeneratorEl = generatorEl.clone();
         newGeneratorEl.find('p').append(
          ' and the <a href="https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt" target="_blank">Default Modern Theme</a>');

         $('.col-content').append(newGeneratorEl);
         generatorEl.remove();
      }

      // Remove errant `tabindex` / `role` from index details summary header -----------------------------------------

      // The details summary element is focusable!
      $('details summary h5').attr('tabindex', null).attr('role', null);

      // Augment scroll containers making them programmatically focusable --------------------------------------------

      // Main container
      $('div.container.container-main').attr('tabindex', -1);

      // On This Page / Inner Element
      $('details.tsd-page-navigation .tsd-accordion-details').attr('tabindex', -1);
   }

   /**
    * Modifications for every page based on DMT options.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {PageEvent}   page -
    */
   #augmentGlobalOptions($, page)
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
      if (!this.#options.breadcrumb) { $('.tsd-breadcrumb').remove(); }

      // Potentially replace module page titles with `Package`.
      if (this.#options.moduleAsPackage && page?.model?.kind === ReflectionKind.Module)
      {
         const titleEl = $('.tsd-page-title h1');
         const titleText = titleEl.text();
         if (typeof titleText === 'string') { titleEl.text(titleText.replace(/^Module (.*)/, 'Package $1')); }
      }
   }

   /**
    * Modifications for module reflection. Wraps `.tsd-index-panel` in a details element with the local storage key:
    * `tsd-accordion-module-index`.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentModule($)
   {
      const indexPanelEl = $('.tsd-panel.tsd-index-panel');

      if (indexPanelEl)
      {
         indexPanelEl.find('h3.tsd-index-heading.uppercase').first().remove();

         const childrenEl = indexPanelEl.children();

         const detailsEl = $(
         `<details class="tsd-index-content tsd-index-accordion">
            <summary class="tsd-accordion-summary tsd-index-summary" data-key="module-index">
               <h3 class="tsd-index-heading uppercase">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><use href="#icon-chevronSmall"></use></svg> Index
               </h3>
            </summary>
            <div class="tsd-accordion-details">
            </div>
         </details>`);

         detailsEl.find('.tsd-accordion-details').append(childrenEl.clone());

         childrenEl.remove();

         indexPanelEl.append(detailsEl);
      }
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load(page.contents);

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
      this.#augmentGlobalOptions($, page);

      if (page.model.kind === ReflectionKind.Module) { this.#augmentModule($, page); }

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    *
    * @param {RendererEvent} event -
    */
   #handleRendererEnd(event)
   {
      const outAssets = path.join(event.outputDirectory, 'assets', 'dmt');
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      if (this.#options?.favicon?.filepath && this.#options?.favicon?.filename)
      {
         this.#app.logger.verbose(`[typedoc-theme-default-modern] Copying 'dmtFavicon' to output directory.`);

         fs.copyFileSync(this.#options.favicon.filepath, path.join(event.outputDirectory,
          this.#options.favicon.filename));
      }

      this.#app.logger.verbose(`[typedoc-theme-default-modern] Copying assets to output assets directory.`);
      copyDirectory(path.join(localDir, 'assets'), outAssets);

      // Update main.js default theme removing `initSearch` / `initNav` functions ------------------------------------

      // TypeDoc 0.25.3+

      // This can be a potentially fragile replacement. The regex below removes any functions / content between
      // `Object.defineProperty()` and the closing of the IIFE `})();`. This works for mangled / minified code.

      // See: https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/bootstrap.ts#L25

      const mainJSPath = path.join(event.outputDirectory, 'assets', 'main.js');
      if (fs.existsSync(mainJSPath))
      {
         const mainData = fs.readFileSync(mainJSPath, 'utf-8');

         const regex = /(Object\.defineProperty\(window,"app",\{.*?}\);)\s*.*?(?=}\)\(\);)/gm;

         if (regex.test(mainData))
         {
            fs.writeFileSync(mainJSPath, mainData.replace(regex, '$1'), 'utf-8');
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
   }
}
