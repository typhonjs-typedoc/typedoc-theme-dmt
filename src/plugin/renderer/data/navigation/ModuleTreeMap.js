/**
 * Parses the default theme navigation index module reflections creating a tree structure with an optional max depth
 * before concatenating paths. A `depthMax` of 0 results in the same output as the default theme / full paths per
 * module.
 */
export class ModuleTreeMap
{
   /**
    * The maximum depth before concatenating node paths.
    *
    * @type {number}
    */
   #depthMax = Number.MAX_SAFE_INTEGER;

   /**
    * @type {MapNode}
    */
   #root = new MapNode();

   /**
    * @param {number}   depthMax - Max depth before path concatenation.
    */
   constructor(depthMax)
   {
      this.#depthMax = depthMax;
   }

   /**
    * Adds a NavigationElement to the tree recursively adding intermediary nodes by splitting on `/`.
    *
    * @param {import('typedoc').NavigationElement} node - NavigationElement to add.
    */
   add(node)
   {
      const pathSegments = node.text.split('/');

      this.#addToMap(this.#root, pathSegments, node, 0);
   }

   /**
    * Recursively adds intermediary MapNode instances for all path segments setting to `node` field for leafs.
    *
    * @param {MapNode}  currentMap - Current map node.
    *
    * @param {string[]} pathSegments - All path segments parsed from original module node `text`.
    *
    * @param {import('typedoc').NavigationElement} node - Node to add.
    *
    * @param {number}   currentDepth - Current depth.
    */
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
    * Constructs the output tree from the MapNode structure considering `depthMax`.
    *
    * @returns {import('typedoc').NavigationElement[]} - The root of the reconstituted tree structure.
    */
   buildTree()
   {
      return this.#buildTree(this.#root, 0, void 0).children;
   }

   /**
    * Handles recursively building the output module tree.
    *
    * @param {MapNode}  currentMapNode - Node being processed.
    *
    * @param {number}   currentDepth - Current depth.
    *
    * @param {string}   pathPrefix - Path concatenation after `depthMax` exceeded.
    *
    * @param {import('typedoc').NavigationElement}  depthMaxParent - The target parent NavigationElement to append leaf
    *        nodes to after `depthMax` exceeded.
    *
    * @returns {import('typedoc').NavigationElement | undefined} A fabricated intermediary NavigationElement or a leaf
    *          node.
    */
   #buildTree(currentMapNode, currentDepth, pathPrefix, depthMaxParent = void 0)
   {
      if (!currentMapNode) { return; }

      let node;

      // Create a node if currentMapNode has a node or if depth is not beyond depthMax.
      if (currentMapNode.node || currentDepth <= this.#depthMax)
      {
         node = currentMapNode.node ? currentMapNode.node : { text: pathPrefix, children: [] };
         node.text = pathPrefix;
      }

      // Set `depthMaxParent` at the `depthMax` level. All subsequent leaf nodes will be added to this parent node.
      if (currentDepth === this.#depthMax)
      {
         depthMaxParent = node;
      }

      for (const [key, mapNode] of currentMapNode.map.entries())
      {
         let childNode;
         if (currentDepth <= this.#depthMax)
         {
            childNode = this.#buildTree(mapNode, currentDepth + 1, key, depthMaxParent);
         }
         else
         {
            // Concatenate paths after `depthMax` is exceeded.
            const newPrefix = pathPrefix ? `${pathPrefix}/${key}` : key;
            childNode = this.#buildTree(mapNode, currentDepth + 1, newPrefix, depthMaxParent);
         }

         if (childNode)
         {
            if (currentDepth >= this.#depthMax && depthMaxParent)
            {
               // After max depth is reached only add leaf nodes that define a reflection `kind`.
               if (childNode.kind)
               {
                  // Ensure `depthMaxParent` has a `children` array.
                  if (!Array.isArray(depthMaxParent.children)) { depthMaxParent.children = []; }

                  depthMaxParent.children.unshift(childNode);
               }
            }
            else if (node)
            {
               // Ensure `node` has a `children` array.
               if (!Array.isArray(node.children)) { node.children = []; }

               node.children.unshift(childNode);
            }
         }
      }

      return node;
   }
}

/**
 * Defines a tree node which may have a map of children MapNodes and / or an associated NavigationElement.
 */
class MapNode
{
   /** @type {Map<string, MapNode>} */
   map = new Map();

   /** @type {import('typedoc').NavigationElement} | undefined} */
   node = void 0;
}
