import { Worker } from 'node:worker_threads';
import { hrtime } from 'node:process';
import gpio from 'array-gpio';
import { getLogger } from 'bark-logger';

// Todo:
//   * Threading?
//   * Timing (refactor into util?)
//   * Colors for output
//   * Function param annotations
//   * try 400kHz
//   * Check for sudo when i2c is used
//   * Add chunking (break with 18-byte array)
//   * Refactor console.log squelch 
//   * Mock device?

class BaseDevice {
  private MAX_LEN = 15;
  private log = getLogger('base-device');
  private nsTime = BigInt(0);
  private nsCount = BigInt(0);
  private nsTotal = BigInt(0);
  protected i2c: any;

  /**
   * Sup?
   * 
   * @param i2cAddress - Address of the attached device
   */
  constructor(i2cAddress?: number) {
    if (i2cAddress) {
      this.log.debug(`Connecting to i2c device at ${this.hex(i2cAddress)}...`);
      this.i2c = gpio.startI2C();
      this.i2c.selectSlave(i2cAddress);

      const tmp = console.log;
      console.log = () => { };
      this.i2c.setTransferSpeed(100000);
      console.log = tmp;
    }
  }

  protected hex(input: number | number[], size = 2) {
    return (Array.isArray(input) ? input : [input])
      .map(x => `0x${x.toString(16).toUpperCase().padStart(size, '0')}`)
      .join(' ');
  }

  protected timeParts(ticks: bigint) {
    const k = BigInt(1000);
    const units = ['ns', 'us', 'ms', 's'];
    const parts = [];

    for (let unit of units) {
      if (ticks > 0) {
        parts.unshift((ticks % k) + unit);
        ticks = (ticks - (ticks % k)) / k;
      }
    }

    return parts;
  }

  protected startTimer() {
    this.nsTime = hrtime.bigint();
  }

  protected endTimer() {
    let ticks = hrtime.bigint() - this.nsTime;
    this.nsCount++;
    this.nsTotal += ticks;
    const time = this.timeParts(ticks)[0];
    const avg = this.timeParts(this.nsTotal / this.nsCount)[0];

    this.log.trace(''
      + this.style('  Operation completed in ', 90)
      + this.style(time, 1, 90)
      + this.style(` (avg: ${avg})`, 90)
    );
  }

  protected style(str: string, ...codes: number[]) {
    return `\x1b[${codes.join(';')}m${str}\x1b[0m`;
  }

  protected chunkArray<T>(arr: T[], chunkSize: number) : T[][] {
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

  writeByte(register: number, byte: number) {
    this.writeBlock(register, [byte]);
  }

  writeBlock(register: number, data: number[]) {
    this.startTimer();
    const chunks = this.chunkArray(data, 15);

    if (chunks.length > 1) {
      this.log.trace(`Message size: ${data.length} bytes. Sending in ${chunks.length} chunks...`);
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const offset = i * this.MAX_LEN + register;
      const data = [offset, ...chunk];
      const buf = Buffer.from(data);

      this.log.trace(`${this.style('WRITE', 33)} (${this.hex(offset)}): ${this.hex(chunk)}`);
      this.i2c.write(buf, buf.length);
    }
    this.endTimer();
  }
}

export default BaseDevice;