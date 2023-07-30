/* Some basic time-related functions */

/** Simple sleep function
 * @param delay Delay time, in milliseconds
 */
export function sleep(delay: number) {
  return new Promise(r => setTimeout(r, delay));
}