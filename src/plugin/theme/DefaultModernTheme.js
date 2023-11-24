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

         // Stop default theme navigation generation.
         this.#renderContext.navigation = () => {};
      }
      else
      {
         // Must update the page reference! Things subtly break otherwise like `On This Page` not rendering.
         this.#renderContext.page = pageEvent;
      }

      return this.#renderContext;
   }
}