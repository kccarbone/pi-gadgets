import { Worker } from 'node:worker_threads';
import { hrtime } from 'node:process';
import { getLogger } from 'bark-logger';
import { style, hex } from './utils/formatting';
import i2cbus from 'i2c-bus';

// Todo:
//   * Threading?
//   * Timing (refactor into util?)
//   * Colors for output
//   * Mock device?
//   * Refactor write method to use Buffer
//   * Alternate i2c libraries

class BaseDevice {
  private MAX_LEN = 15;
  private log = getLogger('base-device');
  private nsTime = BigInt(0);
  private nsCount = BigInt(0);
  private nsTotal = BigInt(0);
  protected bus: i2cbus.I2CBus;
  protected devAddr: number;
  protected autoInc: boolean;

  /**
   * Foundational API for i2c devices
   * 
   * @param i2cAddress Address of the attached device
   * @param speed Bus speed in kHz
   * @param autoIncrement Automatically increment address for large writes
   */
  constructor(i2cAddress: number, speed = 400, autoIncrement = true) {
    this.log.debug(`Connecting to i2c device at ${hex(i2cAddress)}...`);
    this.autoInc = autoIncrement;
    this.devAddr = i2cAddress;
    this.bus = i2cbus.openSync(1);
  }

  /**
   * Abstraction for i2c library
   * @param buf Data to read 
   */
  protected readBuffer(buf: Buffer) {
    this.bus.i2cReadSync(this.devAddr, buf.length, buf);
  }

  /**
   * Abstraction for i2c library
   * @param buf Data to write 
   */
  protected writeBuffer(buf: Buffer) {
    this.bus.i2cWriteSync(this.devAddr, buf.length, buf);
  }

  /**
   * Formatter for user-friendly time interval output
   * @param ticks Time interval, in ticks
   * @returns Array of time strings
   */
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

  /** Internal timer start */
  protected startTimer() {
    this.nsTime = hrtime.bigint();
  }

  /** Internal timer end */
  protected endTimer() {
    let ticks = hrtime.bigint() - this.nsTime;
    this.nsCount++;
    this.nsTotal += ticks;
    const time = this.timeParts(ticks)[0];
    const avg = this.timeParts(this.nsTotal / this.nsCount)[0];

    this.log.trace(''
      + style('  Operation completed in ', 90)
      + style(time, 1, 90)
      + style(` (avg: ${avg})`, 90)
    );
  }

  /**
   * Helper method to chunk long data payloads into manageable chunks
   * @param arr Full payload
   * @param chunkSize Maximum chunk size
   * @returns Resulting payload array
   */
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

  /**
   * Read a single byte from the device
   * @param register Register to read
   * @param failOnError Throw error if the operation fails
   * @returns Register value
   */
  readByte(register: number, failOnError = false) {
    return this.readBlock(register, 1, failOnError)[0];
  }
  
  /**
   * Read a continuous block of data from the device
   * @param register Register to read
   * @param size Number of bytes to read
   * @param failOnError Throw error if the operation fails
   * @returns Data from device
   */
  readBlock(register: number, size: number, failOnError = false) {
    this.startTimer();
    const buf = Buffer.alloc(size);

    try {
      this.writeBuffer(Buffer.from([register]));
      this.readBuffer(buf);
      const result = [...buf];
      this.log.trace(`${style('READ', 32)} (${hex(register)}): ${hex(result)}`);
      this.endTimer();

      return result;
    }
    catch (err) {
      this.log.error(`Read failed (device:${hex(this.devAddr)}, register: ${hex(register)}): ${err}`);
      this.endTimer();

      if (failOnError)
        throw err;
      else
        return new Array(size).fill(0) as number[];
    }
  }

  /**
   * Write a single byte to the device
   * @param register Register to write
   * @param byte Value to write
   * @param failOnError Throw error if the operation fails
   */
  writeByte(register: number, byte: number, failOnError = false) {
    this.writeBlock(register, [byte], failOnError);
  }

  /**
   * Write a continuous block of data to the device
   * @param register Register to write to
   * @param data Data to write
   * @param failOnError Throw error if the operation fails
   */
  writeBlock(register: number, data: number[], failOnError = false) {
    this.startTimer();
    const chunks = this.chunkArray(data, this.MAX_LEN);

    if (chunks.length > 1) {
      this.log.trace(`Message size: ${data.length} bytes. Sending in ${chunks.length} chunks...`);
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const offset = i * this.MAX_LEN + register;
        const data = [(this.autoInc ? offset : register), ...chunk];
        const buf = Buffer.from(data);

        this.log.trace(`${style('WRITE', 33)} (${hex(data[0])}): ${hex(chunk)}`);
        this.writeBuffer(buf);
      }
      this.endTimer();
    }
    catch (err) {
      this.log.error(`Write failed (device:${hex(this.devAddr)}, register: ${hex(register)}): ${err}`);
      this.endTimer();

      if (failOnError)
        throw err;
    }
  }
}

export default BaseDevice;