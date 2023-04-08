import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { SSD1306 } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('oled');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

log.info('Starting test');
const chip = new SSD1306();

log.info('initializing...');
chip.init();

