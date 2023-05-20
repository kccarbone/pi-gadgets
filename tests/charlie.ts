import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731, SETTING, OPERATING_MODE } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('charlie');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

if (argv.length > 2) {
  config.threshold = Levels.INFO;
}

log.error(`test ${JSON.stringify(argv)}`);

log.info('Starting test');
const chip = new FL3731();

log.info('setting mode');
chip.disableDevice();
sleep(100).then(async () => {

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

  
  // Global settings
  chip.disableBlink();
  chip.disableBreath();
  chip.setModeFixed(0);
  chip.enableDevice();

  
  //chip.readSetting(SETTING.SHUTDOWN);

  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);
  //chip.writeSetting(SETTING.AUTO_PLAY_DELAY, 5);
  //chip.readSetting(SETTING.AUTO_PLAY_DELAY);

  log.debug('done!');
});
