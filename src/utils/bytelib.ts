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
export function bytesToInt(bytes: number[], signed = false) : number {
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

/** Convert an (unsigned) integer into an array of bytes
 * @param value number of convert
 * @param byteCount number of bytes in result array (up to 4)
 */
export function intToBytes(value: number, byteCount = 1) : number[] {
  if (byteCount < 1 || byteCount > 4) {
    throw new RangeError('intToBytes supports up to 4 bytes');
  }

  if (value < 0) {
    throw new RangeError('intToBytes does not support negative (signed) numbers');
  }

  if (value >= (2 ** (byteCount * 8))) {
    throw new RangeError(`value '${value}' does not fit into ${byteCount} bytes`);
  }

  const result = new Array(byteCount).fill(0);

  for (let i = 1; i <= byteCount; i++){
    result[i - 1] = (value >> ((byteCount - i) * 8)) & 0xff;
  }

  return result;
}

/**
 * Helper method to chunk long data payloads into manageable chunks
 * @param arr Full payload
 * @param chunkSize Maximum chunk size
 * @returns Resulting payload array
 */
export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  // Shortcut for truncate decimals
  const chunkCount = (((arr.length - 1) / chunkSize) | 0) + 1;
  const lastChunk = chunkCount - 1;
  const result = new Array(chunkCount);

  for (let i = 0; i < lastChunk; i++) {
    result[i] = arr.slice((i * chunkSize), (i + 1) * chunkSize);
  }
  result[lastChunk] = arr.slice((lastChunk * chunkSize), arr.length);

  return result;
}