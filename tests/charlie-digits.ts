import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { FL3731 } from '../src';
import { sleep } from '../src/utils/timing';
const { Device, SETTING } = FL3731;

const log = new Logger('charlie-digits');
config.threshold = env.LOGLEVEL ?? Levels.INFO;

// Mapping for DigiGlow test board
const ledMap = [
  [8, 24, 40, 56, 72],
  [9, 25, 41, 57, 73],
  [10, 26, 42, 58, 74],
  [11, 27, 43, 59, 75],
  [12, 28, 44, 60, 76],
  [13, 29, 45, 61, 77],
  [14, 30, 46, 62, 78]
];
const testBri = 80;

const chip = new Device();

// Startup sequence
chip.disableDevice();
chip.disableBlink();
chip.disableBreath();
chip.setModeFixed(0);
chip.enableFrame(0);
chip.enableFrame(1);
chip.enableFrame(2);
chip.enableFrame(3);
chip.enableFrame(4);
chip.enableFrame(5);
chip.enableFrame(6);
chip.enableFrame(7);

// Test pattern
chip.setChannel(0, ledMap[3][0], testBri);
chip.setChannel(0, ledMap[3][1], testBri);
chip.setChannel(0, ledMap[3][2], testBri);
chip.setChannel(0, ledMap[3][3], testBri);
chip.setChannel(0, ledMap[3][4], testBri);

chip.setChannel(1, ledMap[2][0], testBri);
chip.setChannel(1, ledMap[2][1], testBri);
chip.setChannel(1, ledMap[2][2], testBri);
chip.setChannel(1, ledMap[2][3], testBri);
chip.setChannel(1, ledMap[2][4], testBri);

chip.setChannel(1, ledMap[4][0], testBri);
chip.setChannel(1, ledMap[4][1], testBri);
chip.setChannel(1, ledMap[4][2], testBri);
chip.setChannel(1, ledMap[4][3], testBri);
chip.setChannel(1, ledMap[4][4], testBri);

chip.setChannel(2, ledMap[1][0], testBri);
chip.setChannel(2, ledMap[1][1], testBri);
chip.setChannel(2, ledMap[1][2], testBri);
chip.setChannel(2, ledMap[1][3], testBri);
chip.setChannel(2, ledMap[1][4], testBri);

chip.setChannel(2, ledMap[5][0], testBri);
chip.setChannel(2, ledMap[5][1], testBri);
chip.setChannel(2, ledMap[5][2], testBri);
chip.setChannel(2, ledMap[5][3], testBri);
chip.setChannel(2, ledMap[5][4], testBri);

chip.setChannel(3, ledMap[0][0], testBri);
chip.setChannel(3, ledMap[0][1], testBri);
chip.setChannel(3, ledMap[0][2], testBri);
chip.setChannel(3, ledMap[0][3], testBri);
chip.setChannel(3, ledMap[0][4], testBri);

chip.setChannel(3, ledMap[6][0], testBri);
chip.setChannel(3, ledMap[6][1], testBri);
chip.setChannel(3, ledMap[6][2], testBri);
chip.setChannel(3, ledMap[6][3], testBri);
chip.setChannel(3, ledMap[6][4], testBri);

// Start it up!
chip.setModeAutoPlay(0, 4, 1);
chip.enableBreath(0, 4);
chip.enableDevice();

