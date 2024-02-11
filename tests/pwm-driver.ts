import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';
import { setBit } from '../src/utils/bytelib';
import { bin } from '../src/utils/formatting';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

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

// All LEDS

// ON BYTE
device.writeByte(0xfa, 0); // LSB
device.writeByte(0xfb, 0); // MSB

// OFF BYTE
device.writeByte(0xfc, 8); // LSB
device.writeByte(0xfd, 0); // MSB

// All OFF
//device.writeByte(0xfd, 0b10000);

// LED9 ON
device.writeByte(0x2a, 0); // LSB
device.writeByte(0x2b, 0); // MSB

// LED9 OFF
device.writeByte(0x2c, 8); // LSB
device.writeByte(0x2d, 0); // MSB

// Read status
device.readByte(0x2a);
device.readByte(0x2b);
device.readByte(0x2c);
device.readByte(0x2d);

device.readByte(0xa);
device.readByte(0xb);
device.readByte(0xc);
device.readByte(0xd);

