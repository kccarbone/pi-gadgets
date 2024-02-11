import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { SSD1306 } from '../src';
//import fonts from 'oled-font-pack';
const fonts: any = {};

const { Device } = SSD1306;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('oled-text');
config.threshold = env.LOGLEVEL ?? Levels.DEBUG;

function getFont(fontName: string) {
  try {
    const found = fonts[fontName] as SSD1306.Font;
    
    if (!found)
      throw new Error('Font not found');

    return found;
  }
  catch (err) {
    log.error(`Unable to load font '${fontName}': ${err}`);
    return fonts.oled_5x7 as SSD1306.Font;
  }
}

log.info('Starting test');
const chip = new Device(128, 32);

log.info('initializing...');
chip.initDefault();


log.info('fetching fonts');
const testFonts = {
  small: getFont('oled_5x7'),
  normal: getFont('small_6x8'),
  tall: getFont('retro_8x16'),
  styled: getFont('nadianne_16x16'),
  large: getFont('big_16x16'),
  largeBold: getFont('arial_bold_16x16'),
  largeItalic: getFont('arial_italic_16x16'),
  huge: getFont('arial_round_16x24'),
  pixels: getFont('dot_matrix_medium_16x22'),
  sevenSeg: getFont('medium_numbers_12x16'),
  sevenSegLarge: getFont('big_numbers_14x24')
};


(async () => {

  log.info('writing text...');
  chip.erase();
  chip.drawText(0, 0, 'Hello!', testFonts.large, 2);
  chip.update();
  await sleep(1000);

  log.info('inverting text...');
  chip.erase();
  chip.drawRect(0, 0, 96, 16);
  chip.drawText(0, 0, 'Hello!', testFonts.large, 2);
  chip.update();
  await sleep(1000);

  log.info('flipping text...');
  chip.erase();
  chip.setDisplayOrientation(1);
  chip.drawRect(0, 0, 96, 16);
  chip.drawText(0, 0, 'Hello!', testFonts.large, 2);
  chip.update();
  await sleep(1000);

  log.info('fixing text...');
  chip.erase();
  chip.drawText(0, 0, 'Hello!', testFonts.large, 2);
  chip.update();
  await sleep(1000);

  chip.erase();

})();