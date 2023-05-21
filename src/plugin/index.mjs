import {
   Converter,
   DefaultTheme,
   DefaultThemeRenderContext,
   ParameterType }            from 'typedoc';

import { PageRenderer }       from './PageRenderer.mjs';

/**
 * Provides a theme plugin for Typedoc augmenting the main default theme providing a modern UX look & feel.
 *
 * @param {import('typedoc').Application} app - Typedoc Application
 */
export function load(app)
{
   app.options.addDeclaration({
      name: 'dmtFavicon',
      help: '[typedoc-theme-default-modern] Specify the file path or URL of the favicon file.',
      type: ParameterType.String,
      defaultValue: null
   });

   app.options.addDeclaration({
      name: 'dmtRemoveDefaultModule',
      help: '[typedoc-theme-default-modern] When true the default module / namespace is removed from navigation and ' +
       'breadcrumbs.',
      type: ParameterType.Boolean,
      defaultValue: false
   });

   app.converter.once(Converter.EVENT_BEGIN, () =>
   {
      // Initialize the PageRenderer in the Converter event begin to parse options before conversion.
      if ('default-modern' === app.options.getValue('theme')) { new PageRenderer(app); }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
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