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