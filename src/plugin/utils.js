import fs   from 'node:fs';
import path from 'node:path';

/**
 * Copies a directory w/ `node:fs`.
 *
 * @param {string}   source - Source path.
 *
 * @param {string}   destination - Destination path.
 */
export function copyDirectory(source, destination)
{
   fs.mkdirSync(destination, { recursive: true });

   fs.readdirSync(source, { withFileTypes: true }).forEach((entry) =>
   {
      const sourcePath = path.join(source, entry.name);
      const destinationPath = path.join(destination, entry.name);

      entry.isDirectory() ? copyDirectory(sourcePath, destinationPath) : fs.copyFileSync(sourcePath, destinationPath);
   });
}
