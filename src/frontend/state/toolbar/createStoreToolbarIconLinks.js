import { writable }  from 'svelte/store';

import {
   ImageData,
   StyleParse }      from '#runtime/util/browser';

/**
 * Creates the DMTToolbarIconLinks store for `IconLinks.svelte`. To facilitate the dynamic toolbar icon links the
 * user and service links are combined and image dimensions are calculated and cached in session storage.
 *
 * @param {DMTComponentData} dmtComponentData -
 *
 * @param {DMTComponentDataBCMP} dmtComponentDataBCMP -
 *
 * @returns {import('svelte/store').Writable<import('#frontend/types').DMTToolbarIconLinks>} Toolbar icon links
 *          store.
 */
export function createStoreToolbarIconLinks(dmtComponentData, dmtComponentDataBCMP)
{
   const iconLinks = { icons: [], totalWidth: 0 };

   const allIcons = [];

   // Combine user and service icons.
   allIcons.push(...(dmtComponentDataBCMP?.iconLinks?.user ?? []));
   allIcons.push(...(dmtComponentDataBCMP?.iconLinks?.service ?? []));

   for (const entry of allIcons)
   {
      iconLinks.icons.push({
         iconURL: typeof entry.dmtPath === 'string' ? `${dmtComponentData.dmtURL}${entry.dmtPath}` : entry.iconURL,
         title: entry.title,
         url: entry.url
      });
   }

   const store = writable(iconLinks);

   const key = `${dmtComponentData.storagePrepend}-toolbar-iconlinks-width`;

   if (iconLinks.icons.length === 0)
   {
      // For good measure remove the key when there are no icons.
      globalThis.sessionStorage.removeItem(key);
   }
   else
   {
      const existingWidth = dmtComponentData.dmtSessionStorage.getItem(key);

      // First attempt to load cached image widths.
      if (Number.isFinite(existingWidth) && existingWidth > 0)
      {
         iconLinks.totalWidth = existingWidth;
      }
      else
      {
         // Attempt to load and cache image widths.
         ImageData.getDimensions(iconLinks.icons, { accessor: 'iconURL' }).then(({ fulfilled, rejected }) =>
         {
            if (rejected.length)
            {
               globalThis.sessionStorage.removeItem(key);
            }
            else
            {
               store.update((iconLinks) =>
               {
                  for (const entry of fulfilled)
                  {
                     // Scale the image to the height of the toolbar images. See: IconLinks.svelte `img` style.
                     const scaledWidth = (24 / entry.height) * entry.width;

                     // Add scaled width and anchor element margin. See: IconLinks.svelte `a` style.
                     iconLinks.totalWidth += scaledWidth + 8;
                  }

                  iconLinks.totalWidth += StyleParse.remPixels(0.35) * (fulfilled.length - 1);

                  return iconLinks;
               });

               dmtComponentData.dmtSessionStorage.setItem(key, Math.floor(iconLinks.totalWidth));
            }
         });
      }
   }

   return store;
}
