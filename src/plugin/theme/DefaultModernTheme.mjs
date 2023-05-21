import {
   DefaultTheme,
   DefaultThemeRenderContext }   from 'typedoc';

/**
 * DefaultTheme override to initialize PageRenderer and control the sidebar navigation generation. After the initial
 * render of the Project / index.html the navigation is cached and dynamically controlled by a web component. The
 * extra `stopNavigationGeneration` removes the navigation render callback.
 */
export class DefaultModernTheme extends DefaultTheme
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