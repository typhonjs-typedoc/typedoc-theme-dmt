import fs                     from 'node:fs';
import path                   from 'node:path';

import { fileURLToPath }      from 'node:url';

import {
   PageEvent,
   ReflectionKind,
   RendererEvent }            from 'typedoc';

import { load }               from 'cheerio';

import { escapeAttr }         from '../../utils.js';

import { compileNavBundle }   from './compile/compileNavBundle.js';

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

   // /** @type {DMTOptions} */
   // #options = {
   //    removeDefaultModule: false
   // };

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

      // At the end of rendering dynamically generate a Svelte web component with the static navigation data from the
      // Project / `index.html` reflection. There is logic in the component to select the associated anchor link and
      // rewrite all the anchor hrefs for the appropriate category location. This is usually the 2nd page rendered and
      // has the quality of containing all the SVG data for the navigation sidebar where the default "modules.html"
      // does not.
      this.#app.renderer.postRenderAsyncJobs.push(async (output) =>
      {
         this.#app.logger.verbose(`[typedoc-theme-default-modern] Generating nav web component bundle.`);

         return compileNavBundle(path.join(output.outputDirectory, 'assets', 'dmt', 'dmt-nav-web-component.js'),
          this.#navContent);
      });
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
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt/dmt-theme.css" />`));

      // Append nav search index script to the head element.
      headEl.append($(`<script src="${basePath}assets/dmt/dmt-quick-search.js" type="module" />`));

      // Append web components script to the head element.
      headEl.append($(`<script src="${basePath}assets/dmt/dmt-web-components.js" type="module" />`));

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

      // Remove unused TypeDoc default assets ------------------------------------------------------------------------

      headEl.find('script[src$="assets/search.js"]').remove();

      // $('head > script').filter((i, x) => x && x.src.match(/assets\/search.js$/)).get(0).remove();
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

      // TODO: wrapping test / remove.
      $('.tsd-navigation.settings').wrap(`<wc-dmt-wrap></wc-dmt-wrap>`);

      // Wrap the title header in a flex box to allow additional elements to be added right aligned.
      $('.tsd-page-title h1').wrap('<div class="dmt-title-header-flex"></div>');

      // Augment scroll containers making them programmatically focusable --------------------------------------------

      // Main container
      $('div.container.container-main').attr('tabindex', -1);

      // Nav sidebar
      $('div.site-menu').attr('tabindex', -1);

      // On This Page / Inner Element
      $('details.tsd-page-navigation .tsd-accordion-details').attr('tabindex', -1);
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load(page.contents);

      // Remove the `main.js` script as it is loaded after the DOM is loaded in the web components bundle.
      $('script[src*="/main.js"]').remove();

      const siteMenu = $('div.site-menu');

      // Save the navigation sidebar content for the main index.html page. This is used to create the dynamic
      // navigation web component. This occurs as the ~2nd page generated.
      if (page.model.kind === ReflectionKind.Project && page.url === 'index.html')
      {
         // Potentially remove default module / namespace.
         // TODO: This needs to be revised / verified.
         if (this.#options.removeDefaultModule)
         {
            $('nav.tsd-navigation a:first[href$="modules.html"]').remove();
         }

         // Remove the currently selected value as this data is cached and dynamically set on load.
         siteMenu.find('a.current').removeClass('current');

         // Store the HTML content of the index.html navigation sidebar to load into nav web component.
         this.#navContent = siteMenu.html();

         // Stop all further generation of the navigation sidebar. This is where the magic goes down regarding the
         // 90% output disk space utilization and 80% speed up over the default theme.
         this.#app.renderer.theme.stopNavigationGeneration();
      }

      // Replace standard navigation with the `NavigationSite` web component. Send page url to select current
      // active anchor.
      siteMenu.empty().append($(`<wc-dmt-nav pageurl="${escapeAttr(page.url)}"></wc-dmt-nav>`));

      // Append scripts to load web components.
      this.#addAssets($, page);

      // A few global modifications tweaks like the favicon and slight modifications to layout to allow right aligning
      // of additional elements in flexbox layouts.
      this.#augmentGlobal($);

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

      this.#app.logger.verbose(`[typedoc-theme-default-modern] Copying 'dmt-theme.css' to output assets directory.`);

      fs.copyFileSync(path.join(localDir, 'dmt-theme.css'), path.join(outAssets, 'dmt-theme.css'));
      fs.copyFileSync(path.join(localDir, 'dmt-theme.css.map'), path.join(outAssets, 'dmt-theme.css.map'));

      this.#app.logger.verbose(
       `[typedoc-theme-default-modern] Copying 'dmt-quick-search.js' to output assets directory.`);

      fs.copyFileSync(path.join(localDir, 'dmt-quick-search.js'), path.join(outAssets, 'dmt-quick-search.js'));
      fs.copyFileSync(path.join(localDir, 'dmt-quick-search.js.map'),
       path.join(outAssets, 'dmt-quick-search.js.map'));

      this.#app.logger.verbose(
       `[typedoc-theme-default-modern] Copying 'dmt-web-components.js' to output assets directory.`);

      fs.copyFileSync(path.join(localDir, 'dmt-web-components.js'), path.join(outAssets, 'dmt-web-components.js'));
      fs.copyFileSync(path.join(localDir, 'dmt-web-components.js.map'),
       path.join(outAssets, 'dmt-web-components.js.map'));
   }
}