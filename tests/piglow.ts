import { env } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { BaseDevice } from '../src';

const MODE_REGISTER = 0x00;
const ENABLE_REGISTER = 0x13;
const APPLY_REGISTER = 0x16;
const RESET_REGISTER = 0x17;

const log = new Logger('piglow-test');
config.threshold = env.LOGLEVEL ?? Levels.TRACE;

log.info('Starting test');
const piglow = new BaseDevice(0x54);

piglow.writeByte(RESET_REGISTER, 1);
piglow.writeByte(MODE_REGISTER, 1);
piglow.writeBlock(ENABLE_REGISTER, [0b00111111, 0b00111111, 0b00111111]);

piglow.writeBlock(1, [0, 0, 0, 0, 0, 0]);
piglow.writeBlock(7, [0, 0, 0, 0, 0, 0]);
piglow.writeBlock(13, [0, 0, 0, 0, 0, 0]);
piglow.writeByte(12, 10);
piglow.writeByte(4, 10);
piglow.writeByte(9, 30);
piglow.writeByte(1, 30);

piglow.writeByte(APPLY_REGISTER, 0xFF);

log.debug('done!');