import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const hex = (num: number) => num.toString(16).toUpperCase().padStart(2, '0');
const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

// TODO: move these to util
const bin = (num: number) => num.toString(2).toUpperCase().padStart(8, '0');

function setBit (value: number, bitIndex: number, bitValue: boolean) {
  if (bitIndex < 0 || bitIndex > 7) {
    throw new RangeError('setBit only works for single byte (8-bit) values');
  }

  if (bitValue) {
    return value | (1 << bitIndex);
  }
  else {
    return value & ~(1 << bitIndex);
  }
};

/*
 * Test of PCA9685 pwm driver IC
*/

enum REGISTER {
  MODE1 = 0x00,
  MODE2 = 0x01,
  SUBADR1 = 0x02,
  SUBADR2 = 0x03,
  SUBADR3 = 0x04,
  ALLCALL = 0x05
}

log.info('Connecting to device...');
const device = new BaseDevice(0x40);

let mode1 = device.readByte(REGISTER.MODE1);
let mode2 = device.readByte(REGISTER.MODE2);
log.info(`Initial mode setup: (MODE1) ${bin(mode1)} (MODE2) ${bin(mode2)}`);

// Set OUTDRV to open drain (0)
mode2 = setBit(mode2, 2, false);

// Set INVRT to inverted (1)
mode2 = setBit(mode2, 4, true);

// Set OUTNE mode to conditional (high-z for open-drain outputs)
mode2 = setBit(mode2, 0, true);

// Turn sleep mode OFF
mode1 = setBit(mode1, 4, false);

// Send changes to device
device.writeByte(REGISTER.MODE2, mode2);
device.writeByte(REGISTER.MODE1, mode1);

mode1 = device.readByte(REGISTER.MODE1);
mode2 = device.readByte(REGISTER.MODE2);
log.info(`mode setup: (MODE1) ${bin(mode1)} (MODE2) ${bin(mode2)}`);

// Turn all LEDs off 
device.writeByte(0xfd, 0b10000);

// LED0 ON
device.writeByte(0x6, 1); // LSB
device.writeByte(0x7, 0); // MSB

// LED0 OFF
device.writeByte(0x8, 20); // LSB
device.writeByte(0x9, 0); // MSB

// Read status
device.readByte(0x6);
device.readByte(0x7);
device.readByte(0x8);
device.readByte(0x9);

device.readByte(0xa);
device.readByte(0xb);
device.readByte(0xc);
device.readByte(0xd);

