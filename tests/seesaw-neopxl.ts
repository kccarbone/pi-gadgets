import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { Device, Pixel, PinMapping } from '../src/drivers/seesaw';
import { sleep } from '../src/utils/timing';
import { RGB, RGBW } from '../src/utils/color';
import { colorTest, demoReel } from './frames';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.INFO;

// Pixel setup
const stringLength = 16;
const ledChannels = 4;
const frameDelay = 150;

// Sample colors
const OFF: RGB = [0, 0, 0];
const RED: RGB = [60, 0, 0];
const GRN: RGB = [0, 30, 0];
const BLU: RGB = [0, 0, 50];
const YEL: RGB = [50, 20, 0];
const MAG: RGB = [60, 0, 20];
const WHT: RGB = [50, 40, 50];

// State
let exited = false;
const previous = { index: -1 };

log.info('Running test...');
const device = new Device(0x49);

// Test loop
(async () => {
  await init();

  //await gridDemo();
  await rgbwTest();

  await sleep(1200);
  await clear();
})();

// Neopixel functions
async function init() {
  device.initNeopixels(PinMapping.ATtinyXY6.PA6, stringLength, ledChannels);
  await sleep(10);
}

function applyColor(color: RGB, pixelIndex: number) {
  // GRB order
  const px = Pixel.fromGRB(color);
  device.setPixel(px, pixelIndex);
}

async function clear() {
  device.clearPixelBuffer();
  await sleep(10);
  device.showNeopixels();
  await sleep(50);
}

function showFrame(frame: RGB[]) {
  device.clearPixelBuffer();
  for (let i = 0; i < frame.length; i++) {
    applyColor(frame[i], i);
  }
  device.showNeopixels();
}

function single(index: number, color: RGB) {
  log.debug(`previous: ${previous.index}`);
  if (previous.index >= 0) {
    applyColor(OFF, previous.index);
    device.showNeopixels();
  }

  applyColor(color, index);
  device.showNeopixels();
  previous.index = index;
}

function all(color: RGB) {
  for (let i = 0; i < stringLength; i++) {
    applyColor(color, i);
  }
  device.showNeopixels();
}

async function gridDemo() {
  let ind = 0;
  while (!exited) {
    if (ind >= demoReel.length) {
      ind = 0;
    }

    log.info(`frame ${ind}`);
    showFrame(demoReel[ind]);
    await sleep(frameDelay);
    ind++;
  }
}

async function rgbwTest() {
  device.setPixel(Pixel.fromGRBW([0, 0, 0, 10]), 2);
  device.showNeopixels();
}

process.on('SIGINT', async () => {
  exited = true;
  await sleep(100);
  await clear();
  exit(0);
});