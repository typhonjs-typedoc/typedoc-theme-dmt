export class PathMap
{
   /**
    * @type {PathMap}
    */
   #child;

   /**
    * Depth of path map.
    *
    * @type {number}
    */
   #depth;

   /**
    * @type {PathMapData}
    */
   #map = new Map();

   /**
    * @returns {PathMapData}
    */
   get map() { return this.#map; }

   /**
    * @param {import('typedoc').NavigationElement} node -
    */
   add(node)
   {
      const firstSlashIndex = node.text.indexOf('/');

      let rootPath = node.text;
      let subPath;

      if (firstSlashIndex >= 0)
      {
         rootPath = node.text.substring(0, firstSlashIndex);
         subPath = node.text.substring(firstSlashIndex + 1);
      }

      if (!this.#map.has(rootPath)) { this.#map.set(rootPath, []); }

      const pathArray = this.#map.get(rootPath);

      pathArray.push({
         subPath,
         node
      });
   }

   *process()
   {
      for (const rootPath of this.#map.keys())
      {
         const entries = this.#map.get(rootPath);

         let targetNode = {
            text: rootPath,
            children: []
         };

         const indexNoSubPath = entries.findIndex((entry) => entry.subPath === void 0);
         if (indexNoSubPath >= 0)
         {
            targetNode = entries[indexNoSubPath].node;
            entries.splice(indexNoSubPath, 1);

            if (entries.length && !Array.isArray(targetNode.children))
            { targetNode.children = []; }
         }

         const rootPathRegex = new RegExp(`^${rootPath}`);

         for (const entry of entries)
         {
            const node = entry.node;

            if (entry.subPath) { node.text = node.text.replace(rootPathRegex, ''); }

            targetNode.children.unshift(node);
         }

         yield targetNode;
      }
   }
}

/**
 * @typedef {{ subPath: string, node: import('typedoc').NavigationElement }} PathMapNode
 */

/**
 * @typedef {Map<string, PathMapNode[]>} PathMapData
 */
