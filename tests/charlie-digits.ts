import { env, argv, exit } from 'node:process';
import { Logger, Levels, config } from 'bark-logger';
import { sleep } from '../src/utils/timing';
//import fonts from 'oled-font-pack';
const fonts: any = {};
import { FL3731 } from '../src';
const { Device, SETTING } = FL3731;

const log = new Logger('charlie-digits');
config.threshold = env.LOGLEVEL ?? Levels.INFO;

const chip = new Device();
const font = fonts.oled_5x7;
const testBri = 80;

// Mapping for DigiGlow test board
const ledMap = [
  [8, 9, 10, 11, 12, 13, 14],
  [24, 25, 26, 27, 28, 29, 30],
  [40, 41, 42, 43, 44, 45, 46],
  [56, 57, 58, 59, 60, 61, 62],
  [72, 73, 74, 75, 76, 77, 78]
];

// Digit function
function printDigit(frame: number, letter: string, mapping: number[][], brightess: number) {
  // TODO: validate that the chosen font fits inside the mapping
  // TODO: validate that letter exists in font
  const offset = (font.lookup.indexOf(letter) * font.width);
  const glyph = font.fontData.slice(offset, (offset + font.width));

  for (let x = 0; x < font.width; x++) {
    for (let y = 0; y < font.height; y++) {
      const active = !!(glyph[x] & (1 << y));
      chip.setChannel(frame, mapping[x][y], (active ? brightess : 0));
    }
  }
}

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
chip.enableDevice();

// Clear condition
if (argv.length > 2 && argv[2].toUpperCase() === 'OFF') {
  log.info('Device off');
  exit(0);
}

// Test pattern
chip.setChannel(7, ledMap[0][0], testBri);
chip.setChannel(7, ledMap[0][1], testBri);
chip.setChannel(7, ledMap[1][2], testBri);
chip.setChannel(7, ledMap[2][3], testBri);
chip.setChannel(7, ledMap[3][4], testBri);
chip.setChannel(7, ledMap[4][5], testBri);
chip.setChannel(7, ledMap[4][6], testBri);

printDigit(0, 'A', ledMap, testBri);
printDigit(1, 'B', ledMap, testBri);
printDigit(2, 'C', ledMap, testBri);
printDigit(3, 'D', ledMap, testBri);

// Start it up!
chip.setModeAutoPlay(0, 4, 1);
chip.enableBreath(0, 4);

