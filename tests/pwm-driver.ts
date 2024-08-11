import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { Device } from '../src/drivers/PCA9685';
import { setBit } from '../src/utils/bytelib';
import { bin } from '../src/utils/formatting';

const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

/*
 * Test of PCA9685 pwm driver IC
*/

enum REGISTER {
  MODE1 = 0x00,
  MODE2 = 0x01,
  SUBADR1 = 0x02,
  SUBADR2 = 0x03,
  SUBADR3 = 0x04,
  ALLCALL = 0x05
}

log.info('Connecting to device...');
const device = new Device();

// Configure output
device.setInternalPull(false);
device.setInvert(true);
device.setDisabledDriveMode(2);
device.enable();

device.setGamma(2.5);

device.updateAllOutputs(10);
//device.updateOutput(9, 100);
//device.updateOutput(10, 100);
//device.updateOutput(11, 5);
//device.updateOutput(12, 0.5);
//device.updateOutput(13, 1.2);
//device.updateOutput(14, 0.8);
//device.updateOutput(15, 1);

