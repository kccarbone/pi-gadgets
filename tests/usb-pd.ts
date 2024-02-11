import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const hex = (num: number) => num.toString(16).toUpperCase().padStart(2, '0');
const log = new Logger('base');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;


/* Testing HUSB238 */
enum REGISTER {
  STATUS0 = 0x00,
  STATUS1 = 0x01,
  OUTPUT_5V = 0x02,
  OUTPUT_9V = 0x03,
  OUTPUT_12V = 0x04,
  OUTPUT_15V = 0x05,
  OUTPUT_18V = 0x06,
  OUTPUT_20V = 0x07,
  OUTPUT_MODE = 0x08,
  SEND_CMD = 0x09
}

enum COMMAND {
  SELECT_OUTPUT = 0x01,
  GET_SRC_CAP = 0x04,
  RESET = 0x10
}

enum VOLTAGE {
  NONE = 0x00,
  MODE_5V = 0x01,
  MODE_9V = 0x02,
  MODE_12V = 0x03,
  MODE_15V = 0x04,
  MODE_18V = 0x05,
  MODE_20V = 0x06
}

enum CURRENT {
  MODE_0_5A = 0x00,
  MODE_0_7A = 0x01,
  MODE_1_0A = 0x02,
  MODE_1_25A = 0x03,
  MODE_1_5A = 0x04,
  MODE_1_75A = 0x05,
  MODE_2_0A = 0x06,
  MODE_2_25A = 0x07,
  MODE_2_5A = 0x08,
  MODE_2_75A = 0x09,
  MODE_3_0A = 0x0a,
  MODE_3_25A = 0x0b,
  MODE_3_5A = 0x0c,
  MODE_4_0A = 0x0d,
  MODE_4_5A = 0x0e,
  MODE_5_0A = 0x0f
}

function bitBool(byte: number, bitIndex = 0) {
  return Boolean(byte & (1 << bitIndex));
}

log.info('Connecting to device...');
const device = new BaseDevice(0x08);

(async () => {
  let result = 0;

  device.writeByte(REGISTER.SEND_CMD, COMMAND.GET_SRC_CAP);
  await sleep(800);

  // Capabilities
  result = device.readByte(REGISTER.OUTPUT_5V);
  await sleep(50);
  log.info(`5v capable? ${bitBool(result, 7)}`);
  result = device.readByte(REGISTER.OUTPUT_9V);
  await sleep(50);
  log.info(`9v capable? ${bitBool(result, 7)}`);
  result = device.readByte(REGISTER.OUTPUT_12V);
  await sleep(50);
  log.info(`12v capable? ${bitBool(result, 7)}`);
  result = device.readByte(REGISTER.OUTPUT_15V);
  await sleep(50);
  log.info(`15v capable? ${bitBool(result, 7)}`);
  result = device.readByte(REGISTER.OUTPUT_18V);
  await sleep(50);
  log.info(`18v capable? ${bitBool(result, 7)}`);
  result = device.readByte(REGISTER.OUTPUT_20V);
  await sleep(50);
  log.info(`20v capable? ${bitBool(result, 7)}`);

  // Get current mode
  log.debug('mode:');
  device.readByte(REGISTER.OUTPUT_MODE);
  await sleep(100);
  log.debug('status 1:');
  device.readByte(REGISTER.STATUS1);
  await sleep(100);
  log.debug('status 0:');
  device.readByte(REGISTER.STATUS0);
  await sleep(100);

  // Set mode
  log.debug('SET');
  device.writeByte(REGISTER.OUTPUT_MODE, VOLTAGE.MODE_9V << 4);
  await sleep(100);
  device.writeByte(REGISTER.SEND_CMD, COMMAND.SELECT_OUTPUT);
  await sleep(800);

  // Get new mode
  log.debug('mode:');
  device.readByte(REGISTER.OUTPUT_MODE);
  await sleep(100);
  log.debug('status 1:');
  device.readByte(REGISTER.STATUS1);
  await sleep(100);
  log.debug('status 0:');
  device.readByte(REGISTER.STATUS0);
  await sleep(100);

  
})().then(() => log.info('done!'));

