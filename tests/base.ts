import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const hex = (num: number) => num.toString(16).toUpperCase().padStart(2, '0');
const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;


log.info('Connecting to device...');
const device = new BaseDevice(0x36);

// Async testing
(async () => {

  for (let i = 0; i < 3; i++) {
    const soc = device.readBlock(0x04, 2);
    log.info(`State of Charge: ${soc[0]}.${soc[1]}% (raw=0x${hex(soc[0])} 0x${hex(soc[1])})`);
    await sleep(1000);
  }

})();

