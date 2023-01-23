import { hrtime } from 'node:process';
import gpio from 'array-gpio';
import { getLogger } from 'bark-logger';

// Todo:
//   * Threading?
//   * Timing (refactor into util?)
//   * Colors for output
//   * Function param annotations
//   * try 400kHz

class BaseDevice {
  private log = getLogger('base-device');
  private nsTime = BigInt(0);
  protected i2c: any;

  constructor(i2cAddress?: number) {
    if (i2cAddress) {
      this.log.debug(`Connecting to i2c device at ${this.hex(i2cAddress)}...`);
      this.i2c = gpio.startI2C();
      this.i2c.selectSlave(i2cAddress);
      this.i2c.setTransferSpeed(100000);
    }
  }

  protected hex(input: number | number[], size = 2) {
    return (Array.isArray(input) ? input : [input])
      .map(x => `0x${x.toString(16).toUpperCase().padStart(size, '0')}`)
      .join(' ');
  }

  protected startTimer() {
    this.nsTime = hrtime.bigint();
  }

  protected endTimer() {
    let ticks = hrtime.bigint() - this.nsTime;
    const k = BigInt(1000);
    const units = ['ns', 'us', 'ms', 's'];
    const time = [];

    for (let unit of units) {
      if (ticks > 0) {
        time.unshift((ticks % k) + unit);
        ticks = (ticks - (ticks % k)) / k;
      }
    }

    this.log.trace(`  Operation completed in ${time[0]}`);
  }

  writeByte(register: number, byte: number) {
    this.writeBlock(register, [byte]);
  }

  writeBlock(register: number, data: number[]) {
    this.startTimer();
    const buf = Buffer.from([register, ...data]);
    this.log.trace(`WRITE (${this.hex(register)}): ${this.hex(data)}`);
    this.i2c.write(buf, buf.length);
    this.endTimer();
  }
}

export default BaseDevice;