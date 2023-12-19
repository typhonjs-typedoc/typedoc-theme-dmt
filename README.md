![@typhonjs-typedoc/typedoc-theme-dmt](https://i.imgur.com/Sr53g2t.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-typedoc/typedoc-theme-dmt.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-typedoc/typedoc-theme-dmt/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://discord.gg/mnbgN8f)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

Provides a customizable UX augmentation to the default TypeDoc theme bringing final mile fit and finish. The approach
taken is not to provide a theme replacement, but an augmentation of the output from the default theme providing
enhanced usability, features, and polish. A large benefit to this approach is that it allows the Default Modern Theme
(DMT) to keep up with new releases and features of TypeDoc.

## Installation:

`package.json`:
```json
{
   "devDependencies": {
      "@typhonjs-typedoc/typedoc-theme-dmt": "^0.2.0-next.1",
      "typedoc": "^0.25.0"
   }
}
```

## Features

The Default Modern Theme (DMT) achieves enhanced usability through replacing several components of the default theme
with Svelte powered implementations. This includes the navigation index and search capabilities. Other changes from
the default theme include enhanced styles and usage of modern CSS features like `container queries` to provide
better font size changes for different screen orientations.

## Key Commands / Accessibility.

The DMT styles enhance accessibility making keyboard navigation clear and concise.

There are additional keyboard hotkeys available (for macOS "Alt" is the "Option / ⌥" key):
- `<Alt-C>`: Focus main content.
- `<Alt-E>`: Expand / collapse all navigation folders.
- `<Alt-H>`: Open / close the help panel.
- `<Alt-I>`: Go to home page / main index.html
- `<Alt-M>`: If there is a `modules.html` index then go to it.
- `<Alt-N>`: Scroll to current page in navigation panel and focus it.
- `<Alt-O>`: If available, focus first anchor in `On This Page` container.
- `<Alt-S>`: Show and focus the main search entry.

When using the navigation index you may press `<Alt>` when opening / closing a folder and it will open or close all
children folders underneath.

## Configuration:

`typedoc.json` / includes all extra DMT options with comments (JSON5):
```json5
{
  // Add the DMT plugin.
  "plugin": [
    "@typhonjs-typedoc/typedoc-theme-dmt"
  ],

  // Set the theme.
  "theme": "default-modern",

  // -----------------------------------------------------------------------------------------------------------------

  // The following options are specific to the Default Modern Theme. Default options are listed unless otherwise specified.

  // When false the entire breadcrumb is removed.
  "dmtBreadcrumb": true,

  // Set a local file path or URL to set as the favicon.
  "dmtFavicon": "./assets/favicon.ico",

  // An array of user specified "icon links" that are placed in toolbar links. An example entry is included below.
  "dmtLinksIcon": [
    {
      "icon": "./assets/icons/custom-icon.png", // File path or URL to image.
      "title": "My Custom Link",                // Tooltip to display as "title".
      "url": "<URL>"                            // URL for link.
    }
  ],

  // An object with preconfigured "icon links" for popular services that are placed in toolbar links.
  // All current services supported are listed, but choose the ones you use.
  "dmtLinksService": {
    "Discord": "<URL>",
    "GitHub": "<URL>",
    "BitBucket": "<URL>",
    "GitLab": "<URL>",
    "NPM": "<URL>"
  },

  // When true 'Module' in page titles and other areas of the documentation are replaced with 'Package'.
  // This is handy if you are documenting a "Package" whether Node / NPM or otherwise.
  "dmtModuleAsPackage": false,

  // When true the navigation index generates a full tree compacting singular paths. 'dmtNavModuleDepth' is ignored.
  "dmtNavModuleCompact": false,

  // The depth where the navigation index begins concatenating module paths. DMT by default reorganizes modules paths
  // into a complete tree structure. Setting this to `0` is the same as the default theme, but you have the option to
  // choose at what depth concatenation of paths begins.
  "dmtNavModuleDepth": "<NUMBER NO QUOTES>",

  // With building a complete navigation tree showing the "Namespace" SVG icon for a module isn't as productive. By
  // default, no icons are shown for modules. Set to true if you want the icons shown.
  "dmtNavModuleIcon": false,

  // When true the main search index is enabled. You may opt to turn off the main search index and not display the
  // search icon in the top link bar is removed.
  "dmtSearch": true,

  // When true the main search index stores parent reflection full names. This is set to false by default because when
  // using modules the full module path is shown in search results for all symbols.
  "dmtSearchFullName": false,

  // A positive integer greater than 0 providing a limit on main search query results.
  "dmtSearchLimit": 10
}
```

## Synergy:
The DMT is used to generate complete API docs for the built-in Typescript library declarations.
[@typhonjs-typedoc/ts-lib-docs](https://www.npmjs.com/package/@typhonjs-typedoc/ts-lib-docs) provides several data
sources including a TypeDoc plugin that associates all symbols from the built-in TS lib declarations allowing complete
end-to-end API docs for your project and the modern web.

## Roadmap:
- Upstream as many things possible back to the main TypeDoc default theme.

- Continue to refine main search component and setup for better results with large projects / lots of symbols.

- Finish implementing new "quick search" Svelte component that provides an alternate quick way to search the navigation
panel and local file being viewed.
