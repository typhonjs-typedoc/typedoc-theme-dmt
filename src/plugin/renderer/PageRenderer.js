import { load }            from 'cheerio';

import {
   PageEvent,
   ReflectionKind }        from 'typedoc';

import { NavigationIndex } from './data/navigation/NavigationIndex.js';

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

      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd.bind(this));
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
   }

   /**
    * Modifications for class reflection. Wraps `.tsd-hierarchy` panel in a details element.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentClass($)
   {
      const hierarchyPanelEl = $('.tsd-panel.tsd-hierarchy');

      // Enclose class hierarchy in a details / summary element.
      if (hierarchyPanelEl)
      {
         const hierarchyHeaderEl = hierarchyPanelEl.find('> h4');
         const hierarchyContentEl = hierarchyPanelEl.find('> ul.tsd-hierarchy');

         const detailsEl = $(
          `<section class="tsd-panel-group tsd-hierarchy">
            <details class="tsd-hierarchy tsd-accordion">
              <summary class="tsd-accordion-summary" data-key="class-hierarchy">
                 <h5>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><use href="#icon-chevronSmall"></use></svg>
                 </h5>
              </summary>
              <div class="tsd-accordion-details">
              </div>
           </details>
         </section>`);

         // Append content.
         detailsEl.find('.tsd-accordion-details').append(hierarchyContentEl.clone());

         const detailsH5El = detailsEl.find('h5');

         // Append the HTML from old header.
         detailsH5El.append(` ${hierarchyHeaderEl.html()}`);

         hierarchyPanelEl.replaceWith(detailsEl);
      }
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
      // Move header, container-main, and footer elements into the `main` element ------------------------------------

      const bodyEl = $('body');
      bodyEl.append('<main></main>');

      $('body > header, body > .container-main, body > footer').appendTo('body > main');

      const hideGenerator = this.#app.options.getValue('hideGenerator');
      const customFooterHtml = this.#app.options.getValue('customFooterHtml');

      // Remove the footer if there is no content.
      if (hideGenerator && !customFooterHtml) { $('body main footer').remove(); }

      // Add DMT link to any generator footer ------------------------------------------------------------------------

      const generatorEl = $('footer .tsd-generator');
      if (generatorEl)
      {
         generatorEl.html(`${generatorEl.html()} with the <a href="https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt" target="_blank">Default Modern Theme</a>`);
      }

      // Replace inline script content removing unnecessary style `display` gating for page display. -----------------

      const inlineScript = $('body script:first-child');
      const scriptContent = inlineScript?.text();

      if (scriptContent?.includes('document.documentElement.dataset.theme'))
      {
         // Replace the script content
         inlineScript.text('document.documentElement.dataset.theme = localStorage.getItem("tsd-theme") || "os";');
      }

      // Wrap the title header in a flex box to allow additional elements to be added right aligned. -----------------

      const titleEl = $('.tsd-page-title h1');

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

      // Add `.no-children` class to `.tsd-parameters` that have no children. ----------------------------------------
      // This is to allow removing styles from empty lists.

      $('.tsd-parameters').each(function()
      {
         const parameterListEl = $(this);
         if (parameterListEl.children().length === 0) { parameterListEl.addClass('no-children'); }
      });

      // Remove errant `tabindex` / `role` from index details summary header -----------------------------------------

      // The details summary element is focusable!
      $('details summary h5').attr('tabindex', null).attr('role', null);

      // Augment scroll containers making them programmatically focusable --------------------------------------------

      // Main container
      $('div.container.container-main').attr('tabindex', -1);

      // On This Page / Inner Element
      $('details.tsd-page-navigation .tsd-accordion-details').attr('tabindex', -1);

      // Breadcrumb modifications ------------------------------------------------------------------------------------

      const breadcrumbListElements = $('.tsd-breadcrumb li');
      const breadcrumbArray = breadcrumbListElements.toArray();

      if (breadcrumbArray.length > 0)
      {
         const firstElement = $(breadcrumbArray[0]);

         if (firstElement.text() === NavigationIndex.packageName)
         {
            firstElement.remove();
            breadcrumbArray.shift();
         }
      }

      if (breadcrumbArray.length > 0 && NavigationIndex.hasMarkdown)
      {
         const firstElement = $(breadcrumbArray[0]);

         if (firstElement.text() === NavigationIndex.markdownIndexName)
         {
            firstElement.remove();
            breadcrumbArray.shift();
         }
      }

      // There is only one link level left, so remove all links.
      if (breadcrumbArray.length === 1) { breadcrumbListElements.remove(); }
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
   }

   /**
    * Modifications for module reflection. Wraps `.tsd-index-panel` in a details element.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentModule($)
   {
      const indexPanelEl = $('.tsd-panel.tsd-index-panel');

      // Enclose module index in a details / summary element if the first child is not already a details element.
      if (indexPanelEl && indexPanelEl?.children()?.first()?.get(0)?.tagName !== 'details')
      {
         indexPanelEl.find('h3.tsd-index-heading.uppercase').first().remove();

         const childrenEl = indexPanelEl.children();

         const detailsEl = $(
          `<details class="tsd-index-content tsd-accordion dmt-index-content">
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

      // Append scripts to load web components.
      this.#addAssets($, page);

      // Remove unused assets / scripts from TypeDoc default theme.
      this.#removeAssets($);

      switch (page.model.kind)
      {
         case ReflectionKind.Class:
            this.#augmentClass($);
            break;

         case ReflectionKind.Module:
            this.#augmentModule($);
            break;
      }

      // A few global modifications tweaks like the favicon and slight modifications to the layout to allow right
      // aligning of additional elements in flexbox layouts.
      this.#augmentGlobal($);

      // Further global modifications based on DMT options.
      this.#augmentGlobalOptions($, page);

      page.contents = $.html();
   }

   /**
    * Remove unused assets / scripts from TypeDoc default theme.
    *
    * @param {import('cheerio').Cheerio} $ -
    */
   #removeAssets($)
   {
      // Remove the default theme navigation script.
      $('script[src$="assets/navigation.js"]').remove();

      // Remove unused default theme assets.
      $('script[src$="assets/search.js"]').remove();
   }
}
