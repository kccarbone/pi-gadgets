import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731, SETTING, OPERATING_MODE } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('charlie');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

log.info('Starting test');
const chip = new FL3731();

log.info('setting mode');
chip.disableDevice();
sleep(100).then(() => {
  chip.enableDevice();
  chip.setOperatingMode(OPERATING_MODE.FIXED);
  chip.enableFrame(0);
  chip.setLed(0, 16, 35);
  chip.setLed(0, 143, 100);
  chip.displayFrame(0);
  
  chip.readSetting(SETTING.SHUTDOWN);

  chip.readSetting(SETTING.AUTO_PLAY_DELAY);
  chip.writeSetting(SETTING.AUTO_PLAY_DELAY, 43);
  chip.readSetting(SETTING.AUTO_PLAY_DELAY);

  log.debug('done!');
});
