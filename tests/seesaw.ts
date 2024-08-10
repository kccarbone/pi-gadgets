import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { Device, PinMapping } from '../src/drivers/seesaw';
import { sleep } from '../src/utils/timing';

const log = new Logger('seesaw');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;
let exited = false;

log.info('Connecting to device...');
const device = new Device(0x49);


(async () => {
  await device.getGPIOState();

  // Set output as raw GPIO
  device.setOutputGPIO(PinMapping.ATtinyXY6.PC3, false);

  // Set PWM output
  device.setOutputPWM(PinMapping.ATtinyXY6.PC1, 20, 10000);

  // Neopixel test
  // device.initNeopixels(PinMapping.ATtinyXY6.PA6, 3);
  // device.setPixel([30, 0, 0], 0);
  // device.setPixel([0, 30, 0], 1);
  // device.setPixel([0, 0, 30], 2);
  // device.showNeopixels();

  await device.getGPIOState();
})();



process.on('SIGINT', async () => {
  exited = true;
  exit(0);
});