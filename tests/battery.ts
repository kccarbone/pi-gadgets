import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';


const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const log = new Logger('battery');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;


function twoByteSigned(bytes: number[]) {
  if (bytes[0] & 0x80) {
    return (0xffff0000 | (bytes[0] << 8) | bytes[1]);
  }

  return ((bytes[0] << 8) | bytes[1]);
}


log.info('Connecting to MAX17048...');
const device = new BaseDevice(0x36);


// Read voltage
const vData = device.readBlock(0x02, 2);
const vValue = (vData[0] << 8) | vData[1];
const voltage = vValue * 0.00007812;

log.info(`Current voltage: ${voltage} (raw=${vValue})`);


// Read SOC
const sData = device.readBlock(0x04, 2);
const soc = sData[0] / 256;

log.info(`State of Charge: ${soc} (raw=${sData[0]})`);

// Read charge rate
const dData = device.readBlock(0x16, 2);
const calced = twoByteSigned(dData);

log.info(`Charge rate: ${(calced * .208)} (raw=${calced})`);


// Read hibernate
const hData = device.readBlock(0x0A, 2);
const hThresh = hData[0] * .208;
const actThresh = hData[1] * 1.25;

log.info(`Hibernate threshold: ${hThresh}%/hr, Activate threshold: ${actThresh}mV`);

const mode = device.readBlock(0x06, 2);
log.info(`mode: ${mode[0].toString(2).padStart(8, '0')}`);

const conf = device.readBlock(0x0c, 2);
log.info(`config: ${conf[0].toString(2).padStart(8, '0')} ${conf[1].toString(2).padStart(8, '0')}`);

const stat = device.readBlock(0x1a, 2);
log.info(`status: ${stat[0].toString(2).padStart(8, '0')}`);

device.readBlock(0x08, 2);
device.readBlock(0x0a, 2);

// Disable hibernate
//device.writeBlock(0x0a, [0x00, 0x00]);

// Clear alerts
//device.writeBlock(0x1a, [0x00, 0x00]);

// Reset
//device.writeBlock(0xFE, [0x54, 0x00]);

log.info('Done!');

