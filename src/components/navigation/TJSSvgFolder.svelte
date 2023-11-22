<script>
   /**
    * TJSFolder provides a collapsible folder using the details and summary HTMLElements.
    *
    * This is a slotted component. The default slot is the collapsible contents. There are also two additional optional
    * named slots available for the summary element. `label` allows setting custom content with the fallback being the
    * `label` string. Additionally, `summary-end` allows a component or text to be slotted after the label. This can be
    * useful for say an "expand all" button.
    *
    * ----------------------------------------------------------------------------------------------------------------
    * Exported props include:
    * `folder` ({@link TJSFolderData}): An object defining all properties of a folder including potentially data driven
    * minimal Svelte configuration objects (`slotDefault`, `slotLabel`, and `slotSummaryEnd`) providing default
    * component implementations.
    *
    * Or in lieu of passing the folder object you can assign these props directly:
    * `id`: Anything used for an ID.
    * `label`: The label name of the folder; string.
    * `store`: The store tracking the open / close state: writable<boolean>
    * `styles`: Styles to be applied inline via `applyStyles` action.
    *
    * ----------------------------------------------------------------------------------------------------------------
    * Events: There are several events that are fired and / or bubbled up through parent elements. There are four
    * custom events that pass a details object including: `the details element, id, label, and store`.
    *
    * The following events are bubbled up such that assigning a listener in any parent component receives them
    * from all children folders:
    * `click` - Basic MouseEvent of folder being clicked.
    * `keydown` - Key down event.
    * `keyup` - Key up event.
    * `closeAny` - Triggered when any child folder is closed w/ details object.
    * `openAny` - Triggered when any child folder is opened w/ details object.
    *
    * The following events do not propagate / bubble up and can be registered with:
    * `close` - Triggered when direct descendent folder is closed w/ details object.
    * `open` - Triggered when direct descendent folder is opened w/ details object.
    *
    * ----------------------------------------------------------------------------------------------------------------
    * Styling: To style this component use `details.tjs-folder` as a selector. Each element also contains data
    * attributes for `id` and `label`.
    *
    * There are several local CSS variables that you can use to change the appearance dynamically. Either use
    * CSS props or pass in a `styles` object w/ key / value props to set to the details element.
    *
    * The following CSS variables are supported, but not defined by default.
    *
    * Details element (attributes follow `--tjs-folder-details-`):
    * --tjs-folder-details-margin-left: -0.4em;
    * --tjs-folder-details-padding-left: 0.4em; set for children to indent more;
    *
    * Summary element (attributes follow `--tjs-folder-summary-`):
    * --tjs-folder-summary-background-blend-mode: initial
    * --tjs-folder-summary-background: none
    * --tjs-folder-summary-background-open - fallback: --tjs-folder-summary-background; default: inherit
    * --tjs-folder-summary-border: none
    * --tjs-folder-summary-border-radius: 0
    * --tjs-folder-summary-border-width: initial
    * --tjs-folder-summary-cursor: pointer
    * --tjs-folder-summary-font-size: inherit
    * --tjs-folder-summary-font-weight: bold
    * --tjs-folder-summary-font-family: inherit
    * --tjs-folder-summary-gap: 0.125em
    * --tjs-folder-summary-padding: 0.25em
    * --tjs-folder-summary-transition: background 0.1s
    * --tjs-folder-summary-width: fit-content; wraps content initially, set to 100% or other width measurement
    *
    * Summary element (focus visible):
    * --tjs-folder-summary-box-shadow-focus-visible - fallback: --tjs-default-box-shadow-focus-visible
    * --tjs-folder-summary-outline-focus-visible - fallback: --tjs-default-outline-focus-visible; default: revert
    * --tjs-folder-summary-transition-focus-visible - fallback: --tjs-default-transition-focus-visible
    *
    * A keyboard focus indicator is defined by the following CSS variables:
    * --tjs-folder-summary-focus-indicator-align-self - fallback: --tjs-default-focus-indicator-align-self; default: stretch
    * --tjs-folder-summary-focus-indicator-background - fallback: --tjs-default-focus-indicator-background; default: white
    * --tjs-folder-summary-focus-indicator-border - fallback: --tjs-default-focus-indicator-border; default: undefined
    * --tjs-folder-summary-focus-indicator-border-radius - fallback: --tjs-default-focus-indicator-border-radius; default: 0.1em
    * --tjs-folder-summary-focus-indicator-height - fallback: --tjs-default-focus-indicator-height; default: undefined
    * --tjs-folder-summary-focus-indicator-transition - fallback: --tjs-default-focus-indicator-transition
    * --tjs-folder-summary-focus-indicator-width - fallback: --tjs-default-focus-indicator-width; default: 0.25em
    *
    * Summary SVG / chevron element (attributes follow `--tjs-folder-summary-chevron-`):
    *
    * The width and height use multiple fallback variables before setting a default of 1.25em. You can provide
    * `--tjs-folder-summary-chevron-size`. If not provided then the chevron dimensions are set by
    * `--tjs-folder-summary-font-size`; default: 1.25em.
    *
    * --tjs-folder-summary-chevron-color: currentColor
    * --tjs-folder-summary-chevron-opacity: 0.2; Opacity when not hovering.
    * --tjs-folder-summary-chevron-opacity-hover: 1; Opacity when hovering.
    * --tjs-folder-summary-chevron-margin: 0;
    * --tjs-folder-summary-chevron-transition: opacity 0.2s, transform 0.1s
    * --tjs-folder-summary-chevron-rotate-closed: -90deg; rotation angle when closed.
    * --tjs-folder-summary-chevron-rotate-open: 0; rotation angle when open.
    *
    * Summary label element (attributes follow `--tjs-folder-summary-label-):
    *
    * By default the label element does not wrap and uses ellipsis for text overflow.
    *
    * --tjs-folder-summary-label-overflow: hidden
    * --tjs-folder-summary-label-text-overflow: ellipsis
    * --tjs-folder-summary-label-white-space: nowrap
    * --tjs-folder-summary-label-width: fit-content
    *
    * Default label (focus visible):
    * --tjs-folder-summary-label-text-shadow-focus-visible - fallback: --tjs-default-text-shadow-focus-hover; default: revert
    *
    * Contents element (attributes follow `--tjs-folder-contents-`):
    * --tjs-folder-contents-background-blend-mode: initial
    * --tjs-folder-contents-background: none
    * --tjs-folder-contents-border: none
    * --tjs-folder-contents-margin: 0 0 0 -0.4em
    *
    * Padding is set directly by `--tjs-folder-contents-padding` or follows the following calculation:
    * `0 0 0 calc(var(--tjs-folder-summary-font-size, 1em) * 0.8)`
    *
    * If neither `--tjs-folder-contents-padding` or `--tjs-folder-summary-font-size` is defined the default is
    * `1em * 0.8`.
    */

   import { onDestroy }         from 'svelte';
   import { writable }          from 'svelte/store';

   import { toggleDetails }     from '#runtime/svelte/action/animate';
   import { applyStyles }       from '#runtime/svelte/action/dom';
   import { isSvelteComponent } from '#runtime/svelte/util';
   import { isObject }          from '#runtime/util/object';

   import {
      isWritableStore,
      subscribeIgnoreFirst }    from '#runtime/util/store';

   /** @type {TJSFolderData} */
   export let folder = void 0;

   /** @type {string} */
   export let id = void 0;

   /** @type {string} */
   export let label = void 0;

   /** @type {string} */
   export let keyCode = void 0;

   /** @type {TJSFolderOptions} */
   export let options = void 0;

   /** @type {import('svelte/store').Writable<boolean>} */
   export let store = void 0;

   /** @type {object} */
   export let styles = void 0;

   /** @type {(data?: { event?: KeyboardEvent | PointerEvent }) => void} */
   export let onClose = void 0;

   /** @type {(data?: { event?: KeyboardEvent | PointerEvent }) => void} */
   export let onOpen = void 0;

   /** @type {(data?: { event?: PointerEvent }) => void} */
   export let onContextMenu = void 0;

   /** @type {TJSFolderOptions} */
   const localOptions = {
      chevronOnly: false,
      focusIndicator: false
   }

   let detailsEl, labelEl, summaryEl, svgEl;
   let storeUnsubscribe;

   $: id = isObject(folder) && typeof folder.id === 'string' ? folder.id :
    typeof id === 'string' ? id : void 0;

   $: label = isObject(folder) && typeof folder.label === 'string' ? folder.label :
    typeof label === 'string' ? label : '';

   $: keyCode = isObject(folder) && typeof folder.keyCode === 'string' ? folder.keyCode :
    typeof keyCode === 'string' ? keyCode : 'Enter';

   $: {
      options = isObject(folder) && isObject(folder.options) ? folder.options :
       isObject(options) ? options : {};

      if (typeof options?.chevronOnly === 'boolean') { localOptions.chevronOnly = options.chevronOnly; }
      if (typeof options?.focusIndicator === 'boolean') { localOptions.focusIndicator = options.focusIndicator; }
   }

   $: {
      store = isObject(folder) && isWritableStore(folder.store) ? folder.store :
       isWritableStore(store) ? store : writable(false);

      if (typeof storeUnsubscribe === 'function') { storeUnsubscribe(); }

      // Manually subscribe to store in order to trigger only on changes; avoids initial dispatch on mount as `detailsEl`
      // is not set yet. Directly dispatch custom events as Svelte 3 does not support bubbling of custom events by
      // `createEventDispatcher`.
      storeUnsubscribe = subscribeIgnoreFirst(store, ((value) =>
      {
         if (detailsEl)
         {
            detailsEl.dispatchEvent(createEvent(value ? 'open' : 'close'));
            detailsEl.dispatchEvent(createEvent(value ? 'openAny' : 'closeAny', true));
         }
      }));
   }

   $: styles = isObject(folder) && isObject(folder.styles) ? folder.styles :
    isObject(styles) ? styles : void 0;

   $: onClose = isObject(folder) && typeof folder.onClose === 'function' ? folder.onClose :
    typeof onClose === 'function' ? onClose : void 0;

   $: onOpen = isObject(folder) && typeof folder.onOpen === 'function' ? folder.onOpen :
    typeof onOpen === 'function' ? onOpen : void 0;

   $: onContextMenu = isObject(folder) && typeof folder.onContextMenu === 'function' ? folder.onContextMenu :
    typeof onContextMenu === 'function' ? onContextMenu : void 0;

   // For performance reasons when the folder is closed the main slot is not rendered.
   // When the folder is closed `visible` is set to false with a slight delay to allow the closing animation to
   // complete.
   let visible = $store;
   let timeoutId;

   $: if (!$store)
   {
      timeoutId = setTimeout(() => visible = false, 500);
   }
   else
   {
      clearTimeout(timeoutId);
      visible = true;
   }

   onDestroy(() => storeUnsubscribe());

   /**
    * Create a CustomEvent with details object containing relevant element and props.
    *
    * @param {string}   type - Event name / type.
    *
    * @param {boolean}  [bubbles=false] - Does the event bubble.
    *
    * @returns {CustomEvent<object>}
    */
   function createEvent(type, bubbles = false)
   {
      return new CustomEvent(type, {
         detail: { element: detailsEl, folder, id, label, store },
         bubbles
      });
   }

   /**
    * Handles opening / closing the details element from either click or keyboard event when summary focused.
    *
    * @param {KeyboardEvent | PointerEvent} event - Event.
    *
    * @param {boolean} [fromKeyboard=false] - True when event is coming from keyboard. This is used to ignore the
    * chevronOnly click event handling.
    */
   function handleOpenClose(event, fromKeyboard = false)
   {
      const target = event.target;

      const chevronTarget = target === svgEl || svgEl.contains(target);

      if (target === summaryEl || target === labelEl || chevronTarget ||
       target.querySelector('.summary-click') !== null)
      {
         if (!fromKeyboard && localOptions.chevronOnly && !chevronTarget)
         {
            event.preventDefault();
            event.stopPropagation();
            return;
         }

         $store = !$store;

         if ($store && typeof onOpen === 'function')
         {
            onOpen({ event });
         }
         else if (typeof onClose === 'function')
         {
            onClose({ event });
         }

         event.preventDefault();
         event.stopPropagation();
      }
      else
      {
         // Handle exclusion cases when no-summary-click class is in target, targets children, or targets parent
         // element.
         if (target.classList.contains('no-summary-click') || target.querySelector('.no-summary-click') !== null ||
          (target.parentElement && target.parentElement.classList.contains('no-summary-click')))
         {
            event.preventDefault();
            event.stopPropagation();
         }
      }
   }

   /**
    * Detects whether the summary click came from a pointer / mouse device or the keyboard. If from the keyboard and
    * the active element is `summaryEl` then no action is taken and `onKeyDown` will handle the key event to open /
    * close the detail element.
    *
    * @param {PointerEvent|MouseEvent} event
    */
   function onClickSummary(event)
   {
      // Firefox sends a `click` event / non-standard response so check for mozInputSource equaling 6 (keyboard) or
      // a negative pointerId from Chromium and prevent default. This allows `onKeyUp` to handle any open / close
      // action.
      if (document.activeElement === summaryEl && (event?.pointerId === -1 || event?.mozInputSource === 6))
      {
         event.preventDefault();
         event.stopPropagation();
         return;
      }

      handleOpenClose(event);
   }

   /**
    * Handles a context menu press forwarding the event to the handler.
    *
    * @param {PointerEvent} event - PointerEvent.
    */
   function onContextMenuPress(event)
   {
      if (typeof onContextMenu === 'function') { onContextMenu({ event }); }
   }

   /**
    * Detect if the key event came from the active tabbed / focused summary element and `options.keyCode` matches.
    *
    * @param {KeyboardEvent} event -
    */
   function onKeyDown(event)
   {
      if (document.activeElement === summaryEl && event.code === keyCode)
      {
         event.preventDefault();
         event.stopPropagation();
      }
   }

   /**
    * Detect if the key event came from the active tabbed / focused summary element and `options.keyCode` matches.
    *
    * @param {KeyboardEvent} event -
    */
   function onKeyUp(event)
   {
      if (document.activeElement === summaryEl && event.code === keyCode)
      {
         handleOpenClose(event, true);

         event.preventDefault();
         event.stopPropagation();
      }
   }

   /**
    * Handle receiving bubbled event from summary or content to close details / content.
    */
   function onLocalClose(event)
   {
      event.preventDefault();
      event.stopPropagation();

      store.set(false);
   }

   /**
    * Handle receiving bubbled event from summary bar to open details / content.
    */
   function onLocalOpen(event)
   {
      event.preventDefault();
      event.stopPropagation();

      store.set(true);
   }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<details class=tjs-svg-folder
         bind:this={detailsEl}

         on:close={onLocalClose}
         on:closeAny={onLocalClose}
         on:open={onLocalOpen}
         on:openAny={onLocalOpen}

         on:click
         on:keydown
         on:keyup
         on:open
         on:close
         on:openAny
         on:closeAny

         use:toggleDetails={{ store, clickActive: false }}
         use:applyStyles={styles}
         data-id={id}
         data-label={label}
         data-closing='false'>
    <!-- svelte-ignore a11y-no-redundant-roles -->
    <summary bind:this={summaryEl}
             on:click|capture={onClickSummary}
             on:contextmenu={onContextMenuPress}
             on:keydown|capture={onKeyDown}
             on:keyup|capture={onKeyUp}
             class:default-cursor={localOptions.chevronOnly}
             role=button
             tabindex=0>
        <svg bind:this={svgEl} viewBox="0 0 24 24">
            <path
                fill=currentColor
                stroke=currentColor
                style="stroke-linejoin: round; stroke-width: 3;"
                d="M5,8L19,8L12,15Z"
            />
        </svg>

        {#if localOptions.focusIndicator}
           <div class=tjs-folder-focus-indicator />
        {/if}

        <slot name=label>
            {#if isSvelteComponent(folder?.slotLabel?.class)}
                <svelte:component this={folder.slotLabel.class} {...(isObject(folder?.slotLabel?.props) ? folder.slotLabel.props : {})} />
            {:else}
                <div bind:this={labelEl} class=label>{label}</div>
            {/if}
        </slot>

        <slot name="summary-end">
            {#if isSvelteComponent(folder?.slotSummaryEnd?.class)}
                <svelte:component this={folder.slotSummaryEnd.class} {...(isObject(folder?.slotSummaryEnd?.props) ? folder.slotSummaryEnd.props : {})} />
            {/if}
        </slot>
    </summary>

    <div class=contents>
        {#if visible}
            <slot>
                {#if isSvelteComponent(folder?.slotDefault?.class)}
                    <svelte:component this={folder.slotDefault.class} {...(isObject(folder?.slotDefault?.props) ? folder.slotDefault.props : {})} />
                {/if}
            </slot>
        {/if}
    </div>
</details>

<style>
    details {
        margin-left: var(--tjs-folder-details-margin-left, -0.4em);
        padding-left: var(--tjs-folder-details-padding-left, 0.4em); /* Set for children folders to increase indent */
    }

    summary {
        display: flex;
        position: relative;
        align-items: center;
        background-blend-mode: var(--tjs-folder-summary-background-blend-mode, initial);
        background: var(--tjs-folder-summary-background, none);
        border: var(--tjs-folder-summary-border, none);
        border-radius: var(--tjs-folder-summary-border-radius, 0);
        border-width: var(--tjs-folder-summary-border-width, initial);
        cursor: var(--tjs-folder-summary-cursor, pointer);
        font-size: var(--tjs-folder-summary-font-size, inherit);
        font-weight: var(--tjs-folder-summary-font-weight, bold);
        font-family: var(--tjs-folder-summary-font-family, inherit);
        gap: var(--tjs-folder-summary-gap, 0.125em);
        list-style: none;
        margin: var(--tjs-folder-summary-margin, 0 0 0 -0.4em);
        padding: var(--tjs-folder-summary-padding, 0.25em) 0;
        transition: var(--tjs-folder-summary-transition, background 0.1s);
        user-select: none;
        width: var(--tjs-folder-summary-width, fit-content);
    }

    .default-cursor {
        cursor: default;
    }

    summary svg {
        width: var(--tjs-folder-summary-chevron-size, var(--tjs-folder-summary-font-size, 1.25em));
        height: var(--tjs-folder-summary-chevron-size, var(--tjs-folder-summary-font-size, 1.25em));
        color: var(--tjs-folder-summary-chevron-color, currentColor);
        cursor: var(--tjs-folder-summary-cursor, pointer);
        opacity: var(--tjs-folder-summary-chevron-opacity, 0.2);
        margin: var(--tjs-folder-summary-chevron-margin, 0);
        transition: var(--tjs-folder-summary-chevron-transition, opacity 0.2s, transform 0.1s);
        transform: var(--tjs-folder-summary-chevron-rotate-closed, rotate(-90deg));
    }

    summary:focus-visible {
        box-shadow: var(--tjs-folder-summary-box-shadow-focus-visible, var(--tjs-default-box-shadow-focus-visible));
        outline: var(--tjs-folder-summary-outline-focus-visible, var(--tjs-default-outline-focus-visible, revert));
        transition: var(--tjs-folder-summary-transition-focus-visible, var(--tjs-default-transition-focus-visible));
    }

    summary:focus-visible .label {
        text-shadow: var(--tjs-folder-summary-label-text-shadow-focus-visible, var(--tjs-default-text-shadow-focus-hover, revert));
    }

    summary:focus-visible .tjs-folder-focus-indicator {
        background: var(--tjs-folder-summary-focus-indicator-background, var(--tjs-default-focus-indicator-background, white));
    }

    summary:hover svg {
        opacity: var(--tjs-folder-summary-chevron-opacity-hover, 1);
    }

    .tjs-folder-focus-indicator {
        align-self: var(--tjs-folder-summary-focus-indicator-align-self, var(--tjs-default-focus-indicator-align-self, stretch));
        border: var(--tjs-folder-summary-focus-indicator-border, var(--tjs-default-focus-indicator-border));
        border-radius: var(--tjs-folder-summary-focus-indicator-border-radius, var(--tjs-default-focus-indicator-border-radius, 0.1em));
        flex: 0 0 var(--tjs-folder-summary-focus-indicator-width, var(--tjs-default-focus-indicator-width, 0.25em));
        height: var(--tjs-folder-summary-focus-indicator-height, var(--tjs-default-focus-indicator-height));
        transition: var(--tjs-folder-summary-focus-indicator-transition, var(--tjs-default-focus-indicator-transition));
    }

    details[open] > summary {
        background: var(--tjs-folder-summary-background-open, var(--tjs-folder-summary-background, inherit));
    }

    [open]:not(details[data-closing='true']) > summary svg {
        transform: rotate(var(--tjs-folder-summary-chevron-rotate-open, 0));
    }

    .contents {
        position: relative;
        background-blend-mode: var(--tjs-folder-contents-background-blend-mode, initial);
        background: var(--tjs-folder-contents-background, none);
        border: var(--tjs-folder-contents-border, none);
        margin: var(--tjs-folder-contents-margin, 0 0 0 -0.4em);
        padding: var(--tjs-folder-contents-padding, 0 0 0 calc(var(--tjs-folder-summary-font-size, 1em) * 0.8));
    }

    .contents::before {
        content: '';
        position: absolute;
        width: 0;
        height: calc(100% + 0.65em);
        left: 0;
        top: -0.65em;
    }

    .label {
        overflow: var(--tjs-folder-summary-label-overflow, hidden);
        text-overflow: var(--tjs-folder-summary-label-text-overflow, ellipsis);
        white-space: var(--tjs-folder-summary-label-white-space, nowrap);
        width: var(--tjs-folder-summary-label-width, fit-content);
    }

    summary:focus-visible + .contents::before {
        height: 100%;
        top: 0;
    }
</style>
