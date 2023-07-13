![@typhonjs-typedoc/typedoc-theme-dmt](https://i.imgur.com/Sr53g2t.jpg)

[![NPM](https://img.shields.io/npm/v/@typhonjs-typedoc/typedoc-theme-dmt.svg?label=npm)](https://www.npmjs.com/package/@typhonjs-typedoc/typedoc-theme-dmt)
[![Code Style](https://img.shields.io/badge/code%20style-allman-yellowgreen.svg?style=flat)](https://en.wikipedia.org/wiki/Indent_style#Allman_style)
[![License](https://img.shields.io/badge/license-MPLv2-yellowgreen.svg?style=flat)](https://github.com/typhonjs-typedoc/typedoc-theme-dmt/blob/main/LICENSE)
[![Discord](https://img.shields.io/discord/737953117999726592?label=TyphonJS%20Discord)](https://discord.gg/mnbgN8f)
[![Twitch](https://img.shields.io/twitch/status/typhonrt?style=social)](https://www.twitch.tv/typhonrt)

Provides a modern and customizable UX augmentation to the default TypeDoc theme; may I introduce you to the 
"Default Modern Theme" / DMT. This theme is perfect for small to very large documentation efforts and approaches a ~90% 
reduction in disk space utilized and 80% speed up in generation. The approach taken is not to provide a theme 
replacement, but an augmentation of the output from the default theme.

The main source of disk space utilization and doc generation time for the default TypeDoc theme is the left-hand navigation 
panel. As the number of doc pages grows that index per page grows large and each static HTML page increases size. This 
accounts for ~90% disk space utilized for generated docs. See this [TypeDoc issue](https://github.com/TypeStrong/typedoc/issues/2287) 
for a discussion. The DMT caches the left-hand navigation and immediately turns off that aspect of TypeDoc during doc 
generation creating a Svelte powered web component that is loaded for all pages eliminating the duplication of the nav 
HTML per page. It looks and responds just like the default theme. Note that for TypeDoc `0.24.8+` you need to enable the 
`navigation: { fullTree: true }` option to generate the full tree; this is a new undocumented TypeDoc option; see 
configuration example below. 

Additionally, the default main search index is altered to use compressed MessagePack instead of JSON reducing the search 
index size just over 90%. A more attractive Svelte component also powers the main search index. Currently, the main 
search index has the same functionality as the default theme, but I will be investigating options to make it more 
powerful in future updates especially for large projects.    

Other changes from the default theme include styles and usage of modern CSS features like `container queries` to provide 
better font size changes for different screen orientations. There are additional keyboard hotkeys available: 
- `<Alt-S>`: Show and focus the main search entry.
- `<Alt-N>`: Focus the current selected item in the left-hand navigation panel (a11y).
- `<Alt-O>`: Focus the first entry in the `On This Page` section (a11y). 

## Installation:

`package.json`:
```json
{
   "devDependencies": {
      "@typhonjs-typedoc/typedoc-theme-dmt": "^0.1.0",
      "typedoc": "^0.24.8"
   }
}
```

## Configuration:

`typedoc.json` / includes extra DMT options / and comments (JSON5):
```json5
{
  // Set a local file path or URL to set as the favicon.
  "dmtFavicon": "./assets/favicon.ico",
  // When true the entire module / file path breadcrumb is removed. 
  "dmtRemoveBreadcrumb": false,
  // When true the default module / namespace is removed from navigation and breadcrumbs.
  "dmtRemoveDefaultModule": false,
  // When true the top level SVG icon for each entry / namespace is removed. This works great for packages that 
  // use sub-path exports / Node packages where it is not desirable to have the `namespace` icon in the main nav panel.
  "dmtRemoveNavTopLevelIcon": false,
  // When true the main search index is enabled. You may opt to turn off the main search index and not display the 
  // search icon in the top link bar is removed.
  "dmtSearch": true,
  // A positive integer greater than 0 providing a limit on main search query results.
  "dmtSearchLimit": 10,
  // When true the quick search index is enabled. This feature is not complete, but will be in the next update.
  "dmtSearchQuick": false,
  // A positive integer greater than 0 providing a limit on quick search query results.
  "dmtSearchQuickLimit": 10,
  
  // This is a new undocumented TypeDoc option for `0.24.8+` that is required to render the full navigation tree.
  "navigation": { 
     fullTree: true
  },
   
  // Add the DMT plugin.
  "plugin": [
    "@typhonjs-typedoc/typedoc-theme-dmt"
  ],
   
  // Set the theme.
  "theme": "default-modern"
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

- Finish additional layout / style aspects that improve accessibility support and keyboard navigation.