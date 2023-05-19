import { ParameterType }   from 'typedoc';

import { PageRenderer }    from './renderer/PageRenderer.mjs';

/**
 * Provides a plugin for Typedoc augmenting the main default theme providing a modern UX look & feel.
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

   new PageRenderer(app);
}