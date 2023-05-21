import {
   Converter,
   ParameterType }            from 'typedoc';

import {
   PageRenderer,
   SearchIndexPackr }         from './renderer/index.mjs';

import { DefaultModernTheme } from './theme/DefaultModernTheme.mjs';

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
      if ('default-modern' === app.options.getValue('theme'))
      {
         app.renderer.removeComponent('javascript-index');

         new PageRenderer(app);
         new SearchIndexPackr(app);
      }
   });

   app.renderer.defineTheme('default-modern', DefaultModernTheme);
}