import fs from 'node:fs';
import path from 'node:path';
import { PageEvent, RendererEvent, ReflectionKind, DeclarationReflection, IndexEvent, ProjectReflection, DefaultTheme, DefaultThemeRenderContext, ParameterType, Converter } from 'typedoc';
import { fileURLToPath, URL } from 'node:url';
import { load as load$1 } from 'cheerio';
import { rollup } from 'rollup';
import { compile } from 'svelte/compiler';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import virtual from '@rollup/plugin-virtual';
import lunr from 'lunr';

/**
 * Copies a directory w/ `node:fs`.
 *
 * @param {string}   source - Source path.
 *
 * @param {string}   destination - Destination path.
 */
function copyDirectory(source, destination)
{
   fs.mkdirSync(destination, { recursive: true });

   fs.readdirSync(source, { withFileTypes: true }).forEach((entry) =>
   {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      entry.isDirectory() ? copyDirectory(sourcePath, destinationPath) : fs.copyFileSync(sourcePath, destinationPath);
   });
}

/**
 * Serializes value to a string escaping it so that it can be set as a web component attribute.
 *
 * @param {*}  value - Value to stringify and escape.
 *
 * @returns {string} Escaped string.
 */
function escapeAttr(value)
{
   return JSON.stringify(value)
   .replace(/</g, "\\u003c")
   .replace(/>/g, "\\u003e")
   .replace(/&/g, "\\u0026")
   .replace(/'/g, "\\u0027")
   .replace(/"/g, "\\u0022");
}

/**
 * Dynamically create the NavigationSite web component with the cached site navigation HTML. It is dynamically compiled
 * then rolled up and minified. This component is loaded from the main web components bundle.
 *
 * @param {string}   filepath - Output file path.
 *
 * @param {string}   navContent - Generated navigation content.
 *
 * @returns {Promise<void>}
 */
async function compileNavBundle(filepath, navContent)
{
   const configInput = {
      input: 'indexJS',
      plugins: [
         virtual({
            indexJS,
            'VirtualComponent.js': compile(`${navComponentScript}\n${navContent}`).js.code,
         }),

         resolve({
            browser: true,
            dedupe: ['svelte']
         })
      ]
   };

   const configOutput = {
      file: filepath,
      format: 'es',
      generatedCode: { constBindings: true },
      plugins: [terser()],
      sourcemap: true
   };

   const bundle = await rollup(configInput);
   await bundle.write(configOutput);
   await bundle.close();
}

/**
 * Defines the script portion of the NavigationSite web component. The static Project reflection / `index.html`
 * navigation data is merged with this script section. Given Page reflection URL that is passed in the correct
 * navigation anchor receives the `current` class on load. Additionally, all the anchor hrefs are rewritten based
 * on the category location of the current page.
 *
 * @type {string}
 */
const navComponentScript = `
<script>
   import { onMount }      from 'svelte';

   /**
    * The 'page.url' from the associated PageEvent. Used to set the 'current' class on the associated anchor.
    */
   export let pageurl = void 0;

   let pageURL;

   $: if (pageurl)
   {
      try
      {
         pageURL = unescapeAttr(pageurl);
      }
      catch (err)
      {
         console.warn("[typedoc-theme-default-modern] Navigation WC - Failure to deserialize pageurl: ", pageurl);
         console.error(err);
      }
   }

   function unescapeAttr(value)
   {
      return JSON.parse(value
       .replace(/\\\\u003c/g, "<")
       .replace(/\\\\u003e/g, ">")
       .replace(/\\\\u0026/g, "&")
       .replace(/\\\\u0027/g, "'")
       .replace(/\\\\u0022/g, '"'));
   }
   
   onMount(() =>
   {
      // Set current active anchor -----------------------------------------------------------------------------------

      if (typeof pageURL === 'string')
      {
         const activeAnchor = globalThis.document.querySelector('wc-dmt-nav a[href$="' +pageURL +'"]');
         if (activeAnchor) { activeAnchor.classList.add('current'); }
      }
      else
      {
         console.warn("[typedoc-theme-default-modern] Navigation WC - 'pageURL' not set in 'onMount'.");
      }

      // Process all anchors in navigation ---------------------------------------------------------------------------

      const baseURL = import.meta.url.replace(/assets\\/dmt\\/dmt-nav-web-component.js/, '');
      const pathURL = globalThis.location.href.replace(baseURL, '');

      const depth = (pathURL.match(/\\//) ?? []).length;
      const match = pathURL.match(/(.*)\\//);

      const reflectionCategories = new Set(['classes', 'enums', 'functions', 'interfaces', 'modules', 'types',
       'variables']);

      // All URLS in the navigation content need to potentially be rewritten if we are at a depth of 1. The URLs in the
      // generated template below are from the documentation root path.
      if (depth === 1 && match)
      {
         const regexRemovePath = new RegExp('(.*)?\\/', 'gm');
         const current = match[1];

         // Always rewrite 'modules.html'.
         const modulesAnchor = globalThis.document.querySelector('wc-dmt-nav a[href$="modules.html"]');
         if (modulesAnchor) { modulesAnchor.href = '../modules.html'; }

         // All anchors at the current path must be adjusted removing the current path.
         const currentAnchors = globalThis.document.querySelectorAll('wc-dmt-nav a[href^="' +current +'"]');
         for (let cntr = currentAnchors.length; --cntr >= 0;)
         {
            currentAnchors[cntr].href = currentAnchors[cntr].href.replace(regexRemovePath, '');
         }

         // The rest of the reflection category types must substitute a relative path one folder down.
         reflectionCategories.delete(current);

         for (const category of reflectionCategories)
         {
            const categoryReplacement = '../' +category +'/';
            const categoryAnchors = globalThis.document.querySelectorAll('wc-dmt-nav a[href^="' +category +'"]');

            for (let cntr = categoryAnchors.length; --cntr >= 0;)
            {
               categoryAnchors[cntr].href = categoryAnchors[cntr].href.replace(regexRemovePath, categoryReplacement);
            }
         }
      }
   })
</script>

<!-- Generated Navigation Below -->
`;

/**
 * Defines the index / wrapping of the NavigationSite component to create a non-shadow DOM custom element via
 * `svelte-tag`.
 *
 * @type {string}
 */
const indexJS = `
import Component        from 'svelte-tag';

import NavigationSite   from 'VirtualComponent.js';

new Component({
   component: NavigationSite,
   tagname: 'wc-dmt-nav',
   attributes:['pageurl'],
   shadow: false
});
`;

class PageRenderer
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
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt/dmt-components.css" />`));
      headEl.append($(`<link rel="stylesheet" href="${basePath}assets/dmt/dmt-theme.css" />`));

      // Append DMT components script to the head element.
      headEl.append($(`<script src="${basePath}assets/dmt/dmt-components.js" type="module" />`));

      /**
       * Configures the global options available in frontend runtime.
       *
       * @type {DMTGlobalOptions}
       */
      const dmtGlobalOptions = {
         basePath,
         search: this.#options.search,
         searchLimit: this.#options.searchLimit,
         searchQuick: this.#options.searchQuick,
         searchQuickLimit: this.#options.searchQuickLimit
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
      if (this.#options.removeDefaultModule) // Remove the module breadcrumb links.
      {
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
      }

      // Remove all breadcrumb links.
      if (this.#options.removeBreadcrumb) { $('.tsd-breadcrumb').remove(); }
   }

   /**
    * Modifications for project navigation. This is where
    *
    * @param {import('cheerio').Cheerio}  $ -
    *
    * @param {import('cheerio').Cheerio}  siteMenu -
    */
   #augmentProjectNav($, siteMenu)
   {
      // Find the first anchor with HREF ending in `modules.html` or `index.html`
      const moduleEl =
       $('nav.tsd-navigation a[href$="modules.html"]:first, nav.tsd-navigation a[href$="index.html"]:first');

      if (moduleEl.length)
      {
         // So this block of code is not great. The TypeDoc default theme caches the reflection kind SVG icons
         // and on this page it is cached in the element we are removing. The below block will clone this <g>
         // element and wrap it in a non-visible SVG element as the first child to `.site-menu`. I will be submitting a
         // PR to TypeDoc to try and externalize the SVG referenced.
         const moduleSvg = moduleEl.find('svg.tsd-kind-icon g');

         // Prepending to the site menu the cached namespace kind SVG.
         if (moduleSvg.length) { siteMenu.prepend($('<svg style="display: none;"></svg>').append(moduleSvg.clone())); }

         if (this.#options.removeDefaultModule)
         {
            // Remove the entire first project / module link.
            moduleEl.remove();
         }
         else if (this.#options.removeNavTopLevelIcon)
         {
            // Only the SVG icon needs to be removed.
            moduleEl.find('svg.tsd-kind-icon').remove();
         }
         else
         {
            // Swap the project / module li element SVG to a reference.
            moduleSvg.replaceWith($('<use href="#icon-4"></use>'));
         }
      }

      // Remove the currently selected value as this data is cached and dynamically set on load.
      siteMenu.find('a.current').removeClass('current');

      // Potentially remove the `tsd-kind-icon` SVG from all top level nav li elements. Depending on the documentation
      // goals this looks much nicer for NPM / Node packages w/ sub-path exports as it removes the top level namespace
      // SVG icon that shows up for the package paths.
      if (this.#options.removeNavTopLevelIcon)
      {
         $('ul.tsd-small-nested-navigation > li').each(function()
         {
            $(this).find('svg.tsd-kind-icon:first').remove();
         });
      }

      // Store the HTML content of the index.html navigation sidebar to load into nav web component.
      this.#navContent = siteMenu.html();

      // Stop all further generation of the navigation sidebar. This is where the magic goes down regarding the
      // 90% output disk space utilization and 80% speed up over the default theme.
      this.#app.renderer.theme?.stopNavigationGeneration();
   }

   /**
    * @param {PageEvent}   page -
    */
   #handlePageEnd(page)
   {
      const $ = load$1(page.contents);

      // Remove the `main.js` script as it is loaded after the DOM is loaded in the DMT components bundle.
      $('script[src*="/main.js"]').remove();

      const siteMenu = $('div.site-menu');

      // Save the navigation sidebar content for the main index.html page. This is used to create the dynamic
      // navigation web component. This occurs as the ~2nd page generated.
      if (page.model.kind === ReflectionKind.Project && page.url === 'index.html')
      {
         this.#augmentProjectNav($, siteMenu);
      }

      // Replace standard navigation with the `NavigationSite` web component. Send page url to select current
      // active anchor.
      siteMenu.empty().append($(`<wc-dmt-nav pageurl="${escapeAttr(page.url)}"></wc-dmt-nav>`));

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

      // This can be a potentially fragile replacement. The regex below is anchored with a lookahead assertion on
      // `a[data-toggle]` and removes the previous function call before / `initSearch();`. This works for mangled /
      // minified code.

      // See: https://github.com/TypeStrong/typedoc/blob/master/src/lib/output/themes/default/assets/bootstrap.ts#L8

      // I'll attempt to submit a PR to TypeDoc for a new default theme option `searchEnabled` that will disable the
      // default theme search index creation and loading code.

      const mainJSPath = path.join(output.outputDirectory, 'assets', 'main.js');
      if (fs.existsSync(mainJSPath))
      {
         const mainData = fs.readFileSync(mainJSPath, 'utf-8');
         const regex = /\w+\(\);(?=.*a\[data-toggle])/gm;

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

var decoder;
try {
	decoder = new TextDecoder();
} catch(error) {}
var src;
var srcEnd;
var position$1 = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings$1;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
	useRecords: false,
	mapsAsObjects: true
};
class C1Type {}
const C1 = new C1Type();
C1.name = 'MessagePack 0xC1';
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct;
// no-eval build
try {
	new Function('');
} catch(error) {
	// if eval variants are not supported, do not create inline object readers ever
	inlineObjectReadThreshold = Infinity;
}

class Unpackr {
	constructor(options) {
		if (options) {
			if (options.useRecords === false && options.mapsAsObjects === undefined)
				options.mapsAsObjects = true;
			if (options.sequential && options.trusted !== false) {
				options.trusted = true;
				if (!options.structures && options.useRecords != false) {
					options.structures = [];
					if (!options.maxSharedStructures)
						options.maxSharedStructures = 0;
				}
			}
			if (options.structures)
				options.structures.sharedLength = options.structures.length;
			else if (options.getStructures) {
				(options.structures = []).uninitialized = true; // this is what we use to denote an uninitialized structures
				options.structures.sharedLength = 0;
			}
			if (options.int64AsNumber) {
				options.int64AsType = 'number';
			}
		}
		Object.assign(this, options);
	}
	unpack(source, options) {
		if (src) {
			// re-entrant execution, save the state and restore it after we do this unpack
			return saveState(() => {
				clearSource();
				return this ? this.unpack(source, options) : Unpackr.prototype.unpack.call(defaultOptions, source, options)
			})
		}
		if (!source.buffer && source.constructor === ArrayBuffer)
			source = typeof Buffer !== 'undefined' ? Buffer.from(source) : new Uint8Array(source);
		if (typeof options === 'object') {
			srcEnd = options.end || source.length;
			position$1 = options.start || 0;
		} else {
			position$1 = 0;
			srcEnd = options > -1 ? options : source.length;
		}
		srcStringEnd = 0;
		srcString = null;
		bundledStrings$1 = null;
		src = source;
		// this provides cached access to the data view for a buffer if it is getting reused, which is a recommend
		// technique for getting data from a database where it can be copied into an existing buffer instead of creating
		// new ones
		try {
			dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
		} catch(error) {
			// if it doesn't have a buffer, maybe it is the wrong type of object
			src = null;
			if (source instanceof Uint8Array)
				throw error
			throw new Error('Source must be a Uint8Array or Buffer but was a ' + ((source && typeof source == 'object') ? source.constructor.name : typeof source))
		}
		if (this instanceof Unpackr) {
			currentUnpackr = this;
			if (this.structures) {
				currentStructures = this.structures;
				return checkedRead(options)
			} else if (!currentStructures || currentStructures.length > 0) {
				currentStructures = [];
			}
		} else {
			currentUnpackr = defaultOptions;
			if (!currentStructures || currentStructures.length > 0)
				currentStructures = [];
		}
		return checkedRead(options)
	}
	unpackMultiple(source, forEach) {
		let values, lastPosition = 0;
		try {
			sequentialMode = true;
			let size = source.length;
			let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
			if (forEach) {
				if (forEach(value, lastPosition, position$1) === false) return;
				while(position$1 < size) {
					lastPosition = position$1;
					if (forEach(checkedRead(), lastPosition, position$1) === false) {
						return
					}
				}
			}
			else {
				values = [ value ];
				while(position$1 < size) {
					lastPosition = position$1;
					values.push(checkedRead());
				}
				return values
			}
		} catch(error) {
			error.lastPosition = lastPosition;
			error.values = values;
			throw error
		} finally {
			sequentialMode = false;
			clearSource();
		}
	}
	_mergeStructures(loadedStructures, existingStructures) {
		loadedStructures = loadedStructures || [];
		if (Object.isFrozen(loadedStructures))
			loadedStructures = loadedStructures.map(structure => structure.slice(0));
		for (let i = 0, l = loadedStructures.length; i < l; i++) {
			let structure = loadedStructures[i];
			if (structure) {
				structure.isShared = true;
				if (i >= 32)
					structure.highByte = (i - 32) >> 5;
			}
		}
		loadedStructures.sharedLength = loadedStructures.length;
		for (let id in existingStructures || []) {
			if (id >= 0) {
				let structure = loadedStructures[id];
				let existing = existingStructures[id];
				if (existing) {
					if (structure)
						(loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
					loadedStructures[id] = existing;
				}
			}
		}
		return this.structures = loadedStructures
	}
	decode(source, end) {
		return this.unpack(source, end)
	}
}
function checkedRead(options) {
	try {
		if (!currentUnpackr.trusted && !sequentialMode) {
			let sharedLength = currentStructures.sharedLength || 0;
			if (sharedLength < currentStructures.length)
				currentStructures.length = sharedLength;
		}
		let result;
		if (currentUnpackr.randomAccessStructure && src[position$1] < 0x40 && src[position$1] >= 0x20 && readStruct) {
			result = readStruct(src, position$1, srcEnd, currentUnpackr);
			src = null; // dispose of this so that recursive unpack calls don't save state
			if (!(options && options.lazy) && result)
				result = result.toJSON();
			position$1 = srcEnd;
		} else
			result = read();
		if (bundledStrings$1) { // bundled strings to skip past
			position$1 = bundledStrings$1.postBundlePosition;
			bundledStrings$1 = null;
		}
		if (sequentialMode)
			// we only need to restore the structures if there was an error, but if we completed a read,
			// we can clear this out and keep the structures we read
			currentStructures.restoreStructures = null;

		if (position$1 == srcEnd) {
			// finished reading this source, cleanup references
			if (currentStructures && currentStructures.restoreStructures)
				restoreStructures();
			currentStructures = null;
			src = null;
			if (referenceMap)
				referenceMap = null;
		} else if (position$1 > srcEnd) {
			// over read
			throw new Error('Unexpected end of MessagePack data')
		} else if (!sequentialMode) {
			let jsonView;
			try {
				jsonView = JSON.stringify(result, (_, value) => typeof value === "bigint" ? `${value}n` : value).slice(0, 100);
			} catch(error) {
				jsonView = '(JSON view not available ' + error + ')';
			}
			throw new Error('Data read, but end of buffer not reached ' + jsonView)
		}
		// else more to read, but we are reading sequentially, so don't clear source yet
		return result
	} catch(error) {
		if (currentStructures && currentStructures.restoreStructures)
			restoreStructures();
		clearSource();
		if (error instanceof RangeError || error.message.startsWith('Unexpected end of buffer') || position$1 > srcEnd) {
			error.incomplete = true;
		}
		throw error
	}
}

function restoreStructures() {
	for (let id in currentStructures.restoreStructures) {
		currentStructures[id] = currentStructures.restoreStructures[id];
	}
	currentStructures.restoreStructures = null;
}

function read() {
	let token = src[position$1++];
	if (token < 0xa0) {
		if (token < 0x80) {
			if (token < 0x40)
				return token
			else {
				let structure = currentStructures[token & 0x3f] ||
					currentUnpackr.getStructures && loadStructures()[token & 0x3f];
				if (structure) {
					if (!structure.read) {
						structure.read = createStructureReader(structure, token & 0x3f);
					}
					return structure.read()
				} else
					return token
			}
		} else if (token < 0x90) {
			// map
			token -= 0x80;
			if (currentUnpackr.mapsAsObjects) {
				let object = {};
				for (let i = 0; i < token; i++) {
					let key = readKey();
					if (key === '__proto__')
						key = '__proto_';
					object[key] = read();
				}
				return object
			} else {
				let map = new Map();
				for (let i = 0; i < token; i++) {
					map.set(read(), read());
				}
				return map
			}
		} else {
			token -= 0x90;
			let array = new Array(token);
			for (let i = 0; i < token; i++) {
				array[i] = read();
			}
			if (currentUnpackr.freezeData)
				return Object.freeze(array)
			return array
		}
	} else if (token < 0xc0) {
		// fixstr
		let length = token - 0xa0;
		if (srcStringEnd >= position$1) {
			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
		}
		if (srcStringEnd == 0 && srcEnd < 140) {
			// for small blocks, avoiding the overhead of the extract call is helpful
			let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
			if (string != null)
				return string
		}
		return readFixedString(length)
	} else {
		let value;
		switch (token) {
			case 0xc0: return null
			case 0xc1:
				if (bundledStrings$1) {
					value = read(); // followed by the length of the string in characters (not bytes!)
					if (value > 0)
						return bundledStrings$1[1].slice(bundledStrings$1.position1, bundledStrings$1.position1 += value)
					else
						return bundledStrings$1[0].slice(bundledStrings$1.position0, bundledStrings$1.position0 -= value)
				}
				return C1; // "never-used", return special object to denote that
			case 0xc2: return false
			case 0xc3: return true
			case 0xc4:
				// bin 8
				value = src[position$1++];
				if (value === undefined)
					throw new Error('Unexpected end of buffer')
				return readBin(value)
			case 0xc5:
				// bin 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readBin(value)
			case 0xc6:
				// bin 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readBin(value)
			case 0xc7:
				// ext 8
				return readExt(src[position$1++])
			case 0xc8:
				// ext 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readExt(value)
			case 0xc9:
				// ext 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readExt(value)
			case 0xca:
				value = dataView.getFloat32(position$1);
				if (currentUnpackr.useFloat32 > 2) {
					// this does rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
					let multiplier = mult10[((src[position$1] & 0x7f) << 1) | (src[position$1 + 1] >> 7)];
					position$1 += 4;
					return ((multiplier * value + (value > 0 ? 0.5 : -0.5)) >> 0) / multiplier
				}
				position$1 += 4;
				return value
			case 0xcb:
				value = dataView.getFloat64(position$1);
				position$1 += 8;
				return value
			// uint handlers
			case 0xcc:
				return src[position$1++]
			case 0xcd:
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return value
			case 0xce:
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return value
			case 0xcf:
				if (currentUnpackr.int64AsType === 'number') {
					value = dataView.getUint32(position$1) * 0x100000000;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === 'string') {
					value = dataView.getBigUint64(position$1).toString();
				} else if (currentUnpackr.int64AsType === 'auto') {
					value = dataView.getBigUint64(position$1);
					if (value<=BigInt(2)<<BigInt(52)) value=Number(value);
				} else
					value = dataView.getBigUint64(position$1);
				position$1 += 8;
				return value

			// int handlers
			case 0xd0:
				return dataView.getInt8(position$1++)
			case 0xd1:
				value = dataView.getInt16(position$1);
				position$1 += 2;
				return value
			case 0xd2:
				value = dataView.getInt32(position$1);
				position$1 += 4;
				return value
			case 0xd3:
				if (currentUnpackr.int64AsType === 'number') {
					value = dataView.getInt32(position$1) * 0x100000000;
					value += dataView.getUint32(position$1 + 4);
				} else if (currentUnpackr.int64AsType === 'string') {
					value = dataView.getBigInt64(position$1).toString();
				} else if (currentUnpackr.int64AsType === 'auto') {
					value = dataView.getBigInt64(position$1);
					if (value>=BigInt(-2)<<BigInt(52)&&value<=BigInt(2)<<BigInt(52)) value=Number(value);
				} else
					value = dataView.getBigInt64(position$1);
				position$1 += 8;
				return value

			case 0xd4:
				// fixext 1
				value = src[position$1++];
				if (value == 0x72) {
					return recordDefinition(src[position$1++] & 0x3f)
				} else {
					let extension = currentExtensions[value];
					if (extension) {
						if (extension.read) {
							position$1++; // skip filler byte
							return extension.read(read())
						} else if (extension.noBuffer) {
							position$1++; // skip filler byte
							return extension()
						} else
							return extension(src.subarray(position$1, ++position$1))
					} else
						throw new Error('Unknown extension ' + value)
				}
			case 0xd5:
				// fixext 2
				value = src[position$1];
				if (value == 0x72) {
					position$1++;
					return recordDefinition(src[position$1++] & 0x3f, src[position$1++])
				} else
					return readExt(2)
			case 0xd6:
				// fixext 4
				return readExt(4)
			case 0xd7:
				// fixext 8
				return readExt(8)
			case 0xd8:
				// fixext 16
				return readExt(16)
			case 0xd9:
			// str 8
				value = src[position$1++];
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString8(value)
			case 0xda:
			// str 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString16(value)
			case 0xdb:
			// str 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				if (srcStringEnd >= position$1) {
					return srcString.slice(position$1 - srcStringStart, (position$1 += value) - srcStringStart)
				}
				return readString32(value)
			case 0xdc:
			// array 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readArray(value)
			case 0xdd:
			// array 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readArray(value)
			case 0xde:
			// map 16
				value = dataView.getUint16(position$1);
				position$1 += 2;
				return readMap(value)
			case 0xdf:
			// map 32
				value = dataView.getUint32(position$1);
				position$1 += 4;
				return readMap(value)
			default: // negative int
				if (token >= 0xe0)
					return token - 0x100
				if (token === undefined) {
					let error = new Error('Unexpected end of MessagePack data');
					error.incomplete = true;
					throw error
				}
				throw new Error('Unknown MessagePack token ' + token)

		}
	}
}
const validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
	function readObject() {
		// This initial function is quick to instantiate, but runs slower. After several iterations pay the cost to build the faster function
		if (readObject.count++ > inlineObjectReadThreshold) {
			let readObject = structure.read = (new Function('r', 'return function(){return ' + (currentUnpackr.freezeData ? 'Object.freeze' : '') +
				'({' + structure.map(key => key === '__proto__' ? '__proto_:r()' : validName.test(key) ? key + ':r()' : ('[' + JSON.stringify(key) + ']:r()')).join(',') + '})}'))(read);
			if (structure.highByte === 0)
				structure.read = createSecondByteReader(firstId, structure.read);
			return readObject() // second byte is already read, if there is one so immediately read object
		}
		let object = {};
		for (let i = 0, l = structure.length; i < l; i++) {
			let key = structure[i];
			if (key === '__proto__')
				key = '__proto_';
			object[key] = read();
		}
		if (currentUnpackr.freezeData)
			return Object.freeze(object);
		return object
	}
	readObject.count = 0;
	if (structure.highByte === 0) {
		return createSecondByteReader(firstId, readObject)
	}
	return readObject
}

const createSecondByteReader = (firstId, read0) => {
	return function() {
		let highByte = src[position$1++];
		if (highByte === 0)
			return read0()
		let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
		let structure = currentStructures[id] || loadStructures()[id];
		if (!structure) {
			throw new Error('Record id is not defined for ' + id)
		}
		if (!structure.read)
			structure.read = createStructureReader(structure, firstId);
		return structure.read()
	}
};

function loadStructures() {
	let loadedStructures = saveState(() => {
		// save the state in case getStructures modifies our buffer
		src = null;
		return currentUnpackr.getStructures()
	});
	return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures)
}

var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
function readStringJS(length) {
	let result;
	if (length < 16) {
		if (result = shortStringInJS(length))
			return result
	}
	if (length > 64 && decoder)
		return decoder.decode(src.subarray(position$1, position$1 += length))
	const end = position$1 + length;
	const units = [];
	result = '';
	while (position$1 < end) {
		const byte1 = src[position$1++];
		if ((byte1 & 0x80) === 0) {
			// 1 byte
			units.push(byte1);
		} else if ((byte1 & 0xe0) === 0xc0) {
			// 2 bytes
			const byte2 = src[position$1++] & 0x3f;
			units.push(((byte1 & 0x1f) << 6) | byte2);
		} else if ((byte1 & 0xf0) === 0xe0) {
			// 3 bytes
			const byte2 = src[position$1++] & 0x3f;
			const byte3 = src[position$1++] & 0x3f;
			units.push(((byte1 & 0x1f) << 12) | (byte2 << 6) | byte3);
		} else if ((byte1 & 0xf8) === 0xf0) {
			// 4 bytes
			const byte2 = src[position$1++] & 0x3f;
			const byte3 = src[position$1++] & 0x3f;
			const byte4 = src[position$1++] & 0x3f;
			let unit = ((byte1 & 0x07) << 0x12) | (byte2 << 0x0c) | (byte3 << 0x06) | byte4;
			if (unit > 0xffff) {
				unit -= 0x10000;
				units.push(((unit >>> 10) & 0x3ff) | 0xd800);
				unit = 0xdc00 | (unit & 0x3ff);
			}
			units.push(unit);
		} else {
			units.push(byte1);
		}

		if (units.length >= 0x1000) {
			result += fromCharCode.apply(String, units);
			units.length = 0;
		}
	}

	if (units.length > 0) {
		result += fromCharCode.apply(String, units);
	}

	return result
}

function readArray(length) {
	let array = new Array(length);
	for (let i = 0; i < length; i++) {
		array[i] = read();
	}
	if (currentUnpackr.freezeData)
		return Object.freeze(array)
	return array
}

function readMap(length) {
	if (currentUnpackr.mapsAsObjects) {
		let object = {};
		for (let i = 0; i < length; i++) {
			let key = readKey();
			if (key === '__proto__')
				key = '__proto_';
			object[key] = read();
		}
		return object
	} else {
		let map = new Map();
		for (let i = 0; i < length; i++) {
			map.set(read(), read());
		}
		return map
	}
}

var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
	let start = position$1;
	let bytes = new Array(length);
	for (let i = 0; i < length; i++) {
		const byte = src[position$1++];
		if ((byte & 0x80) > 0) {
				position$1 = start;
				return
			}
			bytes[i] = byte;
		}
		return fromCharCode.apply(String, bytes)
}
function shortStringInJS(length) {
	if (length < 4) {
		if (length < 2) {
			if (length === 0)
				return ''
			else {
				let a = src[position$1++];
				if ((a & 0x80) > 1) {
					position$1 -= 1;
					return
				}
				return fromCharCode(a)
			}
		} else {
			let a = src[position$1++];
			let b = src[position$1++];
			if ((a & 0x80) > 0 || (b & 0x80) > 0) {
				position$1 -= 2;
				return
			}
			if (length < 3)
				return fromCharCode(a, b)
			let c = src[position$1++];
			if ((c & 0x80) > 0) {
				position$1 -= 3;
				return
			}
			return fromCharCode(a, b, c)
		}
	} else {
		let a = src[position$1++];
		let b = src[position$1++];
		let c = src[position$1++];
		let d = src[position$1++];
		if ((a & 0x80) > 0 || (b & 0x80) > 0 || (c & 0x80) > 0 || (d & 0x80) > 0) {
			position$1 -= 4;
			return
		}
		if (length < 6) {
			if (length === 4)
				return fromCharCode(a, b, c, d)
			else {
				let e = src[position$1++];
				if ((e & 0x80) > 0) {
					position$1 -= 5;
					return
				}
				return fromCharCode(a, b, c, d, e)
			}
		} else if (length < 8) {
			let e = src[position$1++];
			let f = src[position$1++];
			if ((e & 0x80) > 0 || (f & 0x80) > 0) {
				position$1 -= 6;
				return
			}
			if (length < 7)
				return fromCharCode(a, b, c, d, e, f)
			let g = src[position$1++];
			if ((g & 0x80) > 0) {
				position$1 -= 7;
				return
			}
			return fromCharCode(a, b, c, d, e, f, g)
		} else {
			let e = src[position$1++];
			let f = src[position$1++];
			let g = src[position$1++];
			let h = src[position$1++];
			if ((e & 0x80) > 0 || (f & 0x80) > 0 || (g & 0x80) > 0 || (h & 0x80) > 0) {
				position$1 -= 8;
				return
			}
			if (length < 10) {
				if (length === 8)
					return fromCharCode(a, b, c, d, e, f, g, h)
				else {
					let i = src[position$1++];
					if ((i & 0x80) > 0) {
						position$1 -= 9;
						return
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i)
				}
			} else if (length < 12) {
				let i = src[position$1++];
				let j = src[position$1++];
				if ((i & 0x80) > 0 || (j & 0x80) > 0) {
					position$1 -= 10;
					return
				}
				if (length < 11)
					return fromCharCode(a, b, c, d, e, f, g, h, i, j)
				let k = src[position$1++];
				if ((k & 0x80) > 0) {
					position$1 -= 11;
					return
				}
				return fromCharCode(a, b, c, d, e, f, g, h, i, j, k)
			} else {
				let i = src[position$1++];
				let j = src[position$1++];
				let k = src[position$1++];
				let l = src[position$1++];
				if ((i & 0x80) > 0 || (j & 0x80) > 0 || (k & 0x80) > 0 || (l & 0x80) > 0) {
					position$1 -= 12;
					return
				}
				if (length < 14) {
					if (length === 12)
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l)
					else {
						let m = src[position$1++];
						if ((m & 0x80) > 0) {
							position$1 -= 13;
							return
						}
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m)
					}
				} else {
					let m = src[position$1++];
					let n = src[position$1++];
					if ((m & 0x80) > 0 || (n & 0x80) > 0) {
						position$1 -= 14;
						return
					}
					if (length < 15)
						return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n)
					let o = src[position$1++];
					if ((o & 0x80) > 0) {
						position$1 -= 15;
						return
					}
					return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
				}
			}
		}
	}
}

function readOnlyJSString() {
	let token = src[position$1++];
	let length;
	if (token < 0xc0) {
		// fixstr
		length = token - 0xa0;
	} else {
		switch(token) {
			case 0xd9:
			// str 8
				length = src[position$1++];
				break
			case 0xda:
			// str 16
				length = dataView.getUint16(position$1);
				position$1 += 2;
				break
			case 0xdb:
			// str 32
				length = dataView.getUint32(position$1);
				position$1 += 4;
				break
			default:
				throw new Error('Expected string')
		}
	}
	return readStringJS(length)
}


function readBin(length) {
	return currentUnpackr.copyBuffers ?
		// specifically use the copying slice (not the node one)
		Uint8Array.prototype.slice.call(src, position$1, position$1 += length) :
		src.subarray(position$1, position$1 += length)
}
function readExt(length) {
	let type = src[position$1++];
	if (currentExtensions[type]) {
		let end;
		return currentExtensions[type](src.subarray(position$1, end = (position$1 += length)), (readPosition) => {
			position$1 = readPosition;
			try {
				return read();
			} finally {
				position$1 = end;
			}
		})
	}
	else
		throw new Error('Unknown extension type ' + type)
}

var keyCache = new Array(4096);
function readKey() {
	let length = src[position$1++];
	if (length >= 0xa0 && length < 0xc0) {
		// fixstr, potentially use key cache
		length = length - 0xa0;
		if (srcStringEnd >= position$1) // if it has been extracted, must use it (and faster anyway)
			return srcString.slice(position$1 - srcStringStart, (position$1 += length) - srcStringStart)
		else if (!(srcStringEnd == 0 && srcEnd < 180))
			return readFixedString(length)
	} else { // not cacheable, go back and do a standard read
		position$1--;
		return read().toString()
	}
	let key = ((length << 5) ^ (length > 1 ? dataView.getUint16(position$1) : length > 0 ? src[position$1] : 0)) & 0xfff;
	let entry = keyCache[key];
	let checkPosition = position$1;
	let end = position$1 + length - 3;
	let chunk;
	let i = 0;
	if (entry && entry.bytes == length) {
		while (checkPosition < end) {
			chunk = dataView.getUint32(checkPosition);
			if (chunk != entry[i++]) {
				checkPosition = 0x70000000;
				break
			}
			checkPosition += 4;
		}
		end += 3;
		while (checkPosition < end) {
			chunk = src[checkPosition++];
			if (chunk != entry[i++]) {
				checkPosition = 0x70000000;
				break
			}
		}
		if (checkPosition === end) {
			position$1 = checkPosition;
			return entry.string
		}
		end -= 3;
		checkPosition = position$1;
	}
	entry = [];
	keyCache[key] = entry;
	entry.bytes = length;
	while (checkPosition < end) {
		chunk = dataView.getUint32(checkPosition);
		entry.push(chunk);
		checkPosition += 4;
	}
	end += 3;
	while (checkPosition < end) {
		chunk = src[checkPosition++];
		entry.push(chunk);
	}
	// for small blocks, avoiding the overhead of the extract call is helpful
	let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
	if (string != null)
		return entry.string = string
	return entry.string = readFixedString(length)
}

// the registration of the record definition extension (as "r")
const recordDefinition = (id, highByte) => {
	let structure = read().map(property => property.toString()); // ensure that all keys are strings and that the array is mutable
	let firstByte = id;
	if (highByte !== undefined) {
		id = id < 32 ? -((highByte << 5) + id) : ((highByte << 5) + id);
		structure.highByte = highByte;
	}
	let existingStructure = currentStructures[id];
	// If it is a shared structure, we need to restore any changes after reading.
	// Also in sequential mode, we may get incomplete reads and thus errors, and we need to restore
	// to the state prior to an incomplete read in order to properly resume.
	if (existingStructure && (existingStructure.isShared || sequentialMode)) {
		(currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
	}
	currentStructures[id] = structure;
	structure.read = createStructureReader(structure, firstByte);
	return structure.read()
};
currentExtensions[0] = () => {}; // notepack defines extension 0 to mean undefined, so use that as the default here
currentExtensions[0].noBuffer = true;

let errors = { Error, TypeError, ReferenceError };
currentExtensions[0x65] = () => {
	let data = read();
	return (errors[data[0]] || Error)(data[1])
};

currentExtensions[0x69] = (data) => {
	// id extension (for structured clones)
	let id = dataView.getUint32(position$1 - 4);
	if (!referenceMap)
		referenceMap = new Map();
	let token = src[position$1];
	let target;
	// TODO: handle Maps, Sets, and other types that can cycle; this is complicated, because you potentially need to read
	// ahead past references to record structure definitions
	if (token >= 0x90 && token < 0xa0 || token == 0xdc || token == 0xdd)
		target = [];
	else
		target = {};

	let refEntry = { target }; // a placeholder object
	referenceMap.set(id, refEntry);
	let targetProperties = read(); // read the next value as the target object to id
	if (refEntry.used) // there is a cycle, so we have to assign properties to original target
		return Object.assign(target, targetProperties)
	refEntry.target = targetProperties; // the placeholder wasn't used, replace with the deserialized one
	return targetProperties // no cycle, can just use the returned read object
};

currentExtensions[0x70] = (data) => {
	// pointer extension (for structured clones)
	let id = dataView.getUint32(position$1 - 4);
	let refEntry = referenceMap.get(id);
	refEntry.used = true;
	return refEntry.target
};

currentExtensions[0x73] = () => new Set(read());

const typedArrays = ['Int8','Uint8','Uint8Clamped','Int16','Uint16','Int32','Uint32','Float32','Float64','BigInt64','BigUint64'].map(type => type + 'Array');

let glbl = typeof globalThis === 'object' ? globalThis : window;
currentExtensions[0x74] = (data) => {
	let typeCode = data[0];
	let typedArrayName = typedArrays[typeCode];
	if (!typedArrayName)
		throw new Error('Could not find typed array for code ' + typeCode)
	// we have to always slice/copy here to get a new ArrayBuffer that is word/byte aligned
	return new glbl[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer)
};
currentExtensions[0x78] = () => {
	let data = read();
	return new RegExp(data[0], data[1])
};
const TEMP_BUNDLE = [];
currentExtensions[0x62] = (data) => {
	let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
	let dataPosition = position$1;
	position$1 += dataSize - data.length;
	bundledStrings$1 = TEMP_BUNDLE;
	bundledStrings$1 = [readOnlyJSString(), readOnlyJSString()];
	bundledStrings$1.position0 = 0;
	bundledStrings$1.position1 = 0;
	bundledStrings$1.postBundlePosition = position$1;
	position$1 = dataPosition;
	return read()
};

currentExtensions[0xff] = (data) => {
	// 32-bit date extension
	if (data.length == 4)
		return new Date((data[0] * 0x1000000 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1000)
	else if (data.length == 8)
		return new Date(
			((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1000000 +
			((data[3] & 0x3) * 0x100000000 + data[4] * 0x1000000 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1000)
	else if (data.length == 12)// TODO: Implement support for negative
		return new Date(
			((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1000000 +
			(((data[4] & 0x80) ? -0x1000000000000 : 0) + data[6] * 0x10000000000 + data[7] * 0x100000000 + data[8] * 0x1000000 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1000)
	else
		return new Date('invalid')
}; // notepack defines extension 0 to mean undefined, so use that as the default here
// registration of bulk record definition?
// currentExtensions[0x52] = () =>

function saveState(callback) {
	let savedSrcEnd = srcEnd;
	let savedPosition = position$1;
	let savedSrcStringStart = srcStringStart;
	let savedSrcStringEnd = srcStringEnd;
	let savedSrcString = srcString;
	let savedReferenceMap = referenceMap;
	let savedBundledStrings = bundledStrings$1;

	// TODO: We may need to revisit this if we do more external calls to user code (since it could be slow)
	let savedSrc = new Uint8Array(src.slice(0, srcEnd)); // we copy the data in case it changes while external data is processed
	let savedStructures = currentStructures;
	let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
	let savedPackr = currentUnpackr;
	let savedSequentialMode = sequentialMode;
	let value = callback();
	srcEnd = savedSrcEnd;
	position$1 = savedPosition;
	srcStringStart = savedSrcStringStart;
	srcStringEnd = savedSrcStringEnd;
	srcString = savedSrcString;
	referenceMap = savedReferenceMap;
	bundledStrings$1 = savedBundledStrings;
	src = savedSrc;
	sequentialMode = savedSequentialMode;
	currentStructures = savedStructures;
	currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
	currentUnpackr = savedPackr;
	dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
	return value
}
function clearSource() {
	src = null;
	referenceMap = null;
	currentStructures = null;
}

const mult10 = new Array(147); // this is a table matching binary exponents to the multiplier to determine significant digit rounding
for (let i = 0; i < 256; i++) {
	mult10[i] = +('1e' + Math.floor(45.15 - i * 0.30103));
}
var defaultUnpackr = new Unpackr({ useRecords: false });
defaultUnpackr.unpack;
defaultUnpackr.unpackMultiple;
defaultUnpackr.unpack;
let f32Array = new Float32Array(1);
new Uint8Array(f32Array.buffer, 0, 4);

let textEncoder;
try {
	textEncoder = new TextEncoder();
} catch (error) {}
let extensions, extensionClasses;
const hasNodeBuffer = typeof Buffer !== 'undefined';
const ByteArrayAllocate = hasNodeBuffer ?
	function(length) { return Buffer.allocUnsafeSlow(length) } : Uint8Array;
const ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
const MAX_BUFFER_SIZE = hasNodeBuffer ? 0x100000000 : 0x7fd00000;
let target, keysTarget;
let targetView;
let position = 0;
let safeEnd;
let bundledStrings = null;
let writeStructSlots;
const MAX_BUNDLE_SIZE = 0x5500; // maximum characters such that the encoded bytes fits in 16 bits.
const hasNonLatin = /[\u0080-\uFFFF]/;
const RECORD_SYMBOL = Symbol('record-id');
class Packr extends Unpackr {
	constructor(options) {
		super(options);
		this.offset = 0;
		let start;
		let hasSharedUpdate;
		let structures;
		let referenceMap;
		let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position) {
			return target.utf8Write(string, position, 0xffffffff)
		} : (textEncoder && textEncoder.encodeInto) ?
			function(string, position) {
				return textEncoder.encodeInto(string, target.subarray(position)).written
			} : false;

		let packr = this;
		if (!options)
			options = {};
		let isSequential = options && options.sequential;
		let hasSharedStructures = options.structures || options.saveStructures;
		let maxSharedStructures = options.maxSharedStructures;
		if (maxSharedStructures == null)
			maxSharedStructures = hasSharedStructures ? 32 : 0;
		if (maxSharedStructures > 8160)
			throw new Error('Maximum maxSharedStructure is 8160')
		if (options.structuredClone && options.moreTypes == undefined) {
			this.moreTypes = true;
		}
		let maxOwnStructures = options.maxOwnStructures;
		if (maxOwnStructures == null)
			maxOwnStructures = hasSharedStructures ? 32 : 64;
		if (!this.structures && options.useRecords != false)
			this.structures = [];
		// two byte record ids for shared structures
		let useTwoByteRecords = maxSharedStructures > 32 || (maxOwnStructures + maxSharedStructures > 64);		
		let sharedLimitId = maxSharedStructures + 0x40;
		let maxStructureId = maxSharedStructures + maxOwnStructures + 0x40;
		if (maxStructureId > 8256) {
			throw new Error('Maximum maxSharedStructure + maxOwnStructure is 8192')
		}
		let recordIdsToRemove = [];
		let transitionsCount = 0;
		let serializationsSinceTransitionRebuild = 0;

		this.pack = this.encode = function(value, encodeOptions) {
			if (!target) {
				target = new ByteArrayAllocate(8192);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
				position = 0;
			}
			safeEnd = target.length - 10;
			if (safeEnd - position < 0x800) {
				// don't start too close to the end, 
				target = new ByteArrayAllocate(target.length);
				targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
				safeEnd = target.length - 10;
				position = 0;
			} else
				position = (position + 7) & 0x7ffffff8; // Word align to make any future copying of this buffer faster
			start = position;
			referenceMap = packr.structuredClone ? new Map() : null;
			if (packr.bundleStrings && typeof value !== 'string') {
				bundledStrings = [];
				bundledStrings.size = Infinity; // force a new bundle start on first string
			} else
				bundledStrings = null;
			structures = packr.structures;
			if (structures) {
				if (structures.uninitialized)
					structures = packr._mergeStructures(packr.getStructures());
				let sharedLength = structures.sharedLength || 0;
				if (sharedLength > maxSharedStructures) {
					//if (maxSharedStructures <= 32 && structures.sharedLength > 32) // TODO: could support this, but would need to update the limit ids
					throw new Error('Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to ' + structures.sharedLength)
				}
				if (!structures.transitions) {
					// rebuild our structure transitions
					structures.transitions = Object.create(null);
					for (let i = 0; i < sharedLength; i++) {
						let keys = structures[i];
						if (!keys)
							continue
						let nextTransition, transition = structures.transitions;
						for (let j = 0, l = keys.length; j < l; j++) {
							let key = keys[j];
							nextTransition = transition[key];
							if (!nextTransition) {
								nextTransition = transition[key] = Object.create(null);
							}
							transition = nextTransition;
						}
						transition[RECORD_SYMBOL] = i + 0x40;
					}
					this.lastNamedStructuresLength = sharedLength;
				}
				if (!isSequential) {
					structures.nextId = sharedLength + 0x40;
				}
			}
			if (hasSharedUpdate)
				hasSharedUpdate = false;
			try {
				if (packr.randomAccessStructure && value && value.constructor && value.constructor === Object)
					writeStruct(value);
				else
					pack(value);
				let lastBundle = bundledStrings;
				if (bundledStrings)
					writeBundles(start, pack, 0);
				if (referenceMap && referenceMap.idsToInsert) {
					let idsToInsert = referenceMap.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
					let i = idsToInsert.length;
					let incrementPosition = -1;
					while (lastBundle && i > 0) {
						let insertionPoint = idsToInsert[--i].offset + start;
						if (insertionPoint < (lastBundle.stringsPosition + start) && incrementPosition === -1)
							incrementPosition = 0;
						if (insertionPoint > (lastBundle.position + start)) {
							if (incrementPosition >= 0)
								incrementPosition += 6;
						} else {
							if (incrementPosition >= 0) {
								// update the bundle reference now
								targetView.setUint32(lastBundle.position + start,
									targetView.getUint32(lastBundle.position + start) + incrementPosition);
								incrementPosition = -1; // reset
							}
							lastBundle = lastBundle.previous;
							i++;
						}
					}
					if (incrementPosition >= 0 && lastBundle) {
						// update the bundle reference now
						targetView.setUint32(lastBundle.position + start,
							targetView.getUint32(lastBundle.position + start) + incrementPosition);
					}
					position += idsToInsert.length * 6;
					if (position > safeEnd)
						makeRoom(position);
					packr.offset = position;
					let serialized = insertIds(target.subarray(start, position), idsToInsert);
					referenceMap = null;
					return serialized
				}
				packr.offset = position; // update the offset so next serialization doesn't write over our buffer, but can continue writing to same buffer sequentially
				if (encodeOptions & REUSE_BUFFER_MODE) {
					target.start = start;
					target.end = position;
					return target
				}
				return target.subarray(start, position) // position can change if we call pack again in saveStructures, so we get the buffer now
			} finally {
				if (structures) {
					if (serializationsSinceTransitionRebuild < 10)
						serializationsSinceTransitionRebuild++;
					let sharedLength = structures.sharedLength || 0;
					if (structures.length > sharedLength && !isSequential)
						structures.length = sharedLength;
					if (transitionsCount > 10000) {
						// force a rebuild occasionally after a lot of transitions so it can get cleaned up
						structures.transitions = null;
						serializationsSinceTransitionRebuild = 0;
						transitionsCount = 0;
						if (recordIdsToRemove.length > 0)
							recordIdsToRemove = [];
					} else if (recordIdsToRemove.length > 0 && !isSequential) {
						for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
							recordIdsToRemove[i][RECORD_SYMBOL] = 0;
						}
						recordIdsToRemove = [];
					}
					if (hasSharedUpdate && packr.saveStructures) {
						// we can't rely on start/end with REUSE_BUFFER_MODE since they will (probably) change when we save
						let returnBuffer = target.subarray(start, position);
						let newSharedData = prepareStructures(structures, packr);
						if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
							// get updated structures and try again if the update failed
							return packr.pack(value)
						}
						packr.lastNamedStructuresLength = sharedLength;
						return returnBuffer
					}
				}
				if (encodeOptions & RESET_BUFFER_MODE)
					position = start;
			}
		};
		const packArray = (value) => {
			var length = value.length;
			if (length < 0x10) {
				target[position++] = 0x90 | length;
			} else if (length < 0x10000) {
				target[position++] = 0xdc;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xdd;
				targetView.setUint32(position, length);
				position += 4;
			}
			for (let i = 0; i < length; i++) {
				pack(value[i]);
			}
		};
		const pack = (value) => {
			if (position > safeEnd)
				target = makeRoom(position);

			var type = typeof value;
			var length;
			if (type === 'string') {
				let strLength = value.length;
				if (bundledStrings && strLength >= 4 && strLength < 0x1000) {
					if ((bundledStrings.size += strLength) > MAX_BUNDLE_SIZE) {
						let extStart;
						let maxBytes = (bundledStrings[0] ? bundledStrings[0].length * 3 + bundledStrings[1].length : 0) + 10;
						if (position + maxBytes > safeEnd)
							target = makeRoom(position + maxBytes);
						let lastBundle;
						if (bundledStrings.position) { // here we use the 0x62 extension to write the last bundle and reserve space for the reference pointer to the next/current bundle
							lastBundle = bundledStrings;
							target[position] = 0xc8; // ext 16
							position += 3; // reserve for the writing bundle size
							target[position++] = 0x62; // 'b'
							extStart = position - start;
							position += 4; // reserve for writing bundle reference
							writeBundles(start, pack, 0); // write the last bundles
							targetView.setUint16(extStart + start - 3, position - start - extStart);
						} else { // here we use the 0x62 extension just to reserve the space for the reference pointer to the bundle (will be updated once the bundle is written)
							target[position++] = 0xd6; // fixext 4
							target[position++] = 0x62; // 'b'
							extStart = position - start;
							position += 4; // reserve for writing bundle reference
						}
						bundledStrings = ['', '']; // create new ones
						bundledStrings.previous = lastBundle;
						bundledStrings.size = 0;
						bundledStrings.position = extStart;
					}
					let twoByte = hasNonLatin.test(value);
					bundledStrings[twoByte ? 0 : 1] += value;
					target[position++] = 0xc1;
					pack(twoByte ? -strLength : strLength);
					return
				}
				let headerSize;
				// first we estimate the header size, so we can write to the correct location
				if (strLength < 0x20) {
					headerSize = 1;
				} else if (strLength < 0x100) {
					headerSize = 2;
				} else if (strLength < 0x10000) {
					headerSize = 3;
				} else {
					headerSize = 5;
				}
				let maxBytes = strLength * 3;
				if (position + maxBytes > safeEnd)
					target = makeRoom(position + maxBytes);

				if (strLength < 0x40 || !encodeUtf8) {
					let i, c1, c2, strPosition = position + headerSize;
					for (i = 0; i < strLength; i++) {
						c1 = value.charCodeAt(i);
						if (c1 < 0x80) {
							target[strPosition++] = c1;
						} else if (c1 < 0x800) {
							target[strPosition++] = c1 >> 6 | 0xc0;
							target[strPosition++] = c1 & 0x3f | 0x80;
						} else if (
							(c1 & 0xfc00) === 0xd800 &&
							((c2 = value.charCodeAt(i + 1)) & 0xfc00) === 0xdc00
						) {
							c1 = 0x10000 + ((c1 & 0x03ff) << 10) + (c2 & 0x03ff);
							i++;
							target[strPosition++] = c1 >> 18 | 0xf0;
							target[strPosition++] = c1 >> 12 & 0x3f | 0x80;
							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[strPosition++] = c1 & 0x3f | 0x80;
						} else {
							target[strPosition++] = c1 >> 12 | 0xe0;
							target[strPosition++] = c1 >> 6 & 0x3f | 0x80;
							target[strPosition++] = c1 & 0x3f | 0x80;
						}
					}
					length = strPosition - position - headerSize;
				} else {
					length = encodeUtf8(value, position + headerSize);
				}

				if (length < 0x20) {
					target[position++] = 0xa0 | length;
				} else if (length < 0x100) {
					if (headerSize < 2) {
						target.copyWithin(position + 2, position + 1, position + 1 + length);
					}
					target[position++] = 0xd9;
					target[position++] = length;
				} else if (length < 0x10000) {
					if (headerSize < 3) {
						target.copyWithin(position + 3, position + 2, position + 2 + length);
					}
					target[position++] = 0xda;
					target[position++] = length >> 8;
					target[position++] = length & 0xff;
				} else {
					if (headerSize < 5) {
						target.copyWithin(position + 5, position + 3, position + 3 + length);
					}
					target[position++] = 0xdb;
					targetView.setUint32(position, length);
					position += 4;
				}
				position += length;
			} else if (type === 'number') {
				if (value >>> 0 === value) {// positive integer, 32-bit or less
					// positive uint
					if (value < 0x20 || (value < 0x80 && this.useRecords === false) || (value < 0x40 && !this.randomAccessStructure)) {
						target[position++] = value;
					} else if (value < 0x100) {
						target[position++] = 0xcc;
						target[position++] = value;
					} else if (value < 0x10000) {
						target[position++] = 0xcd;
						target[position++] = value >> 8;
						target[position++] = value & 0xff;
					} else {
						target[position++] = 0xce;
						targetView.setUint32(position, value);
						position += 4;
					}
				} else if (value >> 0 === value) { // negative integer
					if (value >= -0x20) {
						target[position++] = 0x100 + value;
					} else if (value >= -0x80) {
						target[position++] = 0xd0;
						target[position++] = value + 0x100;
					} else if (value >= -0x8000) {
						target[position++] = 0xd1;
						targetView.setInt16(position, value);
						position += 2;
					} else {
						target[position++] = 0xd2;
						targetView.setInt32(position, value);
						position += 4;
					}
				} else {
					let useFloat32;
					if ((useFloat32 = this.useFloat32) > 0 && value < 0x100000000 && value >= -0x80000000) {
						target[position++] = 0xca;
						targetView.setFloat32(position, value);
						let xShifted;
						if (useFloat32 < 4 ||
								// this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
								((xShifted = value * mult10[((target[position] & 0x7f) << 1) | (target[position + 1] >> 7)]) >> 0) === xShifted) {
							position += 4;
							return
						} else
							position--; // move back into position for writing a double
					}
					target[position++] = 0xcb;
					targetView.setFloat64(position, value);
					position += 8;
				}
			} else if (type === 'object' || type === 'function') {
				if (!value)
					target[position++] = 0xc0;
				else {
					if (referenceMap) {
						let referee = referenceMap.get(value);
						if (referee) {
							if (!referee.id) {
								let idsToInsert = referenceMap.idsToInsert || (referenceMap.idsToInsert = []);
								referee.id = idsToInsert.push(referee);
							}
							target[position++] = 0xd6; // fixext 4
							target[position++] = 0x70; // "p" for pointer
							targetView.setUint32(position, referee.id);
							position += 4;
							return
						} else 
							referenceMap.set(value, { offset: position - start });
					}
					let constructor = value.constructor;
					if (constructor === Object) {
						writeObject(value, true);
					} else if (constructor === Array) {
						packArray(value);
					} else if (constructor === Map) {
						if (this.mapAsEmptyObject) target[position++] = 0x80;
						else {
							length = value.size;
							if (length < 0x10) {
								target[position++] = 0x80 | length;
							} else if (length < 0x10000) {
								target[position++] = 0xde;
								target[position++] = length >> 8;
								target[position++] = length & 0xff;
							} else {
								target[position++] = 0xdf;
								targetView.setUint32(position, length);
								position += 4;
							}
							for (let [key, entryValue] of value) {
								pack(key);
								pack(entryValue);
							}
						}
					} else {	
						for (let i = 0, l = extensions.length; i < l; i++) {
							let extensionClass = extensionClasses[i];
							if (value instanceof extensionClass) {
								let extension = extensions[i];
								if (extension.write) {
									if (extension.type) {
										target[position++] = 0xd4; // one byte "tag" extension
										target[position++] = extension.type;
										target[position++] = 0;
									}
									let writeResult = extension.write.call(this, value);
									if (writeResult === value) { // avoid infinite recursion
										if (Array.isArray(value)) {
											packArray(value);
										} else {
											writeObject(value);
										}
									} else {
										pack(writeResult);
									}
									return
								}
								let currentTarget = target;
								let currentTargetView = targetView;
								let currentPosition = position;
								target = null;
								let result;
								try {
									result = extension.pack.call(this, value, (size) => {
										// restore target and use it
										target = currentTarget;
										currentTarget = null;
										position += size;
										if (position > safeEnd)
											makeRoom(position);
										return {
											target, targetView, position: position - size
										}
									}, pack);
								} finally {
									// restore current target information (unless already restored)
									if (currentTarget) {
										target = currentTarget;
										targetView = currentTargetView;
										position = currentPosition;
										safeEnd = target.length - 10;
									}
								}
								if (result) {
									if (result.length + position > safeEnd)
										makeRoom(result.length + position);
									position = writeExtensionData(result, target, position, extension.type);
								}
								return
							}
						}
						// check isArray after extensions, because extensions can extend Array
						if (Array.isArray(value)) {
							packArray(value);
						} else {
							// use this as an alternate mechanism for expressing how to serialize
							if (value.toJSON) {
								const json = value.toJSON();
								// if for some reason value.toJSON returns itself it'll loop forever
								if (json !== value)
									return pack(json)
							}
							
							// if there is a writeFunction, use it, otherwise just encode as undefined
							if (type === 'function')
								return pack(this.writeFunction && this.writeFunction(value));
							
							// no extension found, write as object
							writeObject(value, !value.hasOwnProperty); // if it doesn't have hasOwnProperty, don't do hasOwnProperty checks
						}
					}
				}
			} else if (type === 'boolean') {
				target[position++] = value ? 0xc3 : 0xc2;
			} else if (type === 'bigint') {
				if (value < (BigInt(1)<<BigInt(63)) && value >= -(BigInt(1)<<BigInt(63))) {
					// use a signed int as long as it fits
					target[position++] = 0xd3;
					targetView.setBigInt64(position, value);
				} else if (value < (BigInt(1)<<BigInt(64)) && value > 0) {
					// if we can fit an unsigned int, use that
					target[position++] = 0xcf;
					targetView.setBigUint64(position, value);
				} else {
					// overflow
					if (this.largeBigIntToFloat) {
						target[position++] = 0xcb;
						targetView.setFloat64(position, Number(value));
					} else {
						throw new RangeError(value + ' was too large to fit in MessagePack 64-bit integer format, set largeBigIntToFloat to convert to float-64')
					}
				}
				position += 8;
			} else if (type === 'undefined') {
				if (this.encodeUndefinedAsNil)
					target[position++] = 0xc0;
				else {
					target[position++] = 0xd4; // a number of implementations use fixext1 with type 0, data 0 to denote undefined, so we follow suite
					target[position++] = 0;
					target[position++] = 0;
				}
			} else {
				throw new Error('Unknown type: ' + type)
			}
		};

		const writePlainObject = (this.variableMapSize || this.coercibleKeyAsNumber) ? (object) => {
			// this method is slightly slower, but generates "preferred serialization" (optimally small for smaller objects)
			let keys = Object.keys(object);
			let length = keys.length;
			if (length < 0x10) {
				target[position++] = 0x80 | length;
			} else if (length < 0x10000) {
				target[position++] = 0xde;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xdf;
				targetView.setUint32(position, length);
				position += 4;
			}
			let key;
			if (this.coercibleKeyAsNumber) {
				for (let i = 0; i < length; i++) {
					key = keys[i];
					let num = Number(key);
					pack(isNaN(num) ? key : num);
					pack(object[key]);
				}

			} else {
				for (let i = 0; i < length; i++) {
					pack(key = keys[i]);
					pack(object[key]);
				}
			}
		} :
		(object, safePrototype) => {
			target[position++] = 0xde; // always using map 16, so we can preallocate and set the length afterwards
			let objectOffset = position - start;
			position += 2;
			let size = 0;
			for (let key in object) {
				if (safePrototype || object.hasOwnProperty(key)) {
					pack(key);
					pack(object[key]);
					size++;
				}
			}
			target[objectOffset++ + start] = size >> 8;
			target[objectOffset + start] = size & 0xff;
		};

		const writeRecord = this.useRecords === false ? writePlainObject :
		(options.progressiveRecords && !useTwoByteRecords) ?  // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
		(object, safePrototype) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let objectOffset = position++ - start;
			let wroteKeys;
			for (let key in object) {
				if (safePrototype || object.hasOwnProperty(key)) {
					nextTransition = transition[key];
					if (nextTransition)
						transition = nextTransition;
					else {
						// record doesn't exist, create full new record and insert it
						let keys = Object.keys(object);
						let lastTransition = transition;
						transition = structures.transitions;
						let newTransitions = 0;
						for (let i = 0, l = keys.length; i < l; i++) {
							let key = keys[i];
							nextTransition = transition[key];
							if (!nextTransition) {
								nextTransition = transition[key] = Object.create(null);
								newTransitions++;
							}
							transition = nextTransition;
						}
						if (objectOffset + start + 1 == position) {
							// first key, so we don't need to insert, we can just write record directly
							position--;
							newRecord(transition, keys, newTransitions);
						} else // otherwise we need to insert the record, moving existing data after the record
							insertNewRecord(transition, keys, objectOffset, newTransitions);
						wroteKeys = true;
						transition = lastTransition[key];
					}
					pack(object[key]);
				}
			}
			if (!wroteKeys) {
				let recordId = transition[RECORD_SYMBOL];
				if (recordId)
					target[objectOffset + start] = recordId;
				else
					insertNewRecord(transition, Object.keys(object), objectOffset, 0);
			}
		} :
		(object, safePrototype) => {
			let nextTransition, transition = structures.transitions || (structures.transitions = Object.create(null));
			let newTransitions = 0;
			for (let key in object) if (safePrototype || object.hasOwnProperty(key)) {
				nextTransition = transition[key];
				if (!nextTransition) {
					nextTransition = transition[key] = Object.create(null);
					newTransitions++;
				}
				transition = nextTransition;
			}
			let recordId = transition[RECORD_SYMBOL];
			if (recordId) {
				if (recordId >= 0x60 && useTwoByteRecords) {
					target[position++] = ((recordId -= 0x60) & 0x1f) + 0x60;
					target[position++] = recordId >> 5;
				} else
					target[position++] = recordId;
			} else {
				newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
			}
			// now write the values
			for (let key in object)
				if (safePrototype || object.hasOwnProperty(key))
					pack(object[key]);
		};

		// craete reference to useRecords if useRecords is a function
		const checkUseRecords = typeof this.useRecords == 'function' && this.useRecords;
		
		const writeObject = checkUseRecords ? (object, safePrototype) => {
			checkUseRecords(object) ? writeRecord(object,safePrototype) : writePlainObject(object,safePrototype);
		} : writeRecord;

		const makeRoom = (end) => {
			let newSize;
			if (end > 0x1000000) {
				// special handling for really large buffers
				if ((end - start) > MAX_BUFFER_SIZE)
					throw new Error('Packed buffer would be larger than maximum buffer size')
				newSize = Math.min(MAX_BUFFER_SIZE,
					Math.round(Math.max((end - start) * (end > 0x4000000 ? 1.25 : 2), 0x400000) / 0x1000) * 0x1000);
			} else // faster handling for smaller buffers
				newSize = ((Math.max((end - start) << 2, target.length - 1) >> 12) + 1) << 12;
			let newBuffer = new ByteArrayAllocate(newSize);
			targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
			end = Math.min(end, target.length);
			if (target.copy)
				target.copy(newBuffer, 0, start, end);
			else
				newBuffer.set(target.slice(start, end));
			position -= start;
			start = 0;
			safeEnd = newBuffer.length - 10;
			return target = newBuffer
		};
		const newRecord = (transition, keys, newTransitions) => {
			let recordId = structures.nextId;
			if (!recordId)
				recordId = 0x40;
			if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
				recordId = structures.nextOwnId;
				if (!(recordId < maxStructureId))
					recordId = sharedLimitId;
				structures.nextOwnId = recordId + 1;
			} else {
				if (recordId >= maxStructureId)// cycle back around
					recordId = sharedLimitId;
				structures.nextId = recordId + 1;
			}
			let highByte = keys.highByte = recordId >= 0x60 && useTwoByteRecords ? (recordId - 0x60) >> 5 : -1;
			transition[RECORD_SYMBOL] = recordId;
			transition.__keys__ = keys;
			structures[recordId - 0x40] = keys;

			if (recordId < sharedLimitId) {
				keys.isShared = true;
				structures.sharedLength = recordId - 0x3f;
				hasSharedUpdate = true;
				if (highByte >= 0) {
					target[position++] = (recordId & 0x1f) + 0x60;
					target[position++] = highByte;
				} else {
					target[position++] = recordId;
				}
			} else {
				if (highByte >= 0) {
					target[position++] = 0xd5; // fixext 2
					target[position++] = 0x72; // "r" record defintion extension type
					target[position++] = (recordId & 0x1f) + 0x60;
					target[position++] = highByte;
				} else {
					target[position++] = 0xd4; // fixext 1
					target[position++] = 0x72; // "r" record defintion extension type
					target[position++] = recordId;
				}

				if (newTransitions)
					transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
				// record the removal of the id, we can maintain our shared structure
				if (recordIdsToRemove.length >= maxOwnStructures)
					recordIdsToRemove.shift()[RECORD_SYMBOL] = 0; // we are cycling back through, and have to remove old ones
				recordIdsToRemove.push(transition);
				pack(keys);
			}
		};
		const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
			let mainTarget = target;
			let mainPosition = position;
			let mainSafeEnd = safeEnd;
			let mainStart = start;
			target = keysTarget;
			position = 0;
			start = 0;
			if (!target)
				keysTarget = target = new ByteArrayAllocate(8192);
			safeEnd = target.length - 10;
			newRecord(transition, keys, newTransitions);
			keysTarget = target;
			let keysPosition = position;
			target = mainTarget;
			position = mainPosition;
			safeEnd = mainSafeEnd;
			start = mainStart;
			if (keysPosition > 1) {
				let newEnd = position + keysPosition - 1;
				if (newEnd > safeEnd)
					makeRoom(newEnd);
				let insertionPosition = insertionOffset + start;
				target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position);
				target.set(keysTarget.slice(0, keysPosition), insertionPosition);
				position = newEnd;
			} else {
				target[insertionOffset + start] = keysTarget[0];
			}
		};
		const writeStruct = (object, safePrototype) => {
			let newPosition = writeStructSlots(object, target, position, structures, makeRoom, (value, newPosition, notifySharedUpdate) => {
				if (notifySharedUpdate)
					return hasSharedUpdate = true;
				position = newPosition;
				let startTarget = target;
				pack(value);
				if (startTarget !== target) {
					return { position, targetView, target }; // indicate the buffer was re-allocated
				}
				return position;
			}, this);
			if (newPosition === 0) // bail and go to a msgpack object
				return writeObject(object, true);
			position = newPosition;
		};
	}
	useBuffer(buffer) {
		// this means we are finished using our own buffer and we can write over it safely
		target = buffer;
		targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
		position = 0;
	}
	clearSharedData() {
		if (this.structures)
			this.structures = [];
		if (this.typedStructs)
			this.typedStructs = [];
	}
}

extensionClasses = [ Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor /*TypedArray*/, C1Type ];
extensions = [{
	pack(date, allocateForWrite, pack) {
		let seconds = date.getTime() / 1000;
		if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 0x100000000) {
			// Timestamp 32
			let { target, targetView, position} = allocateForWrite(6);
			target[position++] = 0xd6;
			target[position++] = 0xff;
			targetView.setUint32(position, seconds);
		} else if (seconds > 0 && seconds < 0x100000000) {
			// Timestamp 64
			let { target, targetView, position} = allocateForWrite(10);
			target[position++] = 0xd7;
			target[position++] = 0xff;
			targetView.setUint32(position, date.getMilliseconds() * 4000000 + ((seconds / 1000 / 0x100000000) >> 0));
			targetView.setUint32(position + 4, seconds);
		} else if (isNaN(seconds)) {
			if (this.onInvalidDate) {
				allocateForWrite(0);
				return pack(this.onInvalidDate())
			}
			// Intentionally invalid timestamp
			let { target, targetView, position} = allocateForWrite(3);
			target[position++] = 0xd4;
			target[position++] = 0xff;
			target[position++] = 0xff;
		} else {
			// Timestamp 96
			let { target, targetView, position} = allocateForWrite(15);
			target[position++] = 0xc7;
			target[position++] = 12;
			target[position++] = 0xff;
			targetView.setUint32(position, date.getMilliseconds() * 1000000);
			targetView.setBigInt64(position + 4, BigInt(Math.floor(seconds)));
		}
	}
}, {
	pack(set, allocateForWrite, pack) {
		if (this.setAsEmptyObject) {
			allocateForWrite(0);
			return pack({})
		}
		let array = Array.from(set);
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x73; // 's' for Set
			target[position++] = 0;
		}
		pack(array);
	}
}, {
	pack(error, allocateForWrite, pack) {
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x65; // 'e' for error
			target[position++] = 0;
		}
		pack([ error.name, error.message ]);
	}
}, {
	pack(regex, allocateForWrite, pack) {
		let { target, position} = allocateForWrite(this.moreTypes ? 3 : 0);
		if (this.moreTypes) {
			target[position++] = 0xd4;
			target[position++] = 0x78; // 'x' for regeXp
			target[position++] = 0;
		}
		pack([ regex.source, regex.flags ]);
	}
}, {
	pack(arrayBuffer, allocateForWrite) {
		if (this.moreTypes)
			writeExtBuffer(arrayBuffer, 0x10, allocateForWrite);
		else
			writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
	}
}, {
	pack(typedArray, allocateForWrite) {
		let constructor = typedArray.constructor;
		if (constructor !== ByteArray && this.moreTypes)
			writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
		else
			writeBuffer(typedArray, allocateForWrite);
	}
}, {
	pack(c1, allocateForWrite) { // specific 0xC1 object
		let { target, position} = allocateForWrite(1);
		target[position] = 0xc1;
	}
}];

function writeExtBuffer(typedArray, type, allocateForWrite, encode) {
	let length = typedArray.byteLength;
	if (length + 1 < 0x100) {
		var { target, position } = allocateForWrite(4 + length);
		target[position++] = 0xc7;
		target[position++] = length + 1;
	} else if (length + 1 < 0x10000) {
		var { target, position } = allocateForWrite(5 + length);
		target[position++] = 0xc8;
		target[position++] = (length + 1) >> 8;
		target[position++] = (length + 1) & 0xff;
	} else {
		var { target, position, targetView } = allocateForWrite(7 + length);
		target[position++] = 0xc9;
		targetView.setUint32(position, length + 1); // plus one for the type byte
		position += 4;
	}
	target[position++] = 0x74; // "t" for typed array
	target[position++] = type;
	target.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position);
}
function writeBuffer(buffer, allocateForWrite) {
	let length = buffer.byteLength;
	var target, position;
	if (length < 0x100) {
		var { target, position } = allocateForWrite(length + 2);
		target[position++] = 0xc4;
		target[position++] = length;
	} else if (length < 0x10000) {
		var { target, position } = allocateForWrite(length + 3);
		target[position++] = 0xc5;
		target[position++] = length >> 8;
		target[position++] = length & 0xff;
	} else {
		var { target, position, targetView } = allocateForWrite(length + 5);
		target[position++] = 0xc6;
		targetView.setUint32(position, length);
		position += 4;
	}
	target.set(buffer, position);
}

function writeExtensionData(result, target, position, type) {
	let length = result.length;
	switch (length) {
		case 1:
			target[position++] = 0xd4;
			break
		case 2:
			target[position++] = 0xd5;
			break
		case 4:
			target[position++] = 0xd6;
			break
		case 8:
			target[position++] = 0xd7;
			break
		case 16:
			target[position++] = 0xd8;
			break
		default:
			if (length < 0x100) {
				target[position++] = 0xc7;
				target[position++] = length;
			} else if (length < 0x10000) {
				target[position++] = 0xc8;
				target[position++] = length >> 8;
				target[position++] = length & 0xff;
			} else {
				target[position++] = 0xc9;
				target[position++] = length >> 24;
				target[position++] = (length >> 16) & 0xff;
				target[position++] = (length >> 8) & 0xff;
				target[position++] = length & 0xff;
			}
	}
	target[position++] = type;
	target.set(result, position);
	position += length;
	return position
}

function insertIds(serialized, idsToInsert) {
	// insert the ids that need to be referenced for structured clones
	let nextId;
	let distanceToMove = idsToInsert.length * 6;
	let lastEnd = serialized.length - distanceToMove;
	while (nextId = idsToInsert.pop()) {
		let offset = nextId.offset;
		let id = nextId.id;
		serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
		distanceToMove -= 6;
		let position = offset + distanceToMove;
		serialized[position++] = 0xd6;
		serialized[position++] = 0x69; // 'i'
		serialized[position++] = id >> 24;
		serialized[position++] = (id >> 16) & 0xff;
		serialized[position++] = (id >> 8) & 0xff;
		serialized[position++] = id & 0xff;
		lastEnd = offset;
	}
	return serialized
}

function writeBundles(start, pack, incrementPosition) {
	if (bundledStrings.length > 0) {
		targetView.setUint32(bundledStrings.position + start, position + incrementPosition - bundledStrings.position - start);
		bundledStrings.stringsPosition = position - start;
		let writeStrings = bundledStrings;
		bundledStrings = null;
		pack(writeStrings[0]);
		pack(writeStrings[1]);
	}
}
function prepareStructures(structures, packr) {
	structures.isCompatible = (existingStructures) => {
		let compatible = !existingStructures || ((packr.lastNamedStructuresLength || 0) === existingStructures.length);
		if (!compatible) // we want to merge these existing structures immediately since we already have it and we are in the right transaction
			packr._mergeStructures(existingStructures);
		return compatible;
	};
	return structures
}

let defaultPackr = new Packr({ useRecords: false });
const pack = defaultPackr.pack;
defaultPackr.pack;
const REUSE_BUFFER_MODE = 512;
const RESET_BUFFER_MODE = 1024;

// DEFLATE is a complex format; to read this code, you should probably check the RFC first:
// https://tools.ietf.org/html/rfc1951
// You may also wish to take a look at the guide I made about this program:
// https://gist.github.com/101arrowz/253f31eb5abc3d9275ab943003ffecad
// Some of the following code is similar to that of UZIP.js:
// https://github.com/photopea/UZIP.js
// However, the vast majority of the codebase has diverged from UZIP.js to increase performance and reduce bundle size.
// Sometimes 0 will appear where -1 would be more appropriate. This is because using a uint
// is better for memory in most engines (I *think*).

// aliases for shorter compressed code (most minifers don't do this)
var u8 = Uint8Array, u16 = Uint16Array, i32 = Int32Array;
// fixed length extra bits
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, /* unused */ 0, 0, /* impossible */ 0]);
// fixed distance extra bits
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, /* unused */ 0, 0]);
// code length index map
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
// get base, reverse index map from extra bits
var freb = function (eb, start) {
    var b = new u16(31);
    for (var i = 0; i < 31; ++i) {
        b[i] = start += 1 << eb[i - 1];
    }
    // numbers here are at max 18 bits
    var r = new i32(b[30]);
    for (var i = 1; i < 30; ++i) {
        for (var j = b[i]; j < b[i + 1]; ++j) {
            r[j] = ((j - b[i]) << 5) | i;
        }
    }
    return { b: b, r: r };
};
var _a = freb(fleb, 2), fl = _a.b, revfl = _a.r;
// we can ignore the fact that the other numbers are wrong; they never happen anyway
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0), revfd = _b.r;
// map of value to reverse (assuming 16 bits)
var rev = new u16(32768);
for (var i = 0; i < 32768; ++i) {
    // reverse table algorithm from SO
    var x = ((i & 0xAAAA) >> 1) | ((i & 0x5555) << 1);
    x = ((x & 0xCCCC) >> 2) | ((x & 0x3333) << 2);
    x = ((x & 0xF0F0) >> 4) | ((x & 0x0F0F) << 4);
    rev[i] = (((x & 0xFF00) >> 8) | ((x & 0x00FF) << 8)) >> 1;
}
// create huffman tree from u8 "map": index -> code length for code index
// mb (max bits) must be at most 15
// TODO: optimize/split up?
var hMap = (function (cd, mb, r) {
    var s = cd.length;
    // index
    var i = 0;
    // u16 "map": index -> # of codes with bit length = index
    var l = new u16(mb);
    // length of cd must be 288 (total # of codes)
    for (; i < s; ++i) {
        if (cd[i])
            ++l[cd[i] - 1];
    }
    // u16 "map": index -> minimum code for bit length = index
    var le = new u16(mb);
    for (i = 1; i < mb; ++i) {
        le[i] = (le[i - 1] + l[i - 1]) << 1;
    }
    var co;
    if (r) {
        // u16 "map": index -> number of actual bits, symbol for code
        co = new u16(1 << mb);
        // bits to remove for reverser
        var rvb = 15 - mb;
        for (i = 0; i < s; ++i) {
            // ignore 0 lengths
            if (cd[i]) {
                // num encoding both symbol and bits read
                var sv = (i << 4) | cd[i];
                // free bits
                var r_1 = mb - cd[i];
                // start value
                var v = le[cd[i] - 1]++ << r_1;
                // m is end value
                for (var m = v | ((1 << r_1) - 1); v <= m; ++v) {
                    // every 16 bit value starting with the code yields the same result
                    co[rev[v] >> rvb] = sv;
                }
            }
        }
    }
    else {
        co = new u16(s);
        for (i = 0; i < s; ++i) {
            if (cd[i]) {
                co[i] = rev[le[cd[i] - 1]++] >> (15 - cd[i]);
            }
        }
    }
    return co;
});
// fixed length tree
var flt = new u8(288);
for (var i = 0; i < 144; ++i)
    flt[i] = 8;
for (var i = 144; i < 256; ++i)
    flt[i] = 9;
for (var i = 256; i < 280; ++i)
    flt[i] = 7;
for (var i = 280; i < 288; ++i)
    flt[i] = 8;
// fixed distance tree
var fdt = new u8(32);
for (var i = 0; i < 32; ++i)
    fdt[i] = 5;
// fixed length map
var flm = /*#__PURE__*/ hMap(flt, 9, 0);
// fixed distance map
var fdm = /*#__PURE__*/ hMap(fdt, 5, 0);
// get end of byte
var shft = function (p) { return ((p + 7) / 8) | 0; };
// typed array slice - allows garbage collector to free original reference,
// while being more compatible than .slice
var slc = function (v, s, e) {
    if (s == null || s < 0)
        s = 0;
    if (e == null || e > v.length)
        e = v.length;
    // can't use .constructor in case user-supplied
    var n = new u8(e - s);
    n.set(v.subarray(s, e));
    return n;
};
// starting at p, write the minimum number of bits that can hold v to d
var wbits = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
};
// starting at p, write the minimum number of bits (>8) that can hold v to d
var wbits16 = function (d, p, v) {
    v <<= p & 7;
    var o = (p / 8) | 0;
    d[o] |= v;
    d[o + 1] |= v >> 8;
    d[o + 2] |= v >> 16;
};
// creates code lengths from a frequency table
var hTree = function (d, mb) {
    // Need extra info to make a tree
    var t = [];
    for (var i = 0; i < d.length; ++i) {
        if (d[i])
            t.push({ s: i, f: d[i] });
    }
    var s = t.length;
    var t2 = t.slice();
    if (!s)
        return { t: et, l: 0 };
    if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
    }
    t.sort(function (a, b) { return a.f - b.f; });
    // after i2 reaches last ind, will be stopped
    // freq must be greater than largest possible number of symbols
    t.push({ s: -1, f: 25001 });
    var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
    t[0] = { s: -1, f: l.f + r.f, l: l, r: r };
    // efficient algorithm from UZIP.js
    // i0 is lookbehind, i2 is lookahead - after processing two low-freq
    // symbols that combined have high freq, will start processing i2 (high-freq,
    // non-composite) symbols instead
    // see https://reddit.com/r/photopea/comments/ikekht/uzipjs_questions/
    while (i1 != s - 1) {
        l = t[t[i0].f < t[i2].f ? i0++ : i2++];
        r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
        t[i1++] = { s: -1, f: l.f + r.f, l: l, r: r };
    }
    var maxSym = t2[0].s;
    for (var i = 1; i < s; ++i) {
        if (t2[i].s > maxSym)
            maxSym = t2[i].s;
    }
    // code lengths
    var tr = new u16(maxSym + 1);
    // max bits in tree
    var mbt = ln(t[i1 - 1], tr, 0);
    if (mbt > mb) {
        // more algorithms from UZIP.js
        // TODO: find out how this code works (debt)
        //  ind    debt
        var i = 0, dt = 0;
        //    left            cost
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function (a, b) { return tr[b.s] - tr[a.s] || a.f - b.f; });
        for (; i < s; ++i) {
            var i2_1 = t2[i].s;
            if (tr[i2_1] > mb) {
                dt += cst - (1 << (mbt - tr[i2_1]));
                tr[i2_1] = mb;
            }
            else
                break;
        }
        dt >>= lft;
        while (dt > 0) {
            var i2_2 = t2[i].s;
            if (tr[i2_2] < mb)
                dt -= 1 << (mb - tr[i2_2]++ - 1);
            else
                ++i;
        }
        for (; i >= 0 && dt; --i) {
            var i2_3 = t2[i].s;
            if (tr[i2_3] == mb) {
                --tr[i2_3];
                ++dt;
            }
        }
        mbt = mb;
    }
    return { t: new u8(tr), l: mbt };
};
// get the max length and assign length codes
var ln = function (n, l, d) {
    return n.s == -1
        ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1))
        : (l[n.s] = d);
};
// length codes generation
var lc = function (c) {
    var s = c.length;
    // Note that the semicolon was intentional
    while (s && !c[--s])
        ;
    var cl = new u16(++s);
    //  ind      num         streak
    var cli = 0, cln = c[0], cls = 1;
    var w = function (v) { cl[cli++] = v; };
    for (var i = 1; i <= s; ++i) {
        if (c[i] == cln && i != s)
            ++cls;
        else {
            if (!cln && cls > 2) {
                for (; cls > 138; cls -= 138)
                    w(32754);
                if (cls > 2) {
                    w(cls > 10 ? ((cls - 11) << 5) | 28690 : ((cls - 3) << 5) | 12305);
                    cls = 0;
                }
            }
            else if (cls > 3) {
                w(cln), --cls;
                for (; cls > 6; cls -= 6)
                    w(8304);
                if (cls > 2)
                    w(((cls - 3) << 5) | 8208), cls = 0;
            }
            while (cls--)
                w(cln);
            cls = 1;
            cln = c[i];
        }
    }
    return { c: cl.subarray(0, cli), n: s };
};
// calculate the length of output from tree, code lengths
var clen = function (cf, cl) {
    var l = 0;
    for (var i = 0; i < cl.length; ++i)
        l += cf[i] * cl[i];
    return l;
};
// writes a fixed block
// returns the new bit pos
var wfblk = function (out, pos, dat) {
    // no need to write 00 as type: TypedArray defaults to 0
    var s = dat.length;
    var o = shft(pos + 2);
    out[o] = s & 255;
    out[o + 1] = s >> 8;
    out[o + 2] = out[o] ^ 255;
    out[o + 3] = out[o + 1] ^ 255;
    for (var i = 0; i < s; ++i)
        out[o + i + 4] = dat[i];
    return (o + 4 + s) * 8;
};
// writes a block
var wblk = function (dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
    wbits(out, p++, final);
    ++lf[256];
    var _a = hTree(lf, 15), dlt = _a.t, mlb = _a.l;
    var _b = hTree(df, 15), ddt = _b.t, mdb = _b.l;
    var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
    var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
    var lcfreq = new u16(19);
    for (var i = 0; i < lclt.length; ++i)
        ++lcfreq[lclt[i] & 31];
    for (var i = 0; i < lcdt.length; ++i)
        ++lcfreq[lcdt[i] & 31];
    var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
    var nlcc = 19;
    for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
    var flen = (bl + 5) << 3;
    var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
    var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
    if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
    var lm, ll, dm, dl;
    wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
    if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i = 0; i < nlcc; ++i)
            wbits(out, p + 3 * i, lct[clim[i]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i = 0; i < clct.length; ++i) {
                var len = clct[i] & 31;
                wbits(out, p, llm[len]), p += lct[len];
                if (len > 15)
                    wbits(out, p, (clct[i] >> 5) & 127), p += clct[i] >> 12;
            }
        }
    }
    else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
    }
    for (var i = 0; i < li; ++i) {
        var sym = syms[i];
        if (sym > 255) {
            var len = (sym >> 18) & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
                wbits(out, p, (sym >> 23) & 31), p += fleb[len];
            var dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
                wbits16(out, p, (sym >> 5) & 8191), p += fdeb[dst];
        }
        else {
            wbits16(out, p, lm[sym]), p += ll[sym];
        }
    }
    wbits16(out, p, lm[256]);
    return p + ll[256];
};
// deflate options (nice << 13) | chain
var deo = /*#__PURE__*/ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
// empty
var et = /*#__PURE__*/ new u8(0);
// compresses data into a raw DEFLATE buffer
var dflt = function (dat, lvl, plvl, pre, post, st) {
    var s = st.z || dat.length;
    var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7000)) + post);
    // writing to this writes to the output buffer
    var w = o.subarray(pre, o.length - post);
    var lst = st.l;
    var pos = (st.r || 0) & 7;
    if (lvl) {
        if (pos)
            w[0] = st.r >> 3;
        var opt = deo[lvl - 1];
        var n = opt >> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        //    prev 2-byte val map    curr 2-byte val map
        var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function (i) { return (dat[i] ^ (dat[i + 1] << bs1_1) ^ (dat[i + 2] << bs2_1)) & msk_1; };
        // 24576 is an arbitrary number of maximum symbols per block
        // 424 buffer for last block
        var syms = new i32(25000);
        // length/literal freq   distance freq
        var lf = new u16(288), df = new u16(32);
        //  l/lcnt  exbits  index          l/lind  waitdx          blkpos
        var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i + 2 < s; ++i) {
            // hash value
            var hv = hsh(i);
            // index mod 32768    previous index mod
            var imod = i & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            // We always should modify head and prev, but only add symbols if
            // this data is not yet processed ("wait" for wait index)
            if (wi <= i) {
                // bytes remaining
                var rem = s - i;
                if ((lc_1 > 7000 || li > 24576) && (rem > 423 || !lst)) {
                    pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
                    li = lc_1 = eb = 0, bs = i;
                    for (var j = 0; j < 286; ++j)
                        lf[j] = 0;
                    for (var j = 0; j < 30; ++j)
                        df[j] = 0;
                }
                //  len    dist   chain
                var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
                if (rem > 2 && hv == hsh(i - dif)) {
                    var maxn = Math.min(n, rem) - 1;
                    var maxd = Math.min(32767, i);
                    // max possible length
                    // not capped at dif because decompressors implement "rolling" index population
                    var ml = Math.min(258, rem);
                    while (dif <= maxd && --ch_1 && imod != pimod) {
                        if (dat[i + l] == dat[i + l - dif]) {
                            var nl = 0;
                            for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                                ;
                            if (nl > l) {
                                l = nl, d = dif;
                                // break out early when we reach "nice" (we are satisfied enough)
                                if (nl > maxn)
                                    break;
                                // now, find the rarest 2-byte sequence within this
                                // length of literals and search for that instead.
                                // Much faster than just using the start
                                var mmd = Math.min(dif, nl - 2);
                                var md = 0;
                                for (var j = 0; j < mmd; ++j) {
                                    var ti = i - dif + j & 32767;
                                    var pti = prev[ti];
                                    var cd = ti - pti & 32767;
                                    if (cd > md)
                                        md = cd, pimod = ti;
                                }
                            }
                        }
                        // check the previous match
                        imod = pimod, pimod = prev[imod];
                        dif += imod - pimod & 32767;
                    }
                }
                // d will be nonzero only when a match was found
                if (d) {
                    // store both dist and len data in one int32
                    // Make sure this is recognized as a len/dist with 28th bit (2^28)
                    syms[li++] = 268435456 | (revfl[l] << 18) | revfd[d];
                    var lin = revfl[l] & 31, din = revfd[d] & 31;
                    eb += fleb[lin] + fdeb[din];
                    ++lf[257 + lin];
                    ++df[din];
                    wi = i + l;
                    ++lc_1;
                }
                else {
                    syms[li++] = dat[i];
                    ++lf[dat[i]];
                }
            }
        }
        for (i = Math.max(i, wi); i < s; ++i) {
            syms[li++] = dat[i];
            ++lf[dat[i]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
        if (!lst) {
            st.r = (pos & 7) | w[(pos / 8) | 0] << 3;
            // shft(pos) now 1 less if pos & 7 != 0
            pos -= 7;
            st.h = head, st.p = prev, st.i = i, st.w = wi;
        }
    }
    else {
        for (var i = st.w || 0; i < s + lst; i += 65535) {
            // end
            var e = i + 65535;
            if (e >= s) {
                // write final block
                w[(pos / 8) | 0] = lst;
                e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i, e));
        }
        st.i = s;
    }
    return slc(o, 0, pre + shft(pos) + post);
};
// deflate with opts
var dopt = function (dat, opt, pre, post, st) {
    if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
            var dict = opt.dictionary.subarray(-32768);
            var newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
        }
    }
    return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : (12 + opt.mem), pre, post, st);
};
/**
 * Compresses data with DEFLATE without any wrapper
 * @param data The data to compress
 * @param opts The compression options
 * @returns The deflated version of the data
 */
function deflateSync(data, opts) {
    return dopt(data, opts || {}, 0, 0);
}
// text decoder
var td = typeof TextDecoder != 'undefined' && /*#__PURE__*/ new TextDecoder();
// text decoder stream
var tds = 0;
try {
    td.decode(et, { stream: true });
    tds = 1;
}
catch (e) { }

/**
 *  base64.ts
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 *
 * @author Dan Kogai (https://github.com/dankogai)
 */
typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const b64chs = Array.prototype.slice.call(b64ch);
((a) => {
    let tab = {};
    a.forEach((c, i) => tab[c] = i);
    return tab;
})(b64chs);
String.fromCharCode.bind(String);
typeof Uint8Array.from === 'function'
    ? Uint8Array.from.bind(Uint8Array)
    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));

/**
 * Packs given data with MessagePack then deflates / compresses with Zlib. The inverse function to inflate is
 * `inflateAndUnpack`.
 *
 * @param {any}   data - Any data.
 *
 * @param {object}   [opts] - Optional parameters.
 *
 * @param {import('#runtime/data/compress').DeflateOptions} [opts.deflateOptions] - Deflate options.
 *
 * @returns {Uint8Array} Packed and compressed data.
 */
function packAndDeflate(data, { deflateOptions } = {})
{
   return deflateSync(pack(data), deflateOptions);
}

/**
 * Exports an index of the main navigation URLs and reflection data to a MessagePack file.
 *
 * The resulting MessagePack file can be loaded into `trie-search` for auto-complete quick search functionality.
 */
class SearchQuickIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.once(RendererEvent.BEGIN, this.#onRendererBegin, this);
   }

   /**
    * Triggered after a document has been rendered, just before it is written to disc.
    *
    * @param {import('typedoc').RendererEvent}  event  An event object describing the current render operation.
    */
   #onRendererBegin(event)
   {
      if (event.isDefaultPrevented) { return; }

      const urlMappings = this.#app.renderer.theme.getUrls(event.project);

      /**
       * Creates a top level URL mapping for all main HTML pages.
       *
       * @type {SearchQuickDocument[]}
       */
      const navSearchDocuments = urlMappings.filter((mapping) => mapping.model.kind !== ReflectionKind.Project).map(
       (mapping, i) => ({
         i,
         k: mapping.model.kind,
         n: mapping.model.getFullName(),
         u: mapping.url
      }));

      // Add optionally defined sidebar links to the data set.
      if (this.#app.options.isSet('sidebarLinks'))
      {
         const sidebarLinks = this.#app.options.getValue('sidebarLinks');

         for (const key in sidebarLinks)
         {
            navSearchDocuments.push({
               i: navSearchDocuments.length,
               n: key,
               u: sidebarLinks[key]
            });
         }
      }

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'search-quick.cmp'),
       packAndDeflate(navSearchDocuments));
   }
}

/**
 * A plugin that exports an index of the project to a MessagePack file.
 *
 * The resulting MessagePack file can be fetched and used to build a simple search function.
 */
class SearchIndexPackr
{
   /** @type {import('typedoc').Application} */
   #app;

   /** @type {boolean} */
   #searchInComments;

   /**
    * @param {import('typedoc').Application} app -
    */
   constructor(app)
   {
      this.#app = app;

      this.#app.renderer.once(RendererEvent.BEGIN, this.#onRendererBegin, this);

      this.#searchInComments = this.#app.options.getValue('searchInComments');
   }

   /**
    * Triggered after a document has been rendered, just before it is written to disc.
    *
    * @param {import('typedoc').RendererEvent}  event  An event object describing the current render operation.
    */
   #onRendererBegin(event)
   {
      if (event.isDefaultPrevented) { return; }

      /** @type {SearchDocument[]} */
      const rows = [];

      /** @type {DeclarationReflection[]} */
      const initialSearchResults = Object.values(event.project.reflections).filter((refl) =>
      {
         return refl instanceof DeclarationReflection && refl.url && refl.name && !refl.flags.isExternal;
      });

      const indexEvent = new IndexEvent(IndexEvent.PREPARE_INDEX, initialSearchResults);
      this.#app.renderer.trigger(indexEvent);

      if (indexEvent.isDefaultPrevented) { return; }

      /** @type {import('lunr').Builder} */
      const builder = new lunr.Builder();
      builder.pipeline.add(lunr.trimmer);

      builder.ref('i');
      for (const [key, boost] of Object.entries(indexEvent.searchFieldWeights))
      {
         switch (key)
         {
            case 'comment':
               if (this.#searchInComments)
               {
                  builder.field('c', { boost });
               }
               break;

            case 'name':
               builder.field('n', { boost });
               break;

            default:
               builder.field(key, { boost });
               break;
         }
      }

      for (const reflection of indexEvent.searchResults)
      {
         if (!reflection.url) { continue; }

         const boost = reflection.relevanceBoost ?? 1;
         if (boost <= 0) { continue; }

         let parent = reflection.parent;
         if (parent instanceof ProjectReflection) { parent = void 0; }

         /** @type {SearchDocument} */
         const row = {
            k: reflection.kind,
            n: reflection.name,
            u: reflection.url,
            c: this.#app.renderer.theme.getReflectionClasses(reflection),
         };

         if (parent) { row.p = parent.getFullName(); }

         const externalSearchField = indexEvent.searchFields[rows.length];

         const buildEntry = {
            n: externalSearchField?.name ?? reflection.name,
            i: rows.length,
         };

         if (this.#searchInComments)
         {
            buildEntry.c = externalSearchField?.comment ?? this.#getCommentSearchText(reflection);
         }

         builder.add(
            buildEntry,
            { boost }
         );
         rows.push(row);
      }

      const index = builder.build();

      fs.writeFileSync(path.join(event.outputDirectory, 'assets', 'dmt', 'search.cmp'),
       packAndDeflate({ rows, index }));
   }

   /**
    * @param {DeclarationReflection} reflection -
    *
    * @returns {string | undefined} Reflection comment to add.
    */
   #getCommentSearchText(reflection)
   {
      /** @type {import('typedoc').Comment[]} */
      const comments = [];

      if (reflection.comment) { comments.push(reflection.comment); }

      reflection.signatures?.forEach((s) => s.comment && comments.push(s.comment));

      reflection.getSignature?.comment && comments.push(reflection.getSignature.comment);

      if (!comments.length) { return; }

      return comments
       .flatMap((c) => { return [...c.summary, ...c.blockTags.flatMap((t) => t.content)]; })
       .map((part) => part.text)
       .join('\n');
   }
}

/**
 * DefaultTheme override to initialize PageRenderer and control the sidebar navigation generation. After the initial
 * render of the Project / index.html the navigation is cached and dynamically controlled by a web component. The
 * extra `stopNavigationGeneration` removes the navigation render callback.
 */
class DefaultModernTheme extends DefaultTheme
{
   #renderContext;

   /**
    * @param {import('typedoc').PageEvent<import('typedoc').Reflection>}   pageEvent -
    *
    * @returns {DefaultThemeRenderContext} Cached render context.
    * @override
    */
   getRenderContext(pageEvent)
   {
      if (!this.#renderContext)
      {
         this.#renderContext = new DefaultThemeRenderContext(this, pageEvent, this.application.options);
      }
      else
      {
         // Must update the page reference! Things subtly break otherwise like `On This Page` not rendering.
         this.#renderContext.page = pageEvent;
      }

      return this.#renderContext;
   }

   /**
    * When invoked all future pages rendered will no longer have site navigation generated.
    */
   stopNavigationGeneration()
   {
      if (this.#renderContext)
      {
         this.#renderContext.navigation = () => {};
      }
      else
      {
         this.application.logger.error(
          `[typedoc-theme-default-modern] 'stopNavigationGeneration' invoked with no active render context.`);
      }
   }
}

/**
 * Defines and stores parsed DMT options.
 */
class ThemeOptions
{
   /** @type {DMTOptions} */
   #options = {
      removeBreadcrumb: false,
      removeDefaultModule: false,
      removeNavTopLevelIcon: false,
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
         name: 'dmtRemoveBreadcrumb',
         help: `${ID} When true the entire breadcrumb is removed.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtRemoveDefaultModule',
         help: `${ID} When true the default module / namespace is removed from navigation and breadcrumbs.`,
         type: ParameterType.Boolean,
         defaultValue: false
      });

      app.options.addDeclaration({
         name: 'dmtRemoveNavTopLevelIcon',
         help: `${ID} When true the top level SVG icon for each entry / namespace is removed.`,
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

   /** @returns {boolean} removeBreadcrumb option */
   get removeBreadcrumb() { return this.#options.removeBreadcrumb; }

   /** @returns {boolean} removeDefaultModule option */
   get removeDefaultModule() { return this.#options.removeDefaultModule; }

   /** @returns {boolean} removeNavTopLevelIcon option */
   get removeNavTopLevelIcon() { return this.#options.removeNavTopLevelIcon; }

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
      this.#options.removeBreadcrumb = app.options.getValue('dmtRemoveBreadcrumb');
      this.#options.removeDefaultModule = app.options.getValue('dmtRemoveDefaultModule');
      this.#options.removeNavTopLevelIcon = app.options.getValue('dmtRemoveNavTopLevelIcon');
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
 * @property {boolean} removeBreadcrumb When true the entire breadcrumb is removed.
 *
 * @property {boolean} removeDefaultModule When true the default module / namespace is removed from navigation and
 *           breadcrumbs.
 *
 * @property {boolean} removeNavTopLevelIcon When true the top level SVG icon for each entry / namespace is removed.
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

/**
 * Provides a theme plugin for Typedoc augmenting the main default theme providing a modern UX look & feel.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
function load(app)
{
   ThemeOptions.addDeclarations(app);

   app.converter.once(Converter.EVENT_BEGIN, () =>
   {
      // Initialize the PageRenderer in the Converter event begin to parse options before conversion.
      if ('default-modern' === app.options.getValue('theme'))
      {
         const options = new ThemeOptions(app);

         app.renderer.removeComponent('javascript-index');

         // Make the `dmt` sub-folder on `assets`.
         app.renderer.on(RendererEvent.BEGIN, (output) => fs.mkdirSync(path.join(output.outputDirectory, 'assets',
          'dmt'), { recursive: true }));

         new PageRenderer(app, options);

         // Selectively load search index creation.
         if (app.options.getValue('dmtSearch')) { new SearchIndexPackr(app); }
         if (app.options.getValue('dmtSearchQuick')) { new SearchQuickIndexPackr(app); }
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}

export { load };
