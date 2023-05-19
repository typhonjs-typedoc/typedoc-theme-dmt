import fs                  from 'node:fs';
import path                from 'node:path';
import {
   fileURLToPath,
   URL }                   from 'node:url';

import {
   Converter,
   PageEvent,
   RendererEvent }         from 'typedoc';

import { load }            from 'cheerio';

// import { escapeAttr }      from '#utils';

export class PageRenderer
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {DMTOptions} */
   #options = {
   };

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.converter.once(Converter.EVENT_BEGIN, this.#parseOptions, this);
      this.#app.renderer.on(PageEvent.END, this.#handlePageEnd, this);
      this.#app.renderer.once(RendererEvent.END, this.#handleRendererEnd, this);
   }

   /**
    * Adds a script element to load the web component bundle supporting MDN links and compatibility charts.
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
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt-theme.css" />`));

      // Append web components script to the head element.
      headEl.append($(`<script src="${basePath}assets/dmt-web-components.js" type="module" />`));

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
   }

   /**
    * Modifications for every page.
    *
    * @param {import('cheerio').Cheerio}  $ -
    */
   #augmentGlobal($)
   {
      // On load set opacity to 0 on the body as there is a DOMContentLoaded handler in `index.js` for the
      // `dmt-web-components` bundle that on rAF makes the body visible. This allows the default theme deferred
      // `main.js` script to load before display along with the DMT web components providing a seamless load.
      $('body').prop('style', 'opacity: 0');

      $('.tsd-navigation.settings').wrap(`<wc-dmt-wrap></wc-dmt-wrap>`);

      // Wrap the title header in a flex box to allow additional elements to be added right aligned.
      $('.tsd-page-title h1').wrap('<div class="dmt-title-header-flex"></div>');
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load(page.contents);

      // Append scripts to load web components and adhoc global MDNLinks. The loaded links are returned.
      this.#addAssets($, page);

      this.#augmentGlobal($);

      page.contents = $.html();
   }

   /**
    * Copy web components bundle to docs output assets directory.
    */
   #handleRendererEnd()
   {
      const outDocs = this.#app.options.getValue('out');

      const outAssets = `${outDocs}${path.sep}assets`;
      const localDir = path.dirname(fileURLToPath(import.meta.url));

      if (this.#options?.favicon?.filepath && this.#options?.favicon?.filename)
      {
         this.#app.logger.verbose(`[dmt-theme] Copying 'dmtFavicon' to output directory.`);

         fs.copyFileSync(this.#options.favicon.filepath, `${outDocs}${path.sep}${this.#options.favicon.filename}`);
      }

      this.#app.logger.verbose(`[dmt-theme] Copying 'dmt-theme.css' to output assets directory.`);

      fs.copyFileSync(`${localDir}${path.sep}dmt-theme.css`, `${outAssets}${path.sep}dmt-theme.css`);
      fs.copyFileSync(`${localDir}${path.sep}dmt-theme.css.map`, `${outAssets}${path.sep}dmt-theme.css.map`);

      this.#app.logger.verbose(`[dmt-theme] Copying 'dmt-web-components.js' to output assets directory.`);

      fs.copyFileSync(`${localDir}${path.sep}dmt-web-components.js`, `${outAssets}${path.sep}dmt-web-components.js`);
      fs.copyFileSync(`${localDir}${path.sep}dmt-web-components.js.map`,
       `${outAssets}${path.sep}dmt-web-components.js.map`);
   }

   /**
    * Parses DMT options.
    */
   #parseOptions()
   {
      const dmtFavicon = this.#app.options.getValue('dmtFavicon');

      // Verify dmtFavicon path if defined.
      if (typeof dmtFavicon === 'string' && dmtFavicon.length)
      {
         try
         {
            const favicon = {};

            if (isURL(dmtFavicon))
            {
               favicon.url = dmtFavicon;
            }
            else
            {
               const faviconPath = path.resolve(dmtFavicon)

               fs.accessSync(faviconPath, fs.constants.R_OK);

               favicon.filepath = faviconPath;
               favicon.filename = path.basename(faviconPath);
            }

            this.#options.favicon = favicon;
         }
         catch (err)
         {
            this.#app.logger.warn(`[dmt-theme] 'dmtFavicon' path did not resolve: ${dmtFavicon}`);
         }
      }
   }
}

/**
 * Local helper function to test if value is a URL.
 *
 * @param {string}   value - String to test.
 *
 * @returns {boolean} Is valid URL?
 */
function isURL(value)
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
 * @typedef {object} DMTOptions
 *
 * @property {{ filepath?: string, filename?: string, url?: string }} [favicon] - Parsed data about any defined favicon.
 */