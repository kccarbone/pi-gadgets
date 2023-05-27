import { Logger } from 'bark-logger';
import { FL3731, SETTING, OPERATING_MODE } from '../src';
import InteractiveSession from '../src/utils/interactive';

const log = new Logger('charlie-explorer');
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const hex = (num: number) => num.toString(16).toUpperCase().padStart(2, '0');
const style = (str: string, ...codes: string[]) => `\x1b[${codes.join(';')}m${str}\x1b[0m`;

const chip = new FL3731();
let frame = 0, index = 0, bright = 0;

const session = new InteractiveSession();
//session.debug(data => log.info(`keypress: ${JSON.stringify(data)}`));

session.writeLine(`Charlieplex Explorer ${style('[FL3731]', '90')}`);
session.writeLine('');
session.writeLine(style('    \u{2B06}\u{FE0F}'));
session.writeLine(style('Brightness   \u{2B05}\u{FE0F}  Position \u{27A1}\u{FE0F}', '34'));
session.writeLine(style('    \u{2B07}\u{FE0F}'));
session.writeLine(style('ctrl+c = Quit', '90'));
session.writeLine('');
session.writeLine('Current Selection');
session.writeLine('-----------------');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');
session.writeLine('');

session.onArrowUp(() => { bright++; update(); });
session.onArrowDown(() => { bright--; update(); });
session.onArrowLeft(() => { index--; update(); });
session.onArrowRight(() => { index++; update(); });

chip.disableDevice();
chip.disableBlink();
chip.disableBreath();
chip.setModeFixed(0);
chip.enableFrame(0);
chip.enableDevice();

update();
session.begin();

function update() {
  if (index < 0) index = 0;
  if (index > 143) index = 143;
  if (bright < 0) bright = 0;
  if (bright > 255) bright = 255;

  const inner = index % 8;
  const outer = (index - inner) / 8;
  const adj = outer % 2;

  // Designator
  const d1 = ((outer - adj) / 2) + 1;
  const d2 = (inner + (adj * 8)) + 1;

  // Wire position
  const col = inner + 1;
  const row = outer + 1;
  const cathode = (row - (adj - 1)) / 2;
  const anode = col + (col >= cathode ? 1 : 0);

  // Formatting
  const matrix = adj ? 'B' : 'A';
  const color = adj ? '94' : '91';

  session.overwriteLine(`${style('Frame: ', '36')} ${frame}   `, 9);
  session.writeLine(`${style('Index: ', '36')} ${index}   `);
  session.writeLine(`${style('Byte: ', '36')} 0x${hex(index + 36)}   `);
  session.writeLine(`${style('Designator: ', '36')} C${d1}-${d2}   `);
  session.writeLine(`${style('Anode: ', '36')} ${style(`C${matrix}${anode}`, color)}   `);
  session.writeLine(`${style('Cathode: ', '36')} ${style(`C${matrix}${cathode}`, color)}   `);
  session.writeLine(`${style('Brightness: ', '36')} ${bright}   `);
  session.writeLine('');
  session.writeLine(`[${style('Updating', '33')}]       `);

  chip.clearFrame(frame);
  chip.setChannel(frame, index, bright);

  session.overwriteLine(`[${style('Ready', '32')}]       `);
}