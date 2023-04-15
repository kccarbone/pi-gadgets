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
sleep(100).then(async () => {

  // Frame 0
  chip.enableFrame(0);
  chip.setChannel(0, 16, 35);
  chip.setChannel(0, 17, 45);
  chip.setChannel(0, 18, 55);
  chip.setBlink(0, 16, true);
  chip.setBlink(0, 50, true);

  // Frame 1
  chip.enableFrame(1);
  chip.setChannel(1, 66, 80);
  chip.setChannel(1, 67, 80);
  chip.setChannel(1, 68, 80);
  
  // Global settings
  //chip.disableBlink();
  //chip.disableBreath();
  chip.enableBlink(7);
  chip.enableBreath(6, 3);
  chip.setModeAutoPlay(0, 2);
  chip.enableDevice();

  
  //chip.readSetting(SETTING.SHUTDOWN);

  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);
  //chip.writeSetting(SETTING.AUTO_PLAY_DELAY, 5);
  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);

  log.debug('done!');
});
