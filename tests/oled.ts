import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { SSD1306 } from '../src';

// Display dimensions
const DISPW = 128;
const DISPH = 32;

// Logging
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('oled');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

// Init
log.info('initializing...');
const chip = new SSD1306.Device(DISPW, DISPH); // Default address 0x3c
chip.initDefault();

// RUN
(async () => {

  // TEST: Lines
  log.info('TEST: Lines');
  chip.lines();
  await sleep(1000);
  chip.erase();
  await sleep(100);

  // TEST: Zig-zag
  log.info('TEST: Zig-zag');
  const TSIZE = 8;
  const tracks = Math.floor(DISPW / TSIZE);
  for (let i = 0; i < tracks; i++){
    for (let j = 0; j < TSIZE; j++){
      const v = (i % 2) ? j : ((TSIZE - 1) - j);
      chip.drawPixel((i * TSIZE) + j, v);
    }
  }

  chip.update();
  await sleep(1000);
  chip.erase();
  await sleep(100);

  // TEST: Rectangles
  log.info('TEST: Rectangles');
  const SPACING = 2;
  const RCOUNT = Math.floor((Math.min(DISPW, DISPH) / SPACING) / 2);
  for (let i = 0; i < RCOUNT; i++) {
    const offset = i * SPACING;
    chip.drawRect(offset, offset, (DISPW - 1 - offset), (DISPH - 1 - offset), SSD1306.COLOR.INVERT);
    chip.update();
    await sleep(200);
  }

  chip.update();
  await sleep(1000);
  chip.erase();
  await sleep(100);

  // Clean up
  chip.setDisplayEnabled(false);
  await sleep(100);
  log.info('Done!');

})();
