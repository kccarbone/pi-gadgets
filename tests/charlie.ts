import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731 } from '../src';
const { Device, SETTING } = FL3731;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('charlie');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

if (argv.length > 2) {
  config.threshold = Levels.INFO;
}

log.error(`test ${JSON.stringify(argv)}`);

log.info('Starting test');
const chip = new Device();

log.info('setting mode');
chip.disableDevice();
sleep(100).then(async () => {

  // Global settings
  chip.disableBlink();
  chip.disableBreath();
  chip.setModeFixed(0);

  // Frame 0
  chip.enableFrame(0);

  if (argv.length === 3 && argv[2].toUpperCase() === 'OFF') {
    log.info('Clearing frame 0');
    chip.clearFrame(0);
  }

  if (argv.length > 3) {
    const chan = parseInt(argv[2]);
    const pwm = parseInt(argv[3]);
    log.info(`Setting channel ${chan} to ${pwm}`);
    chip.setChannel(0, chan, pwm);
  }
  else {
    chip.fillFrame(0, 30);
    chip.enableBreath(6, 6, 4);
    chip.setModeAutoPlay(0, 1);
  }

  
  chip.enableDevice();

  
  //chip.readSetting(SETTING.SHUTDOWN);

  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);
  //chip.writeSetting(SETTING.AUTO_PLAY_DELAY, 5);
  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);

  log.debug('done!');
});
