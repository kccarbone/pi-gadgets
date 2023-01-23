import { BaseDevice } from "../src";
import { Logger, Levels, config } from "bark-logger";

const MODE_REGISTER = 0x00;
const ENABLE_REGISTER = 0x13;
const APPLY_REGISTER = 0x16;

const log = new Logger('piglow-test');
config.threshold = Levels.TRACE;

log.info('Starting test');
const piglow = new BaseDevice(0x54);

piglow.writeByte(MODE_REGISTER, 1);
piglow.writeBlock(ENABLE_REGISTER, [0b00111111, 0b00111111, 0b00111111]);

piglow.writeByte(12, 0);

piglow.writeByte(APPLY_REGISTER, 0xFF);

log.debug('done!');