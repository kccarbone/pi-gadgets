import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { Device, PinMapping } from '../src/drivers/seesaw';
import { sleep } from '../src/utils/timing';
import { RGB, Pixel } from '../src/utils/color';
import { colorTest, demoReel } from './frames';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.INFO;
let exited = false;

log.info('Connecting to device...');
const device = new Device(0x49);

const stringLength = 16;
const previous = { index: -1 };
const frameDelay = 150;

const OFF: RGB = [0, 0, 0];
const RED: RGB = [60, 0, 0];
const GRN: RGB = [0, 30, 0];
const BLU: RGB = [0, 0, 50];
const YEL: RGB = [50, 20, 0];
const MAG: RGB = [60, 0, 20];
const WHT: RGB = [50, 40, 50];


(async () => {
  await reset();
  await init();

  let ind = 0;
  while (!exited) {
    if (ind >= demoReel.length) {
      ind = 0;
    }

    showFrame(demoReel[ind]);
    await sleep(frameDelay);
    ind++;
  }
})();


async function init() {
  device.initNeopixels(PinMapping.ATtinyXY6.PB3, stringLength);
  await sleep(10);
}

async function clear() {
  log.fatal('CLEARING...');

  await sleep(250);
  all(OFF);
  await sleep(50);
}

function showFrame(frame: RGB[]) {
  device.clearPixelBuffer();
  for (let i = 0; i < frame.length; i++) {
    device.setPixel(frame[i], i);
  }
  device.showNeopixels();
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