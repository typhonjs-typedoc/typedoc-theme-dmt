export class PathMap
{
   #depthMax;

   #rootMap = new MapNode();

   constructor(depthMax)
   {
      this.#depthMax = depthMax;
   }

   /**
    * @param {import('typedoc').NavigationElement} node -
    */
   add(node)
   {
      const pathSegments = node.text.split('/');

      this.#addToMap(this.#rootMap, pathSegments, node, 0);
   }

   #addToMap(currentMap, pathSegments, node, currentDepth)
   {
      if (pathSegments.length === 0)
      {
         node.text = '';
         currentMap.node = node;

         return;
      }

      const currentSegment = pathSegments.shift();

      if (!currentMap.map.get(currentSegment))
      {
         currentMap.map.set(currentSegment, new MapNode());
      }

      this.#addToMap(currentMap.map.get(currentSegment), pathSegments, node, currentDepth + 1);
   }

   /**
    * Constructs the output tree from the MapNode structure, considering depthMax.
    *
    * @returns {import('typedoc').NavigationElement[]} - The root of the reconstituted tree structure.
    */
   buildTree()
   {
      return this.#buildTree(this.#rootMap, 0, void 0).children;
   }

   #buildTree(currentMapNode, currentDepth, pathPrefix, depthMaxParent = undefined)
   {
      if (!currentMapNode) { return; }

      let node;

      if (currentMapNode.node)
      {
         // Create a new node with a potentially updated text field.
         node = currentMapNode.node;
         if (pathPrefix)
         {
            // node.text = `${pathPrefix}/${node.text}`;
            node.text = pathPrefix;
         }
      }
      else
      {
         node = { text: pathPrefix, children: [] };
      }

      if (!depthMaxParent && currentDepth === this.#depthMax)
      {
         // Save the current node as the depthMaxParent for siblings.
         depthMaxParent = node;
      }

      // If at or beyond max depth, concatenate remaining path segments.
      if (currentDepth >= this.#depthMax)
      {
         for (const [key, mapNode] of currentMapNode.map.entries())
         {
            const newPrefix = pathPrefix ? `${pathPrefix}/${key}` : key;
            const childNode = this.#buildTree(mapNode, currentDepth + 1, newPrefix, depthMaxParent);
            if (childNode)
            {
               if (depthMaxParent)
               {
                  // Add childNode as a sibling to the depthMaxParent.
                  depthMaxParent.children.unshift(childNode);
               }
               else
               {
                  node.children.unshift(childNode);
               }
            }
         }
      }
      else
      {
         for (const [key, mapNode] of currentMapNode.map.entries())
         {
            const childNode = this.#buildTree(mapNode, currentDepth + 1, key, depthMaxParent);
            if (childNode)
            {
               if (!Array.isArray(node.children)) { node.children = []; }

               node.children.unshift(childNode);
            }
         }
      }

      return node;
   }

   /**
    * @returns {MapNode}
    */
   get root()
   {
      return this.#rootMap;
   }
}

class MapNode
{
   map = new Map();

   node = void 0;

   /**
    * Converts the MapNode structure to a nested object for easy logging.
    *
    * @returns {object}
    */
   toObject()
   {
      const obj = {};

      for (const [key, value] of this.map.entries())
      {
         obj[key] = value instanceof MapNode ? value.toObject() : value;
      }

      if (this.node !== void 0)
      {
         obj.___node = {
            text: this.node.text,
            childrenLength: this.node?.children?.length
         };
      }
      return obj;
   }
}
