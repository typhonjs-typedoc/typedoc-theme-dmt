<script>
   import {
      setContext,
      tick }                     from 'svelte';

   import { writable }           from 'svelte/store';

   import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';

   import { NavigationState }    from './NavigationState.js';

   /** @type {import('./types').DMTNavigationElement[]} */
   export let navigationIndex = [];

   const dmtSessionStorage = new TJSSessionStorage();

   const navigationState = new NavigationState(dmtSessionStorage, navigationIndex);

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis.dmtOptions.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;

   // Determine the depth in the static HTML paths to adjust a prepended relative path for all navigation links.
   const baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
   let pathURL = globalThis.location.href.replace(baseURL, '');

   // Find the path URL match without any additional URL fragment.
   const depth = (pathURL.match(/\//) ?? []).length;

   const pathPrepend = '../'.repeat(depth);

   const options = {
      baseURL,
      dmtSessionStorage,
      initialPathURL: pathURL,
      navigationState,
      pathURL: writable(pathURL),
      pathPrepend,
   };

   setContext('#options', options);

   navigationState.setInitialState(options);

   // // Attempt to set initial current path; there may be a hash fragment.
   // const initialResult = navigationState.initialCurrentPath(pathURL);
   //
   // // Handle the case of a hash fragment.
   // if (pathURL.includes('#'))
   // {
   //    const match = pathURL.split(/(?<=\.html)/);
   //
   //    // Try setting initial result again with the base URL without the hash fragment.
   //    if (!initialResult)
   //    {
   //       const noHashURL = match[0];
   //       if (noHashURL && navigationState.initialCurrentPath(noHashURL)) { options.pathURL.set(noHashURL); }
   //    }
   //
   //    // Chrome for whatever reason doesn't automatically scroll to the hash fragment, so manually do it.
   //    const hashFragment = match[1];
   //    const targetElement = document.querySelector(`div.col-content a[href^="${hashFragment}"]`);
   //    const contentEl = document.querySelector('div.container.container-main');
   //
   //    if (targetElement && contentEl)
   //    {
   //       contentEl.focus();
   //       contentEl.scrollTo({
   //          top: targetElement.getBoundingClientRect().top - 60,
   //          behavior: 'instant'
   //       });
   //    }
   // }
   //
   // // Adjust the navigation index via a depth first search setting `opened` property for each tree node to the
   // // entry matching the given path URL.
   // if (!navigationState.initialCurrentPath(pathURL) && pathURL.includes('#'))
   // {
   //    const noHashURL = pathURL.split(/(?<=\.html)/)?.[0];
   //    if (noHashURL && navigationState.initialCurrentPath(noHashURL)) { options.pathURL.set(noHashURL); }
   // }

   // ----------------------------------------------------------------------------------------------------------------

   // /**
   //  * Handle any clicks on content anchors with a hash ensuring that the clicked upon anchor is always visible in the
   //  * navigation tree.
   //  *
   //  * @param event
   //  */
   // function hashAnchorClick(event)
   // {
   //    event.preventDefault(); // Prevent the default anchor click behavior.
   //
   //    // If the hash differs then set the window location.
   //    if (window.location.hash !== this.hash)
   //    {
   //       window.location.hash = this.hash;
   //    }
   //    else
   //    {
   //       // Otherwise ensure the current path is visible.
   //       const hashURL = this.href.replace(baseURL, '');
   //       navigationState.ensureCurrentPath(hashURL);
   //    }
   // }

   // // Target all content anchor elements with a hash fragment:
   // document.querySelectorAll('div.col-content a[href^="#"], details.tsd-page-navigation a[href^="#"]').forEach((el) =>
   // {
   //    el.addEventListener('click', hashAnchorClick);
   // });

   /**
    * Updates the session storage state to opened for all tree nodes to the new URL path.
    *
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   async function onHashchange(event)
   {
      const newURLPath = event.newURL.replace(baseURL, '');

      // Ensure any tree nodes are open for `newURLPath`.
      if (navigationState.ensureCurrentPath(newURLPath))
      {
         // Wait for Svelte to render tree.
         await tick();

         // Set new URL via store.
         options.pathURL.set(newURLPath);
      }
   }
</script>

<svelte:window on:hashchange={onHashchange} />

<div class=dmt-navigation-content>
   {#each navigationState.index as entry (entry.path)}
      {#if Array.isArray(entry.children)}
         <Folder {entry} removeIcon={removeTopLevelIcon} />
      {:else}
         <Entry {entry} />
      {/if}
   {/each}
</div>

<style>
   .dmt-navigation-content {
      display: flex;
      flex-direction: column;

      --tjs-folder-summary-font-weight: normal;
      --tjs-folder-summary-font-size: 1em;
      --tjs-folder-summary-margin: 0;
      --tjs-folder-summary-padding: 0;
      --tjs-folder-summary-width: 100%;
   }
</style>
