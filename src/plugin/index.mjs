import {
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
      help: '[dmt-theme] Specify the file path of the favicon file.',
      type: ParameterType.String,
      defaultValue: null
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}

class DefaultModernTheme extends DefaultTheme
{
   #renderContext;

   /**
    * @param {import('typedoc').Renderer} renderer -
    */
   constructor(renderer)
   {
      super(renderer);

      new PageRenderer(this.application);
   }

   /**
    * @param {import('typedoc').PageEvent<import('typedoc').Reflection>}   pageEvent -
    *
    * @returns {DefaultThemeRenderContext}
    * @override
    */
   getRenderContext(pageEvent)
   {
      if (!this.#renderContext)
      {
         this.#renderContext = new DefaultThemeRenderContext(this, pageEvent, this.application.options)
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
          `[typedoc-theme-dmt] 'stopNavigationGeneration' invoked with no active render context.`);
      }
   }
}