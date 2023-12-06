import { ReflectionKind } from 'typedoc';

export class NavigationIndex
{
   static transform(index, options)
   {
      this.topLevelModule(index);
   }

   /**
    * @param {import('typedoc').NavigationElement[]}  index - Navigation index.
    */
   static topLevelModule(index)
   {
      /** @type {Map<string, { subPath: string, node: import('typedoc').NavigationElement }[]>} */
      const pathMap = new Map();

      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];

         if (node.kind === ReflectionKind.Module)
         {
            const firstSlashIndex = node.text.indexOf('/');

            let rootPath = node.text;
            let subPath;

            if (firstSlashIndex >= 0)
            {
               rootPath = node.text.substring(0, firstSlashIndex);
               subPath = node.text.substring(firstSlashIndex + 1);
            }

            if (!pathMap.has(rootPath)) { pathMap.set(rootPath, []); }

            const pathArray = pathMap.get(rootPath);

            pathArray.push({
               subPath,
               node
            });

            index.splice(i, 1);
         }
      }

      for (const rootPath of pathMap.keys())
      {
         const entries = pathMap.get(rootPath);

         let targetNode = {
            text: rootPath,
            children: []
         };

         const indexNoSubPath = entries.findIndex((entry) => entry.subPath === void 0);
         if (indexNoSubPath >= 0)
         {
            targetNode = entries[indexNoSubPath].node;
            entries.splice(indexNoSubPath, 1);

            if (entries.length && !Array.isArray(targetNode.children)) { targetNode.children = []; }
         }

         const rootPathRegex = new RegExp(`^${rootPath}`);

         for (const entry of entries)
         {
            const node = entry.node;

            if (entry.subPath) { node.text = node.text.replace(rootPathRegex, ''); }

            targetNode.children.unshift(node);
         }

         index.unshift(targetNode);
      }
   }
}
