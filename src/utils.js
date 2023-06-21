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

/**
 * Serializes value to a string escaping it so that it can be set as a web component attribute.
 *
 * @param {*}  value - Value to stringify and escape.
 *
 * @returns {string} Escaped string.
 */
export function escapeAttr(value)
{
   return JSON.stringify(value)
   .replace(/</g, "\\u003c")
   .replace(/>/g, "\\u003e")
   .replace(/&/g, "\\u0026")
   .replace(/'/g, "\\u0027")
   .replace(/"/g, "\\u0022");
}

/**
 * Deserializes an escaped string and parses it as JSON.
 *
 * @param {string}   value - Value to unescape.
 *
 * @returns {*} Deserialized variable.
 */
export function unescapeAttr(value)
{
   return JSON.parse(value
   .replace(/\\u003c/g, "<")
   .replace(/\\u003e/g, ">")
   .replace(/\\u0026/g, "&")
   .replace(/\\u0027/g, "'")
   .replace(/\\u0022/g, '"'));
}