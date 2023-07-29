import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { SSD1306 } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('oled');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

log.info('Starting test');
const chip = new SSD1306(128, 32);

log.info('initializing...');
chip.init();

log.info('test');

for (let i = 0; i < 4; i++){
  for (let j = 0; j < 32; j++){
    const v = (i % 2) ? j : (31 - j);
    chip.drawPixel((i * 32) + j, v);
  }
}


chip.update();

