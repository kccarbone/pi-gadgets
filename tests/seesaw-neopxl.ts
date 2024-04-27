import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { Device, PinMapping } from '../src/drivers/seesaw';
import { sleep } from '../src/utils/timing';
import { RGB, Pixel } from '../src/utils/color';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.DEBUG;
let exited = false;

log.info('Connecting to device...');
const device = new Device(0x49);

const stringLength = 9;
const previous = { index: -1 };

const colors1: RGB[] = [
  [0, 20, 0]
];

const colors2: RGB[] = [
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
  device.setNeopixelPin(PinMapping.ATtinyXY6.PA2);
  await sleep(10);
  device.setNeopixelPixelCount(stringLength);
  await sleep(10);
}

// TODO: fix chunked update
function clear() {
  const allEmpty = new Array((stringLength * 3) + 2).fill(0);
  const bri = 0;
  allEmpty[4] = bri;
  allEmpty[7] = bri;
  allEmpty[10] = bri;
  allEmpty[13] = bri;
  allEmpty[16] = bri;
  allEmpty[19] = bri;
  allEmpty[22] = bri;
  allEmpty[25] = bri;
  allEmpty[28] = bri;
  config.threshold = Levels.TRACE;
  log.fatal('CLEARING...');
  //device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_DATA, ...allEmpty]);
  //device.writeBlock(MODULE_NEOPIXEL, [FUNCTION_SHOW]);
}


function single(index: number, red: number, green: number, blue: number) {
  log.debug(`previous: ${previous.index}`);
  if (previous.index >= 0) {
    device.setNeopixelStartIndex(previous.index);
    device.setPixel([0, 0, 0]);
    device.showNeopixels();
  }

  device.setNeopixelStartIndex(index);
  device.setPixel([red, green, blue]);
  device.showNeopixels();
  previous.index = index;
}

async function reset() {
  // Software reset!
  //device.writeByte(0, 0x7f);
  await sleep(100);
}

process.on('SIGINT', async () => {
  exited = true;
  await sleep(250);
  if (previous.index >= 0) {
    device.setNeopixelStartIndex(previous.index);
    device.setPixel([0, 0, 0]);
    device.showNeopixels();
  }
  await sleep(100);
  clear();
  await sleep(100);
  exit(0);
});