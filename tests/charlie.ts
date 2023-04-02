import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731, SETTING, OPERATING_MODE } from '../src';



const log = new Logger('charlie');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

log.info('Starting test');
const chip = new FL3731();

log.info('setting mode');
chip.setOperatingMode(OPERATING_MODE.FIXED);
chip.enableFrame(0);

log.debug('done!');