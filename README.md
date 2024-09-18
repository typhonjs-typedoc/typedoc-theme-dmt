![@typhonjs-typedoc/typedoc-theme-dmt](https://i.imgur.com/Sr53g2t.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-typedoc/typedoc-theme-dmt.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-typedoc/typedoc-theme-dmt/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://typhonjs.io/discord/)
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
      "@typhonjs-typedoc/typedoc-theme-dmt": "^0.2.0",
      "typedoc": "^0.26.6"
   }
}
```

## Features:

The Default Modern Theme (DMT) achieves enhanced usability through replacing several components of the default theme
with Svelte powered implementations. This includes the navigation index and search capabilities. Other changes from
the default theme include enhanced styles and usage of modern CSS features like `container queries` to provide
better font size changes for different screen orientations.

## Accessibility:

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

  // Additional navigation sidebar options.
  "dmtNavigation": {
    "moduleIcon": false,  // When true renders module icon.
    "style": 'full'       // A full tree is rendered by default. Other options include 'compact' and 'flat'. The first
                          // renders a full tree, but compacts all intermediary folders with no children and the latter
                          // flattens all module / package paths.
  },

  // May be `false` to disable main search functionality. Otherwise, provide an object
  // search icon in the top link bar is removed.
  "dmtSearch": {
    // When true the main search index stores parent reflection full names. This is set to false by default because when
    // using modules the full module path is shown in search results for all symbols.
    "fullName": false,

    // A positive integer greater than 0 providing a limit on main search query results.
    "limit": 10
  },

  // Control additional theme settings that the DMT offers. Theme animation for accordion / details elements works great
  // for small to larger documentation efforts. However, for very large projects it may be useful to completely disable
  // theme animation due to the amount of DOM elements displayed. Theme animation uses WAAPI to animate the `height` of
  // details elements and this causes layout reflows. You may opt in this case to turn off theme animation completely.
  "dmtSettings": {
    "animation": true // When true theme animation is enabled.
  }
}
```

## Synergy:
- A zero configuration CLI that uses the DMT to automatically generate API documentation from well configured
`package.json` based projects is available via [@typhonjs-typedoc/typedoc-pkg](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-pkg).
This CLI incorporates `ts-lib-docs` mentioned next and makes it easy to generate end-to-end documentation.


- The DMT is used to generate complete API docs for the built-in Typescript library declarations.
[@typhonjs-typedoc/ts-lib-docs](https://www.npmjs.com/package/@typhonjs-typedoc/ts-lib-docs) provides several data
sources including a TypeDoc plugin that associates all symbols from the built-in TS lib declarations allowing complete
end-to-end API docs for your project and the modern web.

## Roadmap:
- Upstream as many things possible back to the main TypeDoc default theme.

- Continue to refine main search component and setup for better results with large projects / lots of symbols.

- Finish implementing new "quick search" Svelte component that provides an alternate quick way to search the navigation
panel and local file being viewed.
