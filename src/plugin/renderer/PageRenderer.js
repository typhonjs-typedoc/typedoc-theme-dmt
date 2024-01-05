import fs            from 'node:fs';
import path          from 'node:path';

import {
   JSX,
   PageEvent,
   ReflectionKind,
   RendererEvent }   from 'typedoc';

import { load }      from 'cheerio';

export class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * Stores whether caching icons externally has been attempted; caching only occurs on first page render.
    *
    * @type {boolean}
    */
   #iconsCachedAttempted = false;

   /**
    * Stores whether icons are cached externally.
    *
    * @type {boolean}
    */
   #iconsCached = false;

   /** @type {ThemeOptions} */
   #options;

   /**
    * Stores the output directory from `RendererEvent.BEGIN`; used in caching icons externally.
    */
   #outputDirectory;

   /**
    * @param {import('typedoc').Application} app -
    *
    * @param {ThemeOptions} options -
    */
   constructor(app, options)
   {
      this.#app = app;
      this.#options = options;

      this.#app.renderer.once(RendererEvent.BEGIN, (event) => this.#outputDirectory = event.outputDirectory);

      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);
   }

   /**
    * @returns {boolean} Whether SVG icons are cached externally.
    */
   get iconsCached()
   {
      return this.#iconsCached;
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

      // To reduce flicker from loading `main.js` and additional Svelte components make `body` start with no visibility.
      headEl.prepend('<style>body { visibility: hidden; }</style>');

      // For no Javascript loading reverse the above style on load. The main Svelte component bundle will reverse this
      // style after all components have been loaded on a requestAnimationFrame callback.
      headEl.append('<noscript><style>body { visibility: visible; }</style></noscript>');

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
      // Breadcrumb modifications ------------------------------------------------------------------------------------

      // Always remove the default theme top level default module / namespace from breadcrumb links.
      const breadcrumbListElements = $('.tsd-breadcrumb li');
      const breadcrumbArray = breadcrumbListElements.toArray();
      if (breadcrumbArray.length > 2)
      {
         $(breadcrumbArray[0]).remove();
      }
      else
      {
         // There is only one link level besides the module, so remove all links.
         breadcrumbListElements.remove();
      }

      // Potentially replace module page titles with `Package`. ------------------------------------------------------

      if (this.#options.moduleRemap.isPackage && page?.model?.kind === ReflectionKind.Module)
      {
         const titleEl = $('.tsd-page-title h1');
         const titleText = titleEl.text();
         if (typeof titleText === 'string') { titleEl.text(titleText.replace(/^Module (.*)/, 'Package $1')); }
      }

      // Remove default theme navigation index content that isn't a module reflection. -------------------------------

      // This is what is displayed when Javascript is disabled. Presently the default theme will render the first
      // 20 reflections regardless of type. This can lead to bloat for large documentation efforts. Only displaying
      // module reflections allows more precise navigation when Javascript is disabled.

      $('nav.tsd-navigation #tsd-nav-container li').each(function()
      {
         const liEl = $(this);
         const isModule = liEl.find('svg.tsd-kind-icon use[href="#icon-2"]');
         if (!isModule.length) { liEl.remove(); }
      });

      // Icon caching ------------------------------------------------------------------------------------------------

      if (this.#iconsCached)
      {
         // Remove the inline icon SVG.
         $('body > svg').first().remove();

         const depth = (page.url.match(/\//g) ?? []).length;
         const basePath = '../'.repeat(depth);

         // Prepend the external `icons.svg` path to all `svg use` instances.
         $('svg use').each(function()
         {
            const useEl = $(this);
            const currentHref = useEl.attr('href');
            useEl.attr('href', `${basePath}assets/icons.svg${currentHref}`);
         })
      }
   }

   /**
    * Modifications for module reflection. Wraps `.tsd-index-panel` in a details element with the local storage key:
    * `tsd-accordion-module-index`.
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {PageEvent}   page -
    */
   #augmentModule($, page)
   {
      const indexPanelEl = $('.tsd-panel.tsd-index-panel');

      // Enclose module index in a details / summary element.
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

      // Detect if there is any associated README file to render for the module page based on the name and lookup in
      // `dmtModuleReadme`.
      const moduleName = page.model?.name;

      if (typeof this.#options.moduleRemap.readme[moduleName] === 'string')
      {
         try
         {
            const md = fs.readFileSync(this.#options.moduleRemap.readme[moduleName], 'utf-8');
            const mdHTML = this.#app.renderer.theme.markedPlugin.parseMarkdown(md, page);

            if (typeof mdHTML === 'string') { $('.col-content').append(mdHTML); }
         }
         catch (err)
         {
            this.#app.logger.warn(
             `[typedoc-theme-default-modern] Could not render additional 'README.md' for: '${moduleName}'`)
         }
      }
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      // Cache SVG icons externally
      if (!this.#iconsCachedAttempted)
      {
         this.#iconsCached = this.#cacheIconsExternal();
         this.#iconsCachedAttempted = true;
      }

      const $ = load(page.contents);

      // Remove the default theme navigation script.
      $('script[src*="/navigation.js"]').remove();

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
    * @returns {boolean} Whether icons were cached externally.
    */
   #cacheIconsExternal()
   {
      const iconsJSX = this.#app.renderer.theme.renderContext.iconsCache();

      try
      {
         // Must add XML Namespace so `icons.svg` is interpreted correctly.
         if (typeof iconsJSX.props === 'object') { iconsJSX.props.xmlns = 'http://www.w3.org/2000/svg'; }

         fs.writeFileSync(path.join(this.#outputDirectory, 'assets', 'icons.svg'), JSX.renderElement(iconsJSX),
          'utf-8');

         return true;
      }
      catch (err)
      {
         this.#app.logger.warn(`[typedoc-theme-default-modern] External caching of SVG icons failed.`)
      }

      return false;
   }
}
