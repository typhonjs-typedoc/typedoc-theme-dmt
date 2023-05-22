import { loadQuickSearchData } from "./loadQuickSearchData.mjs";

globalThis.document.addEventListener('DOMContentLoaded', async () =>
{
   await loadQuickSearchData();
})