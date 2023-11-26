<script>
   import {
      setContext,
      tick }                     from 'svelte';

   import { writable }           from 'svelte/store';

   import { TJSSessionStorage }  from '#runtime/svelte/store/web-storage';

   import Entry                  from './Entry.svelte';
   import Folder                 from './Folder.svelte';

   import { openCurrentPath }    from './openCurrentPath.js';

   export let navigationIndex = [];

   // Determine if the top level icon for namespace / module folders is removed.
   const removeTopLevelIcon = typeof globalThis.dmtOptions.removeNavTopLevelIcon === 'boolean' ?
    globalThis.dmtOptions.removeNavTopLevelIcon : false;

   // Determine the depth in the static HTML paths to adjust a prepended relative path for all navigation links.
   const baseURL = import.meta.url.replace(/assets\/dmt\/dmt-components.js/, '');
   const pathURL = globalThis.location.href.replace(baseURL, '');

   // Find the path URL match without any additional URL fragment.
   const depth = (pathURL.match(/\//) ?? []).length;

   const pathPrepend = '../'.repeat(depth);

   const dmtSessionStorage = new TJSSessionStorage();

   const options = {
      pathURL: writable(pathURL),
      pathPrepend,
      dmtSessionStorage
   };

   setContext('#options', options);

   /** @type {HTMLDivElement} */
   let navigationEl;

   console.log(`!! Navigation - pathURL: `, pathURL);

   // Adjust the navigation index via a depth first search setting `opened` property for each node with children to the
   // entry matching the given path URL.
   openCurrentPath(navigationIndex, pathURL);

   // ----------------------------------------------------------------------------------------------------------------

   /**
    * @param {HashChangeEvent}   event - A HashChange event.
    */
   async function onHashchange(event)
   {
      const oldURLPath = event.oldURL.replace(baseURL, '');
      const newURLPath = event.newURL.replace(baseURL, '');

      // Set new URL via store.
      options.pathURL.set(newURLPath);

      // const oldAnchorEl = navigationEl.querySelector(`a[href$="${oldURLPath}"]`);
      // let newAnchorEl = navigationEl.querySelector(`a[href$="${newURLPath}"]`);
      //
      // // Both anchors are visible so `current` class can be swapped.
      // if (oldAnchorEl && newAnchorEl)
      // {
      //    oldAnchorEl.classList.remove('current');
      //    newAnchorEl.classList.add('current');
      // }
      // // Handle case when the old anchor is a closed tree node and new anchor is a child entry.
      // else if (oldAnchorEl && !newAnchorEl)
      // {
      //    let oldStorageKey = oldAnchorEl ? oldAnchorEl.dataset.storageKey : void 0;
      //    if (oldStorageKey)
      //    {
      //       dmtSessionStorage.setItem(oldStorageKey, true);
      //
      //       await tick(); // Await for Svelte to render the contents of the tree node in the case that it opens.
      //
      //       newAnchorEl = navigationEl.querySelector(`a[href$="${newURLPath}"]`);
      //
      //       if (oldAnchorEl && newAnchorEl)
      //       {
      //          oldAnchorEl.classList.remove('current');
      //          newAnchorEl.classList.add('current');
      //       }
      //    }
      //
      //    console.log(`!! Navigation - onHashchange - oldStorageKey: `, oldStorageKey);
      // }
      // // Handle the case that the old and new anchors are both from a closed parent tree node.
      // else if (!oldAnchorEl && !newAnchorEl && oldURLPath.includes('#') && newURLPath.includes('#'))
      // {
      //
      // }
      //
      //
      //
      // console.log(`!! Navigation - onHashchange - oldURLPath: `, oldURLPath);
      // console.log(`!! Navigation - onHashchange - newURLPath: `, newURLPath);
      // console.log(`!! Navigation - onHashchange - oldAnchorEl: `, oldAnchorEl);
      // console.log(`!! Navigation - onHashchange - newAnchorEl: `, newAnchorEl);
   }
</script>

<svelte:window on:hashchange={onHashchange} />

<div bind:this={navigationEl} class=dmt-navigation-content>
   {#each navigationIndex as entry (entry.path)}
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
