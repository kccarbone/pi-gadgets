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

/** Convert an array of bytes to a signed integer
 * @param bytes array of bytes in MSB order
 * @param signed parse as signed number
 */
export function bytesToInt(bytes: number[], signed = false) {
  let arr = [...bytes];

  if (arr.length < 1 || arr.length > 4) {
    throw new RangeError('bytesToInt supports up to 4 bytes');
  }

  // Check if MSb is 1 for negative number
  if (signed && (arr[0] & 0x80)) {
    // Pad with ones to make a 4-byte array
    arr = [0xff, 0xff, 0xff, 0xff].slice(4 - arr.length).concat(arr);
  }

  // Assemble as hex string
  const fullHex = arr.reduce((a, c) => (a += c.toString(16)), '0x');

  // Evaluate as signed binary
  return parseInt(fullHex) | 0;
}