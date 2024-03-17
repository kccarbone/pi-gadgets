import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';
import { sleep } from '../src/utils/timing';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;
let exited = false;

const twoByte = (val: number) => [val >> 8, val & 0xff];

const MODULE_NEOPIXEL = 0x0e;
const FUNCTION_PIN = 0x01;
const FUNCTION_SPEED = 0x02;
const FUNCTION_LENGTH = 0x03;
const FUNCTION_DATA = 0x04;
const FUNCTION_SHOW = 0x05;

const PIN_OUTPUT = 16;

// Testing different transmission speeds...
const tx_speed = 50; // kHz


log.info('Connecting to device...');
const device = new BaseDevice(0x49, tx_speed);
//init();

const stringLength = 2;
const previous = { index: -1 };

// 1 pixel x 3 channels (RGB) + 2 for the "start index"
const buffer = Buffer.alloc(5, 0);

// First two bytes define the start index for pixels (MSB?)
//buffer[0] = 0;
//buffer[1] = 0;

//buffer[2] = 50; // Pixel 1 Red
//buffer[6] = 100; // Pixel 2 Green

//const out = device.readModuleBlock(0, 2, 4);
//const out = device.readModuleBlock(0, 1, 1);
//log.info(`output: ${JSON.stringify(out)}`);

const colors1 = [
  [10, 10, 10]
];

const colors2 = [
  [30, 20, 10],
  [30, 0, 0],
  [30, 15, 0],
  [0, 15, 0],
  [0, 20, 10],
  [0, 0, 20],
  [30, 0, 7],
  [10, 0, 15]
];

(async () => {
  await reset();
  await init();

  let ind = 0;
  while (!exited) {
    if (ind >= stringLength) {
      ind = 0;
    }
    const color = colors1[ind % colors1.length];
    single(ind, color[0], color[1], color[2]);
    await sleep(200);
    ind++;
  }

})();


async function init() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_PIN, PIN_OUTPUT]);
  await sleep(10);
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_LENGTH, ...twoByte(stringLength * 3)]);
}

function setStart(index: number) {
  const addr = twoByte(index * 3);
  buffer[0] = addr[0];
  buffer[1] = addr[1];
}

function setColor(red: number, green: number, blue: number, offset = 0) {
  buffer[(offset * 3) + 2] = red;
  buffer[(offset * 3) + 3] = green;
  buffer[(offset * 3) + 4] = blue;
}

function update() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_DATA, ...buffer]);
}

function show() {
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_SHOW]);
}

// TODO: fix chunked update
function clear() {
  const allEmpty = Buffer.alloc((stringLength * 3) + 2, 0);
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_DATA, ...allEmpty]);
  device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_SHOW]);
}


function single(index: number, red: number, green: number, blue: number) {
  log.debug(`previous: ${previous.index}`);
  if (previous.index >= 0) {
    setStart(previous.index);
    setColor(0, 0, 0);
    update();
  }

  setStart(index);
  setColor(red, green, blue);
  update();
  show();
  previous.index = index;
}

async function reset() {
  // Software reset!
  device.writeByte(0, 0x7f);
  await sleep(100);
}

process.on('SIGINT', async () => {
  exited = true;
  await sleep(100);
  if (previous.index >= 0) {
    setStart(previous.index);
    setColor(0, 0, 0);
    update();
    show();
  }
  await sleep(100);
  exit(0);
});