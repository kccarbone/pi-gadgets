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

const OFF: RGB = [0, 0, 0];

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

    single(ind, colors1[ind % colors1.length]);
    await sleep(200);
    ind++;
  }
})();


async function init() {
  device.initNeopixels(PinMapping.ATtinyXY6.PA2, stringLength);
  await sleep(10);
}

// TODO: fix chunked update
async function clear() {
  log.fatal('CLEARING...');

  all([10, 0, 0]);
  await sleep(500);
  all(OFF);
}


function single(index: number, color: RGB) {
  log.debug(`previous: ${previous.index}`);
  if (previous.index >= 0) {
    device.setPixel(OFF, previous.index);
    device.showNeopixels();
  }

  device.setPixel(color, index);
  device.showNeopixels();
  previous.index = index;
}

function all(color: RGB) {
  for (let i = 0; i < stringLength; i++) {
    device.setPixel(color, i);
  }
  device.showNeopixels();
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
    device.setPixel(OFF, previous.index);
    device.showNeopixels();
  }
  await sleep(100);
  await clear();
  await sleep(100);
  exit(0);
});