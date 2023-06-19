import { rollup } from 'rollup';

import { compile } from 'svelte/compiler';

import resolve    from '@rollup/plugin-node-resolve';
import terser     from '@rollup/plugin-terser';
import virtual    from '@rollup/plugin-virtual';

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
export async function compileNavBundle(filepath, navContent)
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
import svelteRetag      from 'svelte-retag';

import NavigationSite   from 'VirtualComponent.js';

svelteRetag({
   component: NavigationSite,
   tagname: 'wc-dmt-nav',
   attributes:['pageurl'],
   shadow: false
});
`;