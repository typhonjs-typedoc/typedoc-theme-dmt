import {
   DefaultTheme,
   DefaultThemeRenderContext,
} from 'typedoc';

import {PageRenderer} from "../renderer/PageRenderer.mjs";

export class DefaultModernTheme extends DefaultTheme
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