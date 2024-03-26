import { DefaultTheme } from 'typedoc';

/**
 * Previously, the DMT modified the `DefaultThemeRenderContext` to control navigation generation. A cached reference
 * of a single render context replacing the page event was utilized. After Typedoc `0.25.10` icon generation SVG URLS
 * require a unique render context per page event as they are implemented in the constructor of the render context.
 *
 * Note: In the future it may be necessary to modify `DefaultThemeRenderContext`, but do keep in mind the per page event
 * requirement.
 */
export class DefaultModernTheme extends DefaultTheme
{
}
