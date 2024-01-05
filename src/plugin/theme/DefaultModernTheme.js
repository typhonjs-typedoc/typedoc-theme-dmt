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
   /** @type {DefaultThemeRenderContext} */
   #renderContext;

   /**
    * @returns {DefaultThemeRenderContext}
    */
   get renderContext()
   {
      return this.#renderContext;
   }

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

         // TODO: Determine if this will get fixed in TypeDoc before providing an option to disable it in the DMT.
         // The new hierarchy page generation is buggy in TypeDoc `0.25.6+`. The DMT allows it to be turned off.
         // const hierarchy = this.application.options.getValue('dmtHierarchy');
         // if (!hierarchy) { this.#renderContext.hierarchyTemplate = () => {}; }
      }
      else
      {
         // Must update the page reference! Things subtly break otherwise like `On This Page` not rendering.
         this.#renderContext.page = pageEvent;
      }

      return this.#renderContext;
   }
}
