import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;


log.info('Connecting to device...');
const device = new BaseDevice(0x36);


//device.readBlock(0x02, 2);


log.info('Done!');


