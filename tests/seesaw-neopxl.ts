import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';
import { sleep } from '../src/utils/timing';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

const MODULE_NEOPIXEL = 0x0e;
const FUNCTION_PIN = 0x01;
const FUNCTION_SPEED = 0x02;
const FUNCTION_LENGTH = 0x03;
const FUNCTION_DATA = 0x04;
const FUNCTION_SHOW = 0x05;

const PIN_OUTPUT = 15;

// Testing different transmission speeds...
const tx_speed = 50; // kHz


log.info('Connecting to device...');
const device = new BaseDevice(0x60, tx_speed);
//init();

// 9 pixels x 3 channels (RGB)
const buffer = Buffer.alloc(8, 0);

// First two bytes define the start index for pixels (MSB?)

//buffer[0] = 0;
//buffer[1] = 0;

buffer[2] = 50; // Pixel 1 Red
buffer[6] = 100; // Pixel 2 Green

//const out = device.readModuleBlock(0, 2, 4);
//const out = device.readModuleBlock(0, 1, 1);
//log.info(`output: ${JSON.stringify(out)}`);

(async () => {
  await reset();

  await init();
  update();
  show();

})();


async function init() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_PIN, PIN_OUTPUT]);
  await sleep(10);
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_LENGTH, 0, 6]); 
}

function update() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_DATA, ...buffer]);
}

function show() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_SHOW]);
}

async function reset() {
  // Software reset!
  device.writeByte(0, 0x7f);
  await sleep(100);
}