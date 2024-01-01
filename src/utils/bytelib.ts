/* Helpful functions for manipulating data streams */

/** Change a single bit in byte
 * @param value Original byte value
 * @param bitIndex Index of the bit to change (0-7)
 * @param bitValue New bit value (true=1, false=0)
 * @returns New byte value
 */
export function setBit (value: number, bitIndex: number, bitValue: boolean) {
  if (bitIndex < 0 || bitIndex > 7) {
    throw new RangeError('setBit only works for single byte (8-bit) values');
  }

  if (bitValue) {
    return value | (1 << bitIndex);
  }
  else {
    return value & ~(1 << bitIndex);
  }
}