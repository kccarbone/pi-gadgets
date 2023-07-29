/* Some basic test formatting functions */

/** Apply "format codes" using ANSI escape sequences for compatible console output 
 * @param text Raw text
 * @param codes Formatting codes to apply
*/
export function style(text: string, ...codes: number[]) {
  return `\x1b[${codes.join(';')}m${text}\x1b[0m`;
}

/** Format byte(s) with 0xHH notation
 * @param input Byte or array of bytes
*/
export function hex(input: number | number[]) {
  return (Array.isArray(input) ? input : [input])
    .map(x => `0x${x.toString(16).toUpperCase().padStart(2, '0')}`)
    .join(' ');
}