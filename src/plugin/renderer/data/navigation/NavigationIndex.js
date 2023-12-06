import { ReflectionKind }  from 'typedoc';

import { PathMap }         from './PathMap.js';

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
      const pathMap = new PathMap(1);

      for (let i = index.length; --i >= 0;)
      {
         const node = index[i];

         if (node.kind === ReflectionKind.Module)
         {
            pathMap.add(node);
            index.splice(i, 1);
         }
      }

      for (const node of pathMap.process())
      {
         index.unshift(node);
      }
   }
}
