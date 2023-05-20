<script>
   import { onMount }      from 'svelte';

   import { unescapeAttr } from "#utils";

   /**
    * The `page.url` from the associated PageEvent. Used to set the "current" class.
    */
   export let pageurl = void 0;

   let pageURL;

   $: if (pageurl)
   {
      try
      {
         pageURL = unescapeAttr(pageurl)
      }
      catch (err)
      {
         console.warn(`[typedoc-theme-dmt] Navigation WC - Failure to deserialize pageurl: `, pageurl);
      }
   }


   onMount(() =>
   {
      // Set current active anchor -----------------------------------------------------------------------------------

      if (typeof pageURL === 'string')
      {
         const activeAnchor = globalThis.document.querySelector(`wc-dmt-nav a[href$="${pageURL}"]`);
         if (activeAnchor) { activeAnchor.classList.add('current'); }
      }
      else
      {
         console.warn(`[typedoc-theme-dmt] Navigation WC - 'pageURL' not set in 'onMount'.`);
      }

      // Process all anchors in navigation ---------------------------------------------------------------------------

      const baseURL = import.meta.url.replace(/assets\/dmt-web-components.js/, '');
      const pathURL = globalThis.location.href.replace(baseURL, '');

      const depth = (pathURL.match(/\//) ?? []).length;
      const match = pathURL.match(/(.*)\//);

      const reflectionCategories = new Set(['classes', 'enums', 'functions', 'interfaces', 'modules', 'types',
         'variables']);

      // All URLS in the navigation content need to potentially be rewritten if we are at a depth of 1. The URLs in the
      // generated template below are from the documentation root path.
      if (depth === 1 && match)
      {
         const regexRemovePath = new RegExp('(.*)?\/', 'gm');
         const current = match[1];

         // Always rewrite `modules.html`.
         const modulesAnchor = globalThis.document.querySelector('wc-dmt-nav a[href$="modules.html"]');
         if (modulesAnchor) { modulesAnchor.href = '../modules.html'; }

         // All anchors at the current path must be adjusted removing the current path.
         const currentAnchors = globalThis.document.querySelectorAll(`wc-dmt-nav a[href^="${current}"]`);
         for (let cntr = currentAnchors.length; --cntr >= 0;)
         {
            currentAnchors[cntr].href = currentAnchors[cntr].href.replace(regexRemovePath, '');
         }

         // The rest of the reflection category types must substitute a relative path one folder down.
         reflectionCategories.delete(current);

         for (const category of reflectionCategories)
         {
            const categoryReplacement = `../${category}/`;
            const categoryAnchors = globalThis.document.querySelectorAll(`wc-dmt-nav a[href^="${category}"]`);

            for (let cntr = categoryAnchors.length; --cntr >= 0;)
            {
               categoryAnchors[cntr].href = categoryAnchors[cntr].href.replace(regexRemovePath, categoryReplacement);
            }
         }
      }
   })
</script>

<!-- Currently this is static test data for the TS ES2023 docs -->
<a href="modules.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-namespace)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6" id="icon-4-path"></rect><path d="M9.33 16V7.24H10.77L13.446 14.74C13.43 14.54 13.41 14.296 13.386 14.008C13.37 13.712 13.354 13.404 13.338 13.084C13.33 12.756 13.326 12.448 13.326 12.16V7.24H14.37V16H12.93L10.266 8.5C10.282 8.692 10.298 8.936 10.314 9.232C10.33 9.52 10.342 9.828 10.35 10.156C10.366 10.476 10.374 10.784 10.374 11.08V16H9.33Z" fill="var(--color-text)" id="icon-4-text"></path></svg><span>Typescript <wbr>Library <wbr>Declarations (ES2023)</span></a>
<ul class="tsd-small-nested-navigation">
   <li>
      <details class="tsd-index-accordion" data-key="Intl"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.93896 8.531L12 15.591L19.061 8.531L16.939 6.409L12 11.349L7.06098 6.409L4.93896 8.531Z" fill="var(--color-text)"></path></svg><a href="modules/Intl.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4-path"></use><use href="#icon-4-text"></use></svg><span>Intl</span></a></summary>
         <div class="tsd-accordion-details">
            <ul class="tsd-nested-navigation">
               <li><a href="interfaces/Intl.Collator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-interface)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6" id="icon-256-path"></rect><path d="M9.51 16V15.016H11.298V8.224H9.51V7.24H14.19V8.224H12.402V15.016H14.19V16H9.51Z" fill="var(--color-text)" id="icon-256-text"></path></svg><span>Collator</span></a></li>
               <li><a href="interfaces/Intl.CollatorOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Collator<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.DateTimeFormat.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Time<wbr>Format</span></a></li>
               <li><a href="interfaces/Intl.DateTimeFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Time<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.DateTimeFormatPart.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Time<wbr>Format<wbr>Part</span></a></li>
               <li><a href="interfaces/Intl.DateTimeFormatPartTypesRegistry.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Time<wbr>Format<wbr>Part<wbr>Types<wbr>Registry</span></a></li>
               <li><a href="interfaces/Intl.DateTimeRangeFormatPart.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Time<wbr>Range<wbr>Format<wbr>Part</span></a></li>
               <li><a href="interfaces/Intl.DisplayNames.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Display<wbr>Names</span></a></li>
               <li><a href="interfaces/Intl.DisplayNamesOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Display<wbr>Names<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ListFormat.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>List<wbr>Format</span></a></li>
               <li><a href="interfaces/Intl.ListFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>List<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.Locale.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Locale</span></a></li>
               <li><a href="interfaces/Intl.LocaleOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Locale<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.NumberFormat.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Number<wbr>Format</span></a></li>
               <li><a href="interfaces/Intl.NumberFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Number<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.NumberFormatPart.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Number<wbr>Format<wbr>Part</span></a></li>
               <li><a href="interfaces/Intl.PluralRules.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Plural<wbr>Rules</span></a></li>
               <li><a href="interfaces/Intl.PluralRulesOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Plural<wbr>Rules<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.RelativeTimeFormat.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Relative<wbr>Time<wbr>Format</span></a></li>
               <li><a href="interfaces/Intl.RelativeTimeFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedCollatorOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Collator<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedDateTimeFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Date<wbr>Time<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedDisplayNamesOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Display<wbr>Names<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedListFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>List<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedNumberFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Number<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedPluralRulesOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Plural<wbr>Rules<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedRelativeTimeFormatOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Relative<wbr>Time<wbr>Format<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.ResolvedSegmenterOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Resolved<wbr>Segmenter<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.SegmentData.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Segment<wbr>Data</span></a></li>
               <li><a href="interfaces/Intl.Segmenter.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Segmenter</span></a></li>
               <li><a href="interfaces/Intl.SegmenterOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Segmenter<wbr>Options</span></a></li>
               <li><a href="interfaces/Intl.Segments.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Segments</span></a></li>
               <li><a href="types/Intl.BCP47LanguageTag.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-type-alias)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6" id="icon-4194304-path"></rect><path d="M11.31 16V8.224H8.91V7.24H14.79V8.224H12.39V16H11.31Z" fill="var(--color-text)" id="icon-4194304-text"></path></svg><span>BCP47<wbr>Language<wbr>Tag</span></a></li>
               <li><a href="types/Intl.DateTimeFormatPartTypes.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Date<wbr>Time<wbr>Format<wbr>Part<wbr>Types</span></a></li>
               <li><a href="types/Intl.DisplayNamesFallback.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Display<wbr>Names<wbr>Fallback</span></a></li>
               <li><a href="types/Intl.DisplayNamesLanguageDisplay.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Display<wbr>Names<wbr>Language<wbr>Display</span></a></li>
               <li><a href="types/Intl.DisplayNamesType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Display<wbr>Names<wbr>Type</span></a></li>
               <li><a href="types/Intl.ES2018NumberFormatPartType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>ES2018<wbr>Number<wbr>Format<wbr>Part<wbr>Type</span></a></li>
               <li><a href="types/Intl.ES2020NumberFormatPartType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>ES2020<wbr>Number<wbr>Format<wbr>Part<wbr>Type</span></a></li>
               <li><a href="types/Intl.LDMLPluralRule.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>LDMLPlural<wbr>Rule</span></a></li>
               <li><a href="types/Intl.ListFormatLocaleMatcher.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>List<wbr>Format<wbr>Locale<wbr>Matcher</span></a></li>
               <li><a href="types/Intl.ListFormatStyle.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>List<wbr>Format<wbr>Style</span></a></li>
               <li><a href="types/Intl.ListFormatType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>List<wbr>Format<wbr>Type</span></a></li>
               <li><a href="types/Intl.LocaleCollationCaseFirst.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Locale<wbr>Collation<wbr>Case<wbr>First</span></a></li>
               <li><a href="types/Intl.LocaleHourCycleKey.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Locale<wbr>Hour<wbr>Cycle<wbr>Key</span></a></li>
               <li><a href="types/Intl.LocalesArgument.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Locales<wbr>Argument</span></a></li>
               <li><a href="types/Intl.NumberFormatPartTypes.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Number<wbr>Format<wbr>Part<wbr>Types</span></a></li>
               <li><a href="types/Intl.PluralRuleType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Plural<wbr>Rule<wbr>Type</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatLocaleMatcher.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Locale<wbr>Matcher</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatNumeric.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Numeric</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatPart.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Part</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatStyle.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Style</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatUnit.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Unit</span></a></li>
               <li><a href="types/Intl.RelativeTimeFormatUnitSingular.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Relative<wbr>Time<wbr>Format<wbr>Unit<wbr>Singular</span></a></li>
               <li><a href="types/Intl.UnicodeBCP47LocaleIdentifier.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>UnicodeBCP47<wbr>Locale<wbr>Identifier</span></a></li>
               <li><a href="variables/Intl.DisplayNames-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-variable)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6" id="icon-32-path"></rect><path d="M11.106 16L8.85 7.24H9.966L11.454 13.192C11.558 13.608 11.646 13.996 11.718 14.356C11.79 14.708 11.842 14.976 11.874 15.16C11.906 14.976 11.954 14.708 12.018 14.356C12.09 13.996 12.178 13.608 12.282 13.192L13.758 7.24H14.85L12.582 16H11.106Z" fill="var(--color-text)" id="icon-32-text"></path></svg><span>Display<wbr>Names</span></a></li>
               <li><a href="variables/Intl.ListFormat-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>List<wbr>Format</span></a></li>
               <li><a href="variables/Intl.Locale-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Locale</span></a></li>
               <li><a href="variables/Intl.RelativeTimeFormat-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Relative<wbr>Time<wbr>Format</span></a></li>
               <li><a href="variables/Intl.Segmenter-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Segmenter</span></a></li>
               <li><a href="functions/Intl.Collator-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><rect fill="var(--color-icon-background)" stroke="var(--color-ts-function)" stroke-width="1.5" x="1" y="1" width="22" height="22" rx="6" id="icon-64-path"></rect><path d="M9.39 16V7.24H14.55V8.224H10.446V11.128H14.238V12.112H10.47V16H9.39Z" fill="var(--color-text)" id="icon-64-text"></path></svg><span>Collator</span></a></li>
               <li><a href="functions/Intl.DateTimeFormat-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Date<wbr>Time<wbr>Format</span></a></li>
               <li><a href="functions/Intl.NumberFormat-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Number<wbr>Format</span></a></li>
               <li><a href="functions/Intl.PluralRules-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Plural<wbr>Rules</span></a></li></ul></div></details></li>
   <li>
      <details class="tsd-index-accordion" data-key="Reflect"><summary class="tsd-accordion-summary"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4.93896 8.531L12 15.591L19.061 8.531L16.939 6.409L12 11.349L7.06098 6.409L4.93896 8.531Z" fill="var(--color-text)"></path></svg><a href="modules/Reflect.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4-path"></use><use href="#icon-4-text"></use></svg><span>Reflect</span></a></summary>
         <div class="tsd-accordion-details">
            <ul class="tsd-nested-navigation">
               <li><a href="functions/Reflect.apply.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>apply</span></a></li>
               <li><a href="functions/Reflect.construct.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>construct</span></a></li>
               <li><a href="functions/Reflect.defineProperty.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>define<wbr>Property</span></a></li>
               <li><a href="functions/Reflect.deleteProperty.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>delete<wbr>Property</span></a></li>
               <li><a href="functions/Reflect.get.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>get</span></a></li>
               <li><a href="functions/Reflect.getOwnPropertyDescriptor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>get<wbr>Own<wbr>Property<wbr>Descriptor</span></a></li>
               <li><a href="functions/Reflect.getPrototypeOf.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>get<wbr>Prototype<wbr>Of</span></a></li>
               <li><a href="functions/Reflect.has.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>has</span></a></li>
               <li><a href="functions/Reflect.isExtensible.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>is<wbr>Extensible</span></a></li>
               <li><a href="functions/Reflect.ownKeys.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>own<wbr>Keys</span></a></li>
               <li><a href="functions/Reflect.preventExtensions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>prevent<wbr>Extensions</span></a></li>
               <li><a href="functions/Reflect.set.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>set</span></a></li>
               <li><a href="functions/Reflect.setPrototypeOf.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>set<wbr>Prototype<wbr>Of</span></a></li></ul></div></details></li>
   <li><a href="interfaces/AggregateError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Aggregate<wbr>Error</span></a></li>
   <li><a href="interfaces/AggregateErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Aggregate<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array</span></a></li>
   <li><a href="interfaces/ArrayBuffer.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Buffer</span></a></li>
   <li><a href="interfaces/ArrayBufferConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Buffer<wbr>Constructor</span></a></li>
   <li><a href="interfaces/ArrayBufferTypes.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Buffer<wbr>Types</span></a></li>
   <li><a href="interfaces/ArrayBufferView.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Buffer<wbr>View</span></a></li>
   <li><a href="interfaces/ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/ArrayLike.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Array<wbr>Like</span></a></li>
   <li><a href="interfaces/AsyncGenerator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Generator</span></a></li>
   <li><a href="interfaces/AsyncGeneratorFunction.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Generator<wbr>Function</span></a></li>
   <li><a href="interfaces/AsyncGeneratorFunctionConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Generator<wbr>Function<wbr>Constructor</span></a></li>
   <li><a href="interfaces/AsyncIterable.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Iterable</span></a></li>
   <li><a href="interfaces/AsyncIterableIterator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Iterable<wbr>Iterator</span></a></li>
   <li><a href="interfaces/AsyncIterator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Async<wbr>Iterator</span></a></li>
   <li><a href="interfaces/Atomics.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Atomics</span></a></li>
   <li><a href="interfaces/BigInt.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Int</span></a></li>
   <li><a href="interfaces/BigInt64Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Int64<wbr>Array</span></a></li>
   <li><a href="interfaces/BigInt64ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Int64<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/BigIntConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Int<wbr>Constructor</span></a></li>
   <li><a href="interfaces/BigIntToLocaleStringOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Int<wbr>To<wbr>Locale<wbr>String<wbr>Options</span></a></li>
   <li><a href="interfaces/BigUint64Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Uint64<wbr>Array</span></a></li>
   <li><a href="interfaces/BigUint64ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Big<wbr>Uint64<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Boolean.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Boolean</span></a></li>
   <li><a href="interfaces/BooleanConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Boolean<wbr>Constructor</span></a></li>
   <li><a href="interfaces/CallableFunction.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Callable<wbr>Function</span></a></li>
   <li><a href="interfaces/ClassAccessorDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Accessor<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ClassAccessorDecoratorResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Accessor<wbr>Decorator<wbr>Result</span></a></li>
   <li><a href="interfaces/ClassAccessorDecoratorTarget.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Accessor<wbr>Decorator<wbr>Target</span></a></li>
   <li><a href="interfaces/ClassDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ClassFieldDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Field<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ClassGetterDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Getter<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ClassMethodDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Method<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ClassSetterDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Class<wbr>Setter<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="interfaces/ConcatArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Concat<wbr>Array</span></a></li>
   <li><a href="interfaces/DataView.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Data<wbr>View</span></a></li>
   <li><a href="interfaces/DataViewConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Data<wbr>View<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Date.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date</span></a></li>
   <li><a href="interfaces/DateConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Date<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Error.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Error</span></a></li>
   <li><a href="interfaces/ErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/ErrorOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Error<wbr>Options</span></a></li>
   <li><a href="interfaces/EvalError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Eval<wbr>Error</span></a></li>
   <li><a href="interfaces/EvalErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Eval<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/FinalizationRegistry.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Finalization<wbr>Registry</span></a></li>
   <li><a href="interfaces/FinalizationRegistryConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Finalization<wbr>Registry<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Float32Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Float32<wbr>Array</span></a></li>
   <li><a href="interfaces/Float32ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Float32<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Float64Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Float64<wbr>Array</span></a></li>
   <li><a href="interfaces/Float64ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Float64<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Function.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Function</span></a></li>
   <li><a href="interfaces/FunctionConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Function<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Generator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Generator</span></a></li>
   <li><a href="interfaces/GeneratorFunction.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Generator<wbr>Function</span></a></li>
   <li><a href="interfaces/GeneratorFunctionConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Generator<wbr>Function<wbr>Constructor</span></a></li>
   <li><a href="interfaces/IArguments.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>IArguments</span></a></li>
   <li><a href="interfaces/ImportAssertions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Import<wbr>Assertions</span></a></li>
   <li><a href="interfaces/ImportCallOptions.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Import<wbr>Call<wbr>Options</span></a></li>
   <li><a href="interfaces/ImportMeta.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Import<wbr>Meta</span></a></li>
   <li><a href="interfaces/Int16Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int16<wbr>Array</span></a></li>
   <li><a href="interfaces/Int16ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int16<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Int32Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int32<wbr>Array</span></a></li>
   <li><a href="interfaces/Int32ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int32<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Int8Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int8<wbr>Array</span></a></li>
   <li><a href="interfaces/Int8ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Int8<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Iterable.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Iterable</span></a></li>
   <li><a href="interfaces/IterableIterator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Iterable<wbr>Iterator</span></a></li>
   <li><a href="interfaces/Iterator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Iterator</span></a></li>
   <li><a href="interfaces/IteratorReturnResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Iterator<wbr>Return<wbr>Result</span></a></li>
   <li><a href="interfaces/IteratorYieldResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Iterator<wbr>Yield<wbr>Result</span></a></li>
   <li><a href="interfaces/JSON.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>JSON</span></a></li>
   <li><a href="interfaces/Map.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Map</span></a></li>
   <li><a href="interfaces/MapConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Map<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Math.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Math</span></a></li>
   <li><a href="interfaces/NewableFunction.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Newable<wbr>Function</span></a></li>
   <li><a href="interfaces/Number.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Number</span></a></li>
   <li><a href="interfaces/NumberConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Number<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Object.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Object</span></a></li>
   <li><a href="interfaces/ObjectConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Object<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Promise.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Promise</span></a></li>
   <li><a href="interfaces/PromiseConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Promise<wbr>Constructor</span></a></li>
   <li><a href="interfaces/PromiseFulfilledResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Promise<wbr>Fulfilled<wbr>Result</span></a></li>
   <li><a href="interfaces/PromiseLike.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Promise<wbr>Like</span></a></li>
   <li><a href="interfaces/PromiseRejectedResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Promise<wbr>Rejected<wbr>Result</span></a></li>
   <li><a href="interfaces/PropertyDescriptor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Property<wbr>Descriptor</span></a></li>
   <li><a href="interfaces/PropertyDescriptorMap.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Property<wbr>Descriptor<wbr>Map</span></a></li>
   <li><a href="interfaces/ProxyConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Proxy<wbr>Constructor</span></a></li>
   <li><a href="interfaces/ProxyHandler.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Proxy<wbr>Handler</span></a></li>
   <li><a href="interfaces/RangeError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Range<wbr>Error</span></a></li>
   <li><a href="interfaces/RangeErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Range<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/ReadonlyArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Readonly<wbr>Array</span></a></li>
   <li><a href="interfaces/ReadonlyMap.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Readonly<wbr>Map</span></a></li>
   <li><a href="interfaces/ReadonlySet.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Readonly<wbr>Set</span></a></li>
   <li><a href="interfaces/ReferenceError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reference<wbr>Error</span></a></li>
   <li><a href="interfaces/ReferenceErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reference<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/RegExp.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reg<wbr>Exp</span></a></li>
   <li><a href="interfaces/RegExpConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reg<wbr>Exp<wbr>Constructor</span></a></li>
   <li><a href="interfaces/RegExpExecArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reg<wbr>Exp<wbr>Exec<wbr>Array</span></a></li>
   <li><a href="interfaces/RegExpIndicesArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reg<wbr>Exp<wbr>Indices<wbr>Array</span></a></li>
   <li><a href="interfaces/RegExpMatchArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Reg<wbr>Exp<wbr>Match<wbr>Array</span></a></li>
   <li><a href="interfaces/Set.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Set</span></a></li>
   <li><a href="interfaces/SetConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Set<wbr>Constructor</span></a></li>
   <li><a href="interfaces/SharedArrayBuffer.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Shared<wbr>Array<wbr>Buffer</span></a></li>
   <li><a href="interfaces/SharedArrayBufferConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Shared<wbr>Array<wbr>Buffer<wbr>Constructor</span></a></li>
   <li><a href="interfaces/String.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>String</span></a></li>
   <li><a href="interfaces/StringConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>String<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Symbol.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Symbol</span></a></li>
   <li><a href="interfaces/SymbolConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Symbol<wbr>Constructor</span></a></li>
   <li><a href="interfaces/SyntaxError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Syntax<wbr>Error</span></a></li>
   <li><a href="interfaces/SyntaxErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Syntax<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/TemplateStringsArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Template<wbr>Strings<wbr>Array</span></a></li>
   <li><a href="interfaces/ThisType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>This<wbr>Type</span></a></li>
   <li><a href="interfaces/TypeError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Type<wbr>Error</span></a></li>
   <li><a href="interfaces/TypeErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Type<wbr>Error<wbr>Constructor</span></a></li>
   <li><a href="interfaces/TypedPropertyDescriptor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Typed<wbr>Property<wbr>Descriptor</span></a></li>
   <li><a href="interfaces/URIError.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>URIError</span></a></li>
   <li><a href="interfaces/URIErrorConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>URIError<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Uint16Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint16<wbr>Array</span></a></li>
   <li><a href="interfaces/Uint16ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint16<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Uint32Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint32<wbr>Array</span></a></li>
   <li><a href="interfaces/Uint32ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint32<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Uint8Array.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint8<wbr>Array</span></a></li>
   <li><a href="interfaces/Uint8ArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint8<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/Uint8ClampedArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint8<wbr>Clamped<wbr>Array</span></a></li>
   <li><a href="interfaces/Uint8ClampedArrayConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Uint8<wbr>Clamped<wbr>Array<wbr>Constructor</span></a></li>
   <li><a href="interfaces/WeakMap.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Map</span></a></li>
   <li><a href="interfaces/WeakMapConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Map<wbr>Constructor</span></a></li>
   <li><a href="interfaces/WeakRef.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Ref</span></a></li>
   <li><a href="interfaces/WeakRefConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Ref<wbr>Constructor</span></a></li>
   <li><a href="interfaces/WeakSet.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Set</span></a></li>
   <li><a href="interfaces/WeakSetConstructor.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-256-path"></use><use href="#icon-256-text"></use></svg><span>Weak<wbr>Set<wbr>Constructor</span></a></li>
   <li><a href="types/ArrayBufferLike.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Array<wbr>Buffer<wbr>Like</span></a></li>
   <li><a href="types/Awaited.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Awaited</span></a></li>
   <li><a href="types/Capitalize.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Capitalize</span></a></li>
   <li><a href="types/ClassDecorator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Class<wbr>Decorator</span></a></li>
   <li><a href="types/ClassMemberDecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Class<wbr>Member<wbr>Decorator<wbr>Context</span></a></li>
   <li><a href="types/ConstructorParameters.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Constructor<wbr>Parameters</span></a></li>
   <li><a href="types/DecoratorContext.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Decorator<wbr>Context</span></a></li>
   <li><a href="types/Exclude.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Exclude</span></a></li>
   <li><a href="types/Extract.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Extract</span></a></li>
   <li><a href="types/FlatArray.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Flat<wbr>Array</span></a></li>
   <li><a href="types/InstanceType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Instance<wbr>Type</span></a></li>
   <li><a href="types/IteratorResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Iterator<wbr>Result</span></a></li>
   <li><a href="types/Lowercase.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Lowercase</span></a></li>
   <li><a href="types/MethodDecorator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Method<wbr>Decorator</span></a></li>
   <li><a href="types/NonNullable.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Non<wbr>Nullable</span></a></li>
   <li><a href="types/Omit.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Omit</span></a></li>
   <li><a href="types/OmitThisParameter.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Omit<wbr>This<wbr>Parameter</span></a></li>
   <li><a href="types/ParameterDecorator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Parameter<wbr>Decorator</span></a></li>
   <li><a href="types/Parameters.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Parameters</span></a></li>
   <li><a href="types/Partial.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Partial</span></a></li>
   <li><a href="types/Pick.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Pick</span></a></li>
   <li><a href="types/PromiseConstructorLike.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Promise<wbr>Constructor<wbr>Like</span></a></li>
   <li><a href="types/PromiseSettledResult.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Promise<wbr>Settled<wbr>Result</span></a></li>
   <li><a href="types/PropertyDecorator.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Property<wbr>Decorator</span></a></li>
   <li><a href="types/PropertyKey.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Property<wbr>Key</span></a></li>
   <li><a href="types/Readonly.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Readonly</span></a></li>
   <li><a href="types/Record.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Record</span></a></li>
   <li><a href="types/Required.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Required</span></a></li>
   <li><a href="types/ReturnType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Return<wbr>Type</span></a></li>
   <li><a href="types/ThisParameterType.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>This<wbr>Parameter<wbr>Type</span></a></li>
   <li><a href="types/Uncapitalize.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Uncapitalize</span></a></li>
   <li><a href="types/Uppercase.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-4194304-path"></use><use href="#icon-4194304-text"></use></svg><span>Uppercase</span></a></li>
   <li><a href="variables/ArrayBuffer-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Array<wbr>Buffer</span></a></li>
   <li><a href="variables/Atomics-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Atomics</span></a></li>
   <li><a href="variables/BigInt64Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Big<wbr>Int64<wbr>Array</span></a></li>
   <li><a href="variables/BigUint64Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Big<wbr>Uint64<wbr>Array</span></a></li>
   <li><a href="variables/DataView-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Data<wbr>View</span></a></li>
   <li><a href="variables/FinalizationRegistry-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Finalization<wbr>Registry</span></a></li>
   <li><a href="variables/Float32Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Float32<wbr>Array</span></a></li>
   <li><a href="variables/Float64Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Float64<wbr>Array</span></a></li>
   <li><a href="variables/Infinity.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Infinity</span></a></li>
   <li><a href="variables/Int16Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Int16<wbr>Array</span></a></li>
   <li><a href="variables/Int32Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Int32<wbr>Array</span></a></li>
   <li><a href="variables/Int8Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Int8<wbr>Array</span></a></li>
   <li><a href="variables/JSON-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>JSON</span></a></li>
   <li><a href="variables/Map-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Map</span></a></li>
   <li><a href="variables/Math-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Math</span></a></li>
   <li><a href="variables/NaN.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>NaN</span></a></li>
   <li><a href="variables/Promise-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Promise</span></a></li>
   <li><a href="variables/Proxy.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Proxy</span></a></li>
   <li><a href="variables/Set-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Set</span></a></li>
   <li><a href="variables/SharedArrayBuffer-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Shared<wbr>Array<wbr>Buffer</span></a></li>
   <li><a href="variables/Uint16Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Uint16<wbr>Array</span></a></li>
   <li><a href="variables/Uint32Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Uint32<wbr>Array</span></a></li>
   <li><a href="variables/Uint8Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Uint8<wbr>Array</span></a></li>
   <li><a href="variables/Uint8ClampedArray-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Uint8<wbr>Clamped<wbr>Array</span></a></li>
   <li><a href="variables/WeakMap-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Weak<wbr>Map</span></a></li>
   <li><a href="variables/WeakRef-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Weak<wbr>Ref</span></a></li>
   <li><a href="variables/WeakSet-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-32-path"></use><use href="#icon-32-text"></use></svg><span>Weak<wbr>Set</span></a></li>
   <li><a href="functions/AggregateError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Aggregate<wbr>Error</span></a></li>
   <li><a href="functions/Array-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Array</span></a></li>
   <li><a href="functions/BigInt-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Big<wbr>Int</span></a></li>
   <li><a href="functions/Boolean-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Boolean</span></a></li>
   <li><a href="functions/Date-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Date</span></a></li>
   <li><a href="functions/Error-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Error</span></a></li>
   <li><a href="functions/EvalError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Eval<wbr>Error</span></a></li>
   <li><a href="functions/Function-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Function</span></a></li>
   <li><a href="functions/Number-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Number</span></a></li>
   <li><a href="functions/Object-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Object</span></a></li>
   <li><a href="functions/RangeError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Range<wbr>Error</span></a></li>
   <li><a href="functions/ReferenceError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Reference<wbr>Error</span></a></li>
   <li><a href="functions/RegExp-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Reg<wbr>Exp</span></a></li>
   <li><a href="functions/String-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>String</span></a></li>
   <li><a href="functions/Symbol-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Symbol</span></a></li>
   <li><a href="functions/SyntaxError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Syntax<wbr>Error</span></a></li>
   <li><a href="functions/TypeError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>Type<wbr>Error</span></a></li>
   <li><a href="functions/URIError-1.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>URIError</span></a></li>
   <li><a href="functions/decodeURI.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>decodeURI</span></a></li>
   <li><a href="functions/decodeURIComponent.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>decodeURIComponent</span></a></li>
   <li><a href="functions/encodeURI.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>encodeURI</span></a></li>
   <li><a href="functions/encodeURIComponent.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>encodeURIComponent</span></a></li>
   <li><a href="functions/escape.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>escape</span></a></li>
   <li><a href="functions/eval.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>eval</span></a></li>
   <li><a href="functions/isFinite.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>is<wbr>Finite</span></a></li>
   <li><a href="functions/isNaN.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>is<wbr>NaN</span></a></li>
   <li><a href="functions/parseFloat.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>parse<wbr>Float</span></a></li>
   <li><a href="functions/parseInt.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>parse<wbr>Int</span></a></li>
   <li><a href="functions/unescape.html"><svg class="tsd-kind-icon" width="24" height="24" viewBox="0 0 24 24"><use href="#icon-64-path"></use><use href="#icon-64-text"></use></svg><span>unescape</span></a></li></ul>